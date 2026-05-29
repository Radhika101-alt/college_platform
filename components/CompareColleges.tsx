"use client";

import type { College } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ApiError = {
  message?: string;
};

type CollegeOption = {
  id: number;
  name: string;
  location: string;
};

function parseIds(raw: string | null) {
  if (!raw) return [];

  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const ids = parts
    .map((p) => Number(p))
    .filter((n) => Number.isFinite(n))
    .map((n) => Math.floor(n));

  const unique: number[] = [];
  for (const id of ids) {
    if (id <= 0) continue;
    if (!unique.includes(id)) unique.push(id);
  }

  return unique.slice(0, 4);
}

async function fetchOptions(signal?: AbortSignal) {
  const res = await fetch("/api/colleges/options", { method: "GET", signal });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || "Failed to load colleges list");
  }
  return (await res.json()) as CollegeOption[];
}

async function fetchComparison(ids: number[], signal?: AbortSignal) {
  const params = new URLSearchParams();
  params.set("ids", ids.join(","));

  const res = await fetch(`/api/colleges/compare?${params.toString()}`, {
    method: "GET",
    signal,
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || "Failed to compare colleges");
  }

  return (await res.json()) as College[];
}

function CompareSkeleton() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
      <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-gray-200" />
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-12 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
      <div className="mt-8 h-64 animate-pulse rounded-xl bg-gray-200" />
    </section>
  );
}

export default function CompareColleges() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const idsFromUrl = useMemo(() => {
    return parseIds(searchParams.get("ids"));
  }, [searchParams]);

  const [options, setOptions] = useState<CollegeOption[]>([]);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // We expose up to 4 slots, but require at least 2 selected to compare.
  const [selectedIds, setSelectedIds] = useState<number[]>(idsFromUrl);

  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep local selection in sync with URL (back/forward).
  useEffect(() => {
    setSelectedIds(idsFromUrl);
  }, [idsFromUrl]);

  // Load dropdown options.
  useEffect(() => {
    const controller = new AbortController();
    setOptionsError(null);

    fetchOptions(controller.signal)
      .then((data) => setOptions(data))
      .catch((err) => {
        if (controller.signal.aborted) return;
        setOptionsError(err instanceof Error ? err.message : "Failed to load colleges list");
      });

    return () => controller.abort();
  }, []);

  // Fetch comparison whenever selected IDs change (via URL).
  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    if (selectedIds.length < 2) {
      setColleges([]);
      setIsLoading(false);
      return;
    }

    fetchComparison(selectedIds, controller.signal)
      .then((data) => setColleges(data))
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to compare colleges");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [selectedIds]);

  function updateUrl(nextIds: number[]) {
    const params = new URLSearchParams();
    if (nextIds.length > 0) params.set("ids", nextIds.join(","));
    const query = params.toString();
    router.push(query ? `/compare?${query}` : "/compare");
  }

  function setSlot(slotIndex: number, idOrEmpty: string) {
    const id = idOrEmpty ? Number(idOrEmpty) : null;
    const next = [...selectedIds];

    // Ensure array has enough slots.
    while (next.length < 4) next.push(0);

    next[slotIndex] = id && Number.isFinite(id) ? Math.floor(id) : 0;

    // Remove zeros + duplicates while preserving order.
    const cleaned: number[] = [];
    for (const value of next) {
      if (!value) continue;
      if (!cleaned.includes(value)) cleaned.push(value);
    }

    updateUrl(cleaned);
  }

  function removeId(id: number) {
    updateUrl(selectedIds.filter((x) => x !== id));
  }

  // Render helper: show selected ids in 4 slots.
  const slots = useMemo(() => {
    const filled = [...selectedIds];
    while (filled.length < 4) filled.push(0);
    return filled.slice(0, 4);
  }, [selectedIds]);

  if (!options.length && isLoading) return <CompareSkeleton />;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Compare Colleges</h1>
        <p className="text-sm text-gray-600">
          Select 2 to 4 colleges to compare fees, ratings, and placements.
        </p>
      </div>

      {/* Selectors */}
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {slots.map((value, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">College {idx + 1}</label>
            <select
              value={value ? String(value) : ""}
              onChange={(e) => setSlot(idx, e.target.value)}
              className="w-full rounded-lg border bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
              aria-label={`Select college ${idx + 1}`}
            >
              <option value="">Select a college</option>
              {options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name} ({opt.location})
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {optionsError ? (
        <div className="mt-4 rounded-xl border bg-white p-4">
          <p className="text-sm font-medium text-gray-900">Could not load colleges list</p>
          <p className="mt-1 text-sm text-gray-600">{optionsError}</p>
        </div>
      ) : null}

      {/* Selected chips */}
      {selectedIds.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedIds.map((id) => {
            const label = options.find((o) => o.id === id)?.name ?? `College #${id}`;
            return (
              <button
                key={id}
                type="button"
                className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => removeId(id)}
                aria-label={`Remove ${label} from compare`}
                title={label}
              >
                <span className="max-w-[14rem] truncate">{label}</span>
                <span className="text-gray-500">×</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Comparison */}
      <div className="mt-8">
        {isLoading ? (
          <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
        ) : error ? (
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm font-medium text-gray-900">Could not compare colleges</p>
            <p className="mt-1 text-sm text-gray-600">{error}</p>
          </div>
        ) : selectedIds.length < 2 ? (
          <div className="rounded-xl border bg-white p-6 text-sm text-gray-700">
            Pick at least 2 colleges to see a comparison.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-900">Field</th>
                  {colleges.map((c) => (
                    <th key={c.id} className="px-4 py-3 font-semibold text-gray-900">
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium text-gray-900">Location</td>
                  {colleges.map((c) => (
                    <td key={c.id} className="px-4 py-3 text-gray-700">
                      {c.location}
                    </td>
                  ))}
                </tr>

                <tr className="border-t">
                  <td className="px-4 py-3 font-medium text-gray-900">Fees</td>
                  {colleges.map((c) => (
                    <td key={c.id} className="px-4 py-3 text-gray-700">
                      ₹{c.fees}
                    </td>
                  ))}
                </tr>

                <tr className="border-t">
                  <td className="px-4 py-3 font-medium text-gray-900">Rating</td>
                  {colleges.map((c) => (
                    <td key={c.id} className="px-4 py-3 text-gray-700">
                      ⭐ {c.rating}
                    </td>
                  ))}
                </tr>

                <tr className="border-t">
                  <td className="px-4 py-3 font-medium text-gray-900">Overview</td>
                  {colleges.map((c) => (
                    <td key={c.id} className="px-4 py-3 text-gray-700">
                      <p className="line-clamp-6 leading-6">{c.overview}</p>
                    </td>
                  ))}
                </tr>

                <tr className="border-t">
                  <td className="px-4 py-3 font-medium text-gray-900">Placements</td>
                  {colleges.map((c) => (
                    <td key={c.id} className="px-4 py-3 text-gray-700">
                      <p className="line-clamp-6 leading-6">{c.placements}</p>
                    </td>
                  ))}
                </tr>

                <tr className="border-t">
                  <td className="px-4 py-3 font-medium text-gray-900">Image</td>
                  {colleges.map((c) => (
                    <td key={c.id} className="px-4 py-3">
                      <img
                        src={c.image}
                        alt={c.name}
                        className="h-16 w-28 rounded-md object-cover"
                        loading="lazy"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
