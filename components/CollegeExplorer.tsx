"use client";

import type { College } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import CollegeCard from "@/components/CollegeCard";
import CollegeGridSkeleton from "@/components/CollegeGridSkeleton";

type ApiError = {
  message?: string;
};

type CollegesMeta = {
  locations: string[];
  fees: {
    min: number;
    max: number;
  };
};

type CollegesQuery = {
  search: string;
  location: string;
  minFees: string;
  maxFees: string;
};

type SavedIdsResponse = {
  ids: number[];
};

const PAGE_SIZE = 9;

async function fetchMeta(signal?: AbortSignal) {
  const res = await fetch("/api/colleges/meta", { method: "GET", signal });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || "Failed to load filters");
  }

  return (await res.json()) as CollegesMeta;
}

async function fetchColleges(
  query: CollegesQuery,
  paging: { limit: number; offset: number },
  signal?: AbortSignal
) {
  const params = new URLSearchParams();
  if (query.search.trim()) params.set("search", query.search.trim());
  if (query.location.trim()) params.set("location", query.location.trim());
  if (query.minFees.trim()) params.set("minFees", query.minFees.trim());
  if (query.maxFees.trim()) params.set("maxFees", query.maxFees.trim());

  params.set("limit", String(paging.limit));
  params.set("offset", String(paging.offset));

  const res = await fetch(`/api/colleges?${params.toString()}`, {
    method: "GET",
    signal,
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || "Something went wrong");
  }

  return (await res.json()) as College[];
}

async function fetchSavedIds(signal?: AbortSignal) {
  const res = await fetch("/api/saved/ids", { method: "GET", signal });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || "Failed to load saved colleges");
  }

  return (await res.json()) as SavedIdsResponse;
}

async function saveCollege(collegeId: number) {
  const res = await fetch("/api/saved", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collegeId }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || "Failed to save college");
  }
}

async function unsaveCollege(collegeId: number) {
  const res = await fetch(`/api/saved/${collegeId}`, { method: "DELETE" });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || "Failed to unsave college");
  }
}

