import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Not found</h1>
      <p className="mt-2 text-sm text-gray-600">
        The page you are looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Back to home
      </Link>
    </section>
  );
}
