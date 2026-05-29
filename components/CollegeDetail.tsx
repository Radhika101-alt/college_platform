"use client";

import type { College } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";

type ApiError = {
  message?: string;
};

type Props = {
  id: number;
};

type SavedIdsResponse = {
  ids: number[];
};

async function fetchCollege(id: number, signal?: AbortSignal) {
  const res = await fetch(`/api/colleges/${id}`, { method: "GET", signal });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    const message = data?.message || "Failed to load college";
    const error = new Error(message);
    (error as any).status = res.status;
    throw error;
  }

  return (await res.json()) as College;
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

function DetailSkeleton() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 h-9 w-3/4 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-200" />

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="h-72 w-full animate-pulse rounded-xl bg-gray-200" />
        <div className="rounded-xl border bg-white p-4">
          <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </section>
  );
}

export default function CollegeDetail({ id }: Props) {
  const [college, setCollege] = useState<College | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setError(null);
    setNotFound(false);

    fetchCollege(id, controller.signal)
      .then((data) => setCollege(data))
      .catch((err) => {
        if (controller.signal.aborted) return;
        const status = (err as any)?.status;
        if (status === 404) {
          setNotFound(true);
          setCollege(null);
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load college");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();

    fetchSavedIds(controller.signal)
      .then((data) => {
        const ids = Array.isArray(data.ids) ? data.ids : [];
        setIsSaved(ids.includes(id));
      })
      .catch(() => {
        setIsSaved(false);
      });

    return () => controller.abort();
  }, [id]);

  async function onToggleSaved() {
    if (isSaving) return;

    setIsSaving(true);
    try {
      if (!isSaved) {
        await saveCollege(id);
        setIsSaved(true);
      } else {
        await unsaveCollege(id);
        setIsSaved(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update saved colleges");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <DetailSkeleton />;

  if (notFound) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-sm text-gray-600">College not found.</p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Back to colleges
        </Link>
      </section>
    );
  }

  if (error || !college) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-sm font-medium text-gray-900">Something went wrong</p>
        <p className="mt-1 text-sm text-gray-600">{error ?? "Please try again."}</p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
          <Link
            href="/"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Back
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
        ← Back
      </Link>

      <div className="mt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {college.name}
            </h1>
            <p className="mt-1 text-sm text-gray-600">{college.location}</p>
          </div>

          <button
            type="button"
            className={
              "h-10 rounded-lg border px-4 text-sm font-medium " +
              (isSaved
                ? "bg-black text-white hover:bg-black/90"
                : "bg-white text-gray-800 hover:bg-gray-50")
            }
            aria-pressed={isSaved}
            disabled={isSaving}
            onClick={onToggleSaved}
          >
            {isSaving ? "..." : isSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl border bg-white">
          <img
            src={college.image}
            alt={college.name}
            className="h-72 w-full object-cover"
          />
          <div className="p-4">
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border px-3 py-1 text-gray-700">
                Fees: ₹{college.fees}
              </span>
              <span className="rounded-full border px-3 py-1 text-gray-700">
                Rating: ⭐ {college.rating}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-base font-semibold">Overview</h2>
          <p className="mt-2 text-sm leading-6 text-gray-700">
            {college.overview}
          </p>

          <h2 className="mt-6 text-base font-semibold">Placements</h2>
          <p className="mt-2 text-sm leading-6 text-gray-700">
            {college.placements}
          </p>
        </div>
      </div>
    </section>
  );
}