export default function CollegeExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryFromUrl = useMemo<CollegesQuery>(() => {
    return {
      search: (searchParams.get("search") ?? "").trim(),
      location: (searchParams.get("location") ?? "").trim(),
      minFees: (searchParams.get("minFees") ?? "").trim(),
      maxFees: (searchParams.get("maxFees") ?? "").trim(),
    };
  }, [searchParams]);

  // Input state is separate from the URL param so user can type freely.
  const [searchInput, setSearchInput] = useState(queryFromUrl.search);
  const [locationInput, setLocationInput] = useState(queryFromUrl.location);
  const [minFeesInput, setMinFeesInput] = useState(queryFromUrl.minFees);
  const [maxFeesInput, setMaxFeesInput] = useState(queryFromUrl.maxFees);

  const [meta, setMeta] = useState<CollegesMeta | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [savingIds, setSavingIds] = useState<number[]>([]);

  const [formError, setFormError] = useState<string | null>(null);

  // Keep input in sync if user navigates with back/forward.
  useEffect(() => {
    setSearchInput(queryFromUrl.search);
    setLocationInput(queryFromUrl.location);
    setMinFeesInput(queryFromUrl.minFees);
    setMaxFeesInput(queryFromUrl.maxFees);
  }, [queryFromUrl]);

  // Fetch meta once (locations + fee range).
  useEffect(() => {
    const controller = new AbortController();
    setMetaError(null);

    fetchMeta(controller.signal)
      .then((data) => setMeta(data))
      .catch((err) => {
        if (controller.signal.aborted) return;
        setMetaError(err instanceof Error ? err.message : "Failed to load filters");
      });

    return () => controller.abort();
  }, []);

  // Fetch when URL query changes.
  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setIsLoadingMore(false);
    setHasMore(true);
    setError(null);

    fetchColleges(queryFromUrl, { limit: PAGE_SIZE, offset: 0 }, controller.signal)
      .then((data) => {
        setColleges(data);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to load colleges");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [queryFromUrl]);

  async function onLoadMore() {
    if (isLoadingMore || isLoading || error || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextOffset = colleges.length;
      const next = await fetchColleges(queryFromUrl, {
        limit: PAGE_SIZE,
        offset: nextOffset,
      });

      setColleges((prev) => [...prev, ...next]);
      setHasMore(next.length === PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more colleges");
    } finally {
      setIsLoadingMore(false);
    }
  }

  // Fetch saved ids once per session.
  useEffect(() => {
    const controller = new AbortController();

    fetchSavedIds(controller.signal)
      .then((data) => setSavedIds(Array.isArray(data.ids) ? data.ids : []))
      .catch(() => {
        // If this fails, we just show all as not-saved.
        setSavedIds([]);
      });

    return () => controller.abort();
  }, []);

  async function onToggleSaved(collegeId: number, nextSaved: boolean) {
    if (savingIds.includes(collegeId)) return;

    setSavingIds((prev) => [...prev, collegeId]);
    try {
      if (nextSaved) {
        await saveCollege(collegeId);
        setSavedIds((prev) => (prev.includes(collegeId) ? prev : [...prev, collegeId]));
      } else {
        await unsaveCollege(collegeId);
        setSavedIds((prev) => prev.filter((id) => id !== collegeId));
      }
    } catch (err) {
      // Keep college list intact; show a lightweight error message.
      setError(err instanceof Error ? err.message : "Failed to update saved colleges");
    } finally {
      setSavingIds((prev) => prev.filter((id) => id !== collegeId));
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setFormError(null);

    // Basic validation: if both fees exist, min should not be greater than max.
    const minNum = minFeesInput.trim() ? Number(minFeesInput) : null;
    const maxNum = maxFeesInput.trim() ? Number(maxFeesInput) : null;
    if (
      minNum !== null &&
      maxNum !== null &&
      Number.isFinite(minNum) &&
      Number.isFinite(maxNum) &&
      minNum > maxNum
    ) {
      setFormError("Minimum fees cannot be greater than maximum fees.");
      return;
    }

    const params = new URLSearchParams();
    if (searchInput.trim()) params.set("search", searchInput.trim());
    if (locationInput.trim()) params.set("location", locationInput.trim());
    if (minFeesInput.trim()) params.set("minFees", minFeesInput.trim());
    if (maxFeesInput.trim()) params.set("maxFees", maxFeesInput.trim());

    // This updates the URL (shareable link) and triggers refetch.
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          College Discovery Platform
        </h1>
        <p className="text-sm text-gray-600">
          Search colleges by name, location, or overview.
        </p>
      </div>

      {/* Search + Filters */}
      <form onSubmit={onSubmit} className="mt-6">
        <div className="grid gap-3 sm:grid-cols-12 sm:items-end">
          <div className="sm:col-span-6">
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Search
            </label>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search: IIT, Delhi, placements..."
              className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
              aria-label="Search colleges"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Location
            </label>
            <select
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="w-full rounded-lg border bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
              aria-label="Filter by location"
            >
              <option value="">All locations</option>
              {meta?.locations?.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            {metaError ? (
              <p className="mt-1 text-xs text-gray-600">{metaError}</p>
            ) : null}
          </div>

          <div className="sm:col-span-3">
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Fees range
            </label>
            <div className="flex gap-2">
              <input
                inputMode="numeric"
                value={minFeesInput}
                onChange={(e) => setMinFeesInput(e.target.value)}
                placeholder={meta ? `Min (≥ ${meta.fees.min})` : "Min"}
                className="w-full rounded-lg border px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                aria-label="Minimum fees"
              />
              <input
                inputMode="numeric"
                value={maxFeesInput}
                onChange={(e) => setMaxFeesInput(e.target.value)}
                placeholder={meta ? `Max (≤ ${meta.fees.max})` : "Max"}
                className="w-full rounded-lg border px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                aria-label="Maximum fees"
              />
            </div>
          </div>

          <div className="sm:col-span-12">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {formError ? (
                  <p className="text-sm text-red-600">{formError}</p>
                ) : null}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg border bg-black px-4 py-3 text-sm font-medium text-white hover:bg-black/90"
                >
                  Apply
                </button>

                <button
                  type="button"
                  className="rounded-lg border px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setSearchInput("");
                    setLocationInput("");
                    setMinFeesInput("");
                    setMaxFeesInput("");
                    setFormError(null);
                    router.push("/");
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Results */}
      <div id="colleges" className="mt-8 scroll-mt-24">
        {isLoading ? (
          <CollegeGridSkeleton />
        ) : error ? (
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm font-medium text-gray-900">Could not load colleges</p>
            <p className="mt-1 text-sm text-gray-600">{error}</p>
            <button
              type="button"
              className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              onClick={() => {
                // Re-trigger fetch by pushing the same URL.
                // (Our data fetch depends on URL query params.)
                const current = `${window.location.pathname}${window.location.search}`;
                router.push(current || "/");
              }}
            >
              Retry
            </button>
          </div>
        ) : colleges.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-sm text-gray-700">
            No colleges found
            {queryFromUrl.search ? ` for "${queryFromUrl.search}"` : ""}.
            {queryFromUrl.location ? ` in ${queryFromUrl.location}` : ""}.
            .
          </div>
        ) : (
          <div>
            <div className="grid gap-6 md:grid-cols-3">
              {colleges.map((college) => (
                <CollegeCard
                  key={college.id}
                  college={college}
                  isSaved={savedIds.includes(college.id)}
                  isSaving={savingIds.includes(college.id)}
                  onToggleSaved={onToggleSaved}
                />
              ))}
            </div>

            {hasMore ? (
              <div className="mt-6 flex items-center justify-center">
                <button
                  type="button"
                  className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                  disabled={isLoadingMore}
                  onClick={onLoadMore}
                >
                  {isLoadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            ) : null}

            {isLoadingMore ? (
              <div className="mt-6">
                <CollegeGridSkeleton count={3} />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
