"use client";

type Props = {
  count?: number;
};

export default function CollegeGridSkeleton({ count = 6 }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="overflow-hidden rounded-xl border bg-white shadow-sm"
        >
          <div className="h-40 w-full animate-pulse bg-gray-200" />
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-12 animate-pulse rounded-full bg-gray-200" />
            </div>
            <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 flex items-center justify-between">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
