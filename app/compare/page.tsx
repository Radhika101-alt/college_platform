import { Suspense } from "react";

import CompareColleges from "@/components/CompareColleges";

export default function ComparePage() {
  // CompareColleges uses `useSearchParams`, so it must be wrapped in Suspense.
  return (
    <Suspense
      fallback={
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
      }
    >
      <CompareColleges />
    </Suspense>
  );
}
