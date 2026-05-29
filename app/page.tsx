import { Suspense } from "react";

import CollegeExplorer from "@/components/CollegeExplorer";
import CollegeGridSkeleton from "@/components/CollegeGridSkeleton";

export default function Home() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
          <div className="h-8 w-72 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-gray-200" />
          <div className="mt-6">
            <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200" />
          </div>
          <div className="mt-8">
            <CollegeGridSkeleton />
          </div>
        </section>
      }
    >
      <CollegeExplorer />
    </Suspense>
  );
}