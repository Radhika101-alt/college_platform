import CollegeDetail from "@/components/CollegeDetail";

type PageProps = {
  params: {
    id: string;
  };
};

export default function CollegeDetailPage({ params }: PageProps) {
  const id = Number(params.id);

  // We keep this page as a Server Component, and the data fetching happens
  // in the Client Component via our REST API route `/api/colleges/[id]`.
  // This keeps data flow consistent and avoids hardcoding URLs.
  if (!Number.isFinite(id)) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-sm text-gray-600">Invalid college id.</p>
      </section>
    );
  }

  return <CollegeDetail id={id} />;
}
