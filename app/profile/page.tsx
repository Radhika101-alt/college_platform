import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DB_UNAVAILABLE_MESSAGE, isDbUnavailableError } from "@/lib/db-unavailable";

import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();

  if (!email) {
    redirect("/login");
  }

  let user:
    | {
        id: number;
        email: string;
        name: string | null;
        createdAt: Date;
        _count: {
          savedColleges: number;
          reviews: number;
          discussionThreads: number;
          discussionReplies: number;
        };
      }
    | null = null;
  let recentReviews: Array<{
    id: number;
    title: string;
    body: string;
    rating: number;
    college: { id: number; name: string; location: string };
  }> = [];
  let recentThreads: Array<{
    id: number;
    title: string;
    body: string;
    college: { id: number; name: string; location: string };
  }> = [];

  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            savedColleges: true,
            reviews: true,
            discussionThreads: true,
            discussionReplies: true,
          },
        },
      },
    });

    if (!user) {
      redirect("/login");
    }

    recentReviews = await prisma.review.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { college: { select: { id: true, name: true, location: true } } },
    });

    recentThreads = await prisma.discussionThread.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { college: { select: { id: true, name: true, location: true } } },
    });
  } catch (error) {
    if (isDbUnavailableError(error)) {
      return (
        <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <div className="rounded-2xl border bg-white p-6">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">{DB_UNAVAILABLE_MESSAGE}</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline">
                <Link href="/">Home</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/predictor">Predictor</Link>
              </Button>
              <Button asChild>
                <Link href="/profile">Retry</Link>
              </Button>
            </div>
          </div>
        </section>
      );
    }

    throw error;
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Signed in as {user.email}
              {user.name ? ` · ${user.name}` : ""}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline">
              <Link href="/saved">Saved colleges</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/predictor">Predictor</Link>
            </Button>
            <Button asChild>
              <Link href="/">Explore</Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-600">Saved</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {user._count.savedColleges}
            </p>
          </div>
          <div className="rounded-xl border bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-600">Reviews</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {user._count.reviews}
            </p>
          </div>
          <div className="rounded-xl border bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-600">Threads</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {user._count.discussionThreads}
            </p>
          </div>
          <div className="rounded-xl border bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-600">Replies</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {user._count.discussionReplies}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border p-5">
            <h2 className="text-sm font-semibold text-gray-900">Recent reviews</h2>
            {recentReviews.length === 0 ? (
              <p className="mt-2 text-sm text-gray-600">No reviews yet.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {recentReviews.map((r) => (
                  <Link
                    key={r.id}
                    href={`/colleges/${r.college.id}`}
                    className="block rounded-xl border bg-white p-4 hover:bg-gray-50"
                  >
                    <p className="text-sm font-semibold text-gray-900">{r.title}</p>
                    <p className="mt-1 text-sm text-gray-700 line-clamp-2">{r.body}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      {r.college.name} · {r.college.location} · Rating {r.rating}/5
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border p-5">
            <h2 className="text-sm font-semibold text-gray-900">Recent discussions</h2>
            {recentThreads.length === 0 ? (
              <p className="mt-2 text-sm text-gray-600">No discussions yet.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {recentThreads.map((t) => (
                  <Link
                    key={t.id}
                    href={`/colleges/${t.college.id}`}
                    className="block rounded-xl border bg-white p-4 hover:bg-gray-50"
                  >
                    <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                    <p className="mt-1 text-sm text-gray-700 line-clamp-2">{t.body}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      {t.college.name} · {t.college.location}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
