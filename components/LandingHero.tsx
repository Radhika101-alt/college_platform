import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-200 blur-3xl" />
        <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-indigo-200 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur">
          <Sparkles className="h-4 w-4 text-fuchsia-600" />
          Discover colleges faster with real data
        </div>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Find the right college —
          <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
            {" "}confidently
          </span>
        </h1>
        <p className="mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
          Search, filter, save, and compare colleges with a clean workflow designed like a
          real product.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:opacity-95">
            <Link href="/#colleges" className="flex items-center gap-2">
              Explore colleges <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/compare">Compare colleges</Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white/70 p-4 backdrop-blur">
            <p className="text-sm font-medium text-gray-900">Smart search</p>
            <p className="mt-1 text-sm text-gray-600">Name, location, fees — all in one.</p>
          </div>
          <div className="rounded-2xl border bg-white/70 p-4 backdrop-blur">
            <p className="text-sm font-medium text-gray-900">Save & shortlist</p>
            <p className="mt-1 text-sm text-gray-600">Keep a list for later decisions.</p>
          </div>
          <div className="rounded-2xl border bg-white/70 p-4 backdrop-blur">
            <p className="text-sm font-medium text-gray-900">Side-by-side compare</p>
            <p className="mt-1 text-sm text-gray-600">Make trade-offs easy to see.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
