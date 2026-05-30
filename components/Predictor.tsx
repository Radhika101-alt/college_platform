"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ApiError = { message?: string };

type PredictorResult = {
  cutoff: { id: number; exam: string; category: string; year: number; minScore: number };
  course: {
    id: number;
    name: string;
    level: string;
    duration: string;
    totalFees: number;
  };
  college: { id: number; name: string; location: string; rating: number };
};

type PredictorResponse = {
  results: PredictorResult[];
};

export default function Predictor() {
  const currentYear = new Date().getFullYear();

  const [exam, setExam] = useState("JEE");
  const [category, setCategory] = useState("General");
  const [year, setYear] = useState(currentYear);
  const [score, setScore] = useState(75);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PredictorResult[] | null>(null);

  const query = useMemo(() => {
    const sp = new URLSearchParams({
      exam,
      category,
      year: String(year),
      score: String(score),
    });
    return `/api/predictor?${sp.toString()}`;
  }, [exam, category, year, score]);

  async function run() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(query, { method: "GET" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as ApiError | null;
        throw new Error(data?.message || "Predictor failed");
      }

      const data = (await res.json()) as PredictorResponse;
      setResults(Array.isArray(data.results) ? data.results : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Predictor failed");
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admission predictor</h1>
            <p className="mt-1 text-sm text-gray-600">
              Demo predictor based on seeded cutoffs (0–100 score scale).
            </p>
          </div>
          <Link href="/" className="text-sm text-gray-700 hover:text-gray-900">
            Back
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <label className="space-y-1">
            <span className="text-xs font-medium text-gray-700">Exam</span>
            <Input value={exam} onChange={(e) => setExam(e.target.value)} placeholder="JEE" />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-gray-700">Category</span>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="General"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-gray-700">Year</span>
            <Input
              inputMode="numeric"
              value={String(year)}
              onChange={(e) => setYear(Number(e.target.value))}
              placeholder={String(currentYear)}
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-gray-700">Score (0–100)</span>
            <Input
              inputMode="numeric"
              value={String(score)}
              onChange={(e) => setScore(Number(e.target.value))}
              placeholder="75"
            />
          </label>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button onClick={run} disabled={isLoading}>
            {isLoading ? "Running..." : "Run predictor"}
          </Button>
          <Button
            variant="secondary"
            disabled={isLoading}
            onClick={() => {
              setResults(null);
              setError(null);
            }}
          >
            Clear
          </Button>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6">
          {results ? (
            results.length > 0 ? (
              <div className="space-y-3">
                {results.map((r) => (
                  <Link
                    key={r.cutoff.id}
                    href={`/colleges/${r.college.id}`}
                    className="block rounded-xl border bg-white p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{r.college.name}</p>
                        <p className="mt-0.5 text-sm text-gray-600">{r.college.location}</p>
                        <p className="mt-2 text-sm text-gray-700">
                          {r.course.name} · {r.course.level} · {r.course.duration}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Min score: {r.cutoff.minScore}</p>
                        <p className="mt-0.5 text-xs text-gray-600">Rating: {r.college.rating}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No matches found for this score.</p>
            )
          ) : (
            <p className="text-sm text-gray-600">Run predictor to see matches.</p>
          )}
        </div>
      </div>
    </section>
  );
}
