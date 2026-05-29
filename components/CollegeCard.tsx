"use client";

import type { College } from "@prisma/client";
import Link from "next/link";

type Props = {
  college: College;
  isSaved: boolean;
  isSaving?: boolean;
  onToggleSaved: (collegeId: number, nextSaved: boolean) => Promise<void>;
};

export default function CollegeCard({ college, isSaved, isSaving, onToggleSaved }: Props) {
  const label = isSaved ? "Saved" : "Save";
  const overviewPreview =
    college.overview.length > 120
      ? `${college.overview.slice(0, 120)}…`
      : college.overview;
  const feesLabel = `₹${college.fees.toLocaleString("en-IN")}`;
  const ratingLabel = Number.isFinite(college.rating)
    ? college.rating.toFixed(1)
    : String(college.rating);

  return (
    <div className="relative overflow-hidden rounded-xl border bg-white shadow-sm transition hover:bg-gray-50">
      <Link
        href={`/colleges/${college.id}`}
        className="block"
        aria-label={`View details for ${college.name}`}
      >
        <img
          src={college.image}
          alt={college.name}
          className="h-40 w-full object-cover"
          loading="lazy"
        />

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold leading-snug">{college.name}</h3>
            <span className="shrink-0 rounded-full border bg-white px-2 py-0.5 text-xs font-medium text-gray-700">
              ⭐ {ratingLabel}
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-600">{college.location}</p>

          <p className="mt-2 text-sm text-gray-600">{overviewPreview}</p>

          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-gray-800">
              <span className="text-gray-600">Fees:</span> {feesLabel}
            </p>
            <span className="text-gray-700 underline">View</span>
          </div>
        </div>
      </Link>

      <button
        type="button"
        className={
          "absolute right-3 top-3 rounded-md border px-3 py-1 text-xs font-medium " +
          (isSaved
            ? "bg-black text-white hover:bg-black/90"
            : "bg-white text-gray-800 hover:bg-gray-50")
        }
        aria-pressed={isSaved}
        disabled={isSaving}
        onClick={() => onToggleSaved(college.id, !isSaved)}
      >
        {isSaving ? "Saving…" : label}
      </button>
    </div>
  );
}
