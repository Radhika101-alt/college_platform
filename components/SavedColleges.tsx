"use client";

import type { College } from "@prisma/client";
import { useEffect, useState } from "react";
import Link from "next/link";

import CollegeCard from "@/components/CollegeCard";
import CollegeGridSkeleton from "@/components/CollegeGridSkeleton";

type ApiError = {
  message?: string;
};

type SavedListResponse = {
  colleges: College[];
};

async function fetchSavedColleges(signal?: AbortSignal) {
  const res = await fetch("/api/saved", { method: "GET", signal });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || "Failed to load saved colleges");
  }

  return (await res.json()) as SavedListResponse;
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

export default function SavedColleges() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [savingIds, setSavingIds] = useState<number[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    fetchSavedColleges(controller.signal)
      .then((data) => setColleges(Array.isArray(data.colleges) ? data.colleges : []))
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to load saved colleges");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  async function onToggleSaved(collegeId: number, nextSaved: boolean) {
    if (savingIds.includes(collegeId)) return;

    setSavingIds((prev) => [...prev, collegeId]);
    try {
      if (nextSaved) {
        await saveCollege(collegeId);
        // If user re-saves from this page, keep it in the list.
        setColleges((prev) => prev);
      } else {
        await unsaveCollege(collegeId);
        setColleges((prev) => prev.filter((c) => c.id !== collegeId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update saved colleges");
    } finally {
      setSavingIds((prev) => prev.filter((id) => id !== collegeId));
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Saved colleges</h1>
        <p className="text-sm text-gray-600">
          Your saved list (account-based when logged in, otherwise device-based).
        </p>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <CollegeGridSkeleton />
        ) : error ? (
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm font-medium text-gray-900">Could not load saved colleges</p>
            <p className="mt-1 text-sm text-gray-600">{error}</p>
            <Link
              href="/"
              className="mt-4 inline-flex rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Back to colleges
            </Link>
          </div>
        ) : colleges.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-sm text-gray-700">
            No saved colleges yet.
            <div className="mt-4">
              <Link
                href="/"
                className="inline-flex rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Browse colleges
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {colleges.map((college) => (
              <CollegeCard
                key={college.id}
                college={college}
                isSaved
                isSaving={savingIds.includes(college.id)}
                onToggleSaved={onToggleSaved}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
