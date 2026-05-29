"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            App error
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            An unexpected error occurred.
          </p>

          {process.env.NODE_ENV !== "production" ? (
            <pre className="mt-6 overflow-auto rounded-xl border bg-white p-4 text-xs text-gray-700">
              {error.message}
            </pre>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
              onClick={() => reset()}
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to home
            </Link>
          </div>
        </section>
      </body>
    </html>
  );
}
