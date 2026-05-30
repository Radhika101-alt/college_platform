"use client";

import type { College } from "@prisma/client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ApiError = {
  message?: string;
};

type Props = {
  id: number;
};

type SavedIdsResponse = {
  ids: number[];
};

type CourseDto = {
  id: number;
  collegeId: number;
  name: string;
  level: string;
  duration: string;
  totalFees: number;
  createdAt: string;
};

type CoursesResponse = {
  courses: CourseDto[];
};

type ReviewUserDto = {
  id: number;
  email: string;
  name: string | null;
};

type ReviewDto = {
  id: number;
  collegeId: number;
  userId: number;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  user: ReviewUserDto;
};

type ReviewsResponse = {
  reviews: ReviewDto[];
};

type DiscussionUserDto = {
  id: number;
  email: string;
  name: string | null;
};

type DiscussionReplyDto = {
  id: number;
  threadId: number;
  userId: number;
  body: string;
  createdAt: string;
  user: DiscussionUserDto;
};

type DiscussionThreadDto = {
  id: number;
  collegeId: number;
  userId: number;
  title: string;
  body: string;
  createdAt: string;
  user: DiscussionUserDto;
  replies: DiscussionReplyDto[];
};

type DiscussionsResponse = {
  threads: DiscussionThreadDto[];
};

async function fetchCollege(id: number, signal?: AbortSignal) {
  const res = await fetch(`/api/colleges/${id}`, { method: "GET", signal });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    const message = data?.message || "Failed to load college";
    const error = new Error(message);
    (error as any).status = res.status;
    throw error;
  }

  return (await res.json()) as College;
}

async function fetchSavedIds(signal?: AbortSignal) {
  const res = await fetch("/api/saved/ids", { method: "GET", signal });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || "Failed to load saved colleges");
  }

  return (await res.json()) as SavedIdsResponse;
}

async function fetchCourses(id: number, signal?: AbortSignal) {
  const res = await fetch(`/api/colleges/${id}/courses`, { method: "GET", signal });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || "Failed to load courses");
  }

  return (await res.json()) as CoursesResponse;
}

async function fetchReviews(id: number, signal?: AbortSignal) {
  const res = await fetch(`/api/colleges/${id}/reviews`, { method: "GET", signal });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || "Failed to load reviews");
  }

  return (await res.json()) as ReviewsResponse;
}

async function postReview(
  id: number,
  input: { rating: number; title: string; body: string }
) {
  const res = await fetch(`/api/colleges/${id}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || "Failed to post review");
  }

  return (await res.json()) as { review: ReviewDto };
}

async function fetchDiscussions(id: number, signal?: AbortSignal) {
  const res = await fetch(`/api/colleges/${id}/discussions`, {
    method: "GET",
    signal,
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || "Failed to load discussions");
  }

  return (await res.json()) as DiscussionsResponse;
}

async function postThread(id: number, input: { title: string; body: string }) {
  const res = await fetch(`/api/colleges/${id}/discussions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || "Failed to post discussion");
  }

  return (await res.json()) as { thread: DiscussionThreadDto };
}

async function postReply(threadId: number, input: { body: string }) {
  const res = await fetch(`/api/discussions/${threadId}/replies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || "Failed to post reply");
  }

  return (await res.json()) as { reply: DiscussionReplyDto };
}

async function saveCollege(collegeId: number) {
  const res = await fetch("/api/saved", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collegeId }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || "Failed to save college");
  }
}

async function unsaveCollege(collegeId: number) {
  const res = await fetch(`/api/saved/${collegeId}`, { method: "DELETE" });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || "Failed to unsave college");
  }
}

function DetailSkeleton() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 h-9 w-3/4 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-200" />

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="h-72 w-full animate-pulse rounded-xl bg-gray-200" />
        <div className="rounded-xl border bg-white p-4">
          <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </section>
  );
}

export default function CollegeDetail({ id }: Props) {
  const { data: session } = useSession();
  const sessionEmail = useMemo(
    () => session?.user?.email?.toLowerCase().trim() || "",
    [session?.user?.email]
  );

  const [college, setCollege] = useState<College | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [tab, setTab] = useState<
    "overview" | "courses" | "reviews" | "discussions"
  >("overview");

  const [courses, setCourses] = useState<CourseDto[] | null>(null);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<ReviewDto[] | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState<string | null>(null);

  const [threads, setThreads] = useState<DiscussionThreadDto[] | null>(null);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threadsError, setThreadsError] = useState<string | null>(null);

  const [threadTitle, setThreadTitle] = useState("");
  const [threadBody, setThreadBody] = useState("");
  const [threadSubmitting, setThreadSubmitting] = useState(false);
  const [threadSubmitError, setThreadSubmitError] = useState<string | null>(null);

  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [replySubmitting, setReplySubmitting] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setError(null);
    setNotFound(false);

    fetchCollege(id, controller.signal)
      .then((data) => setCollege(data))
      .catch((err) => {
        if (controller.signal.aborted) return;
        const status = (err as any)?.status;
        if (status === 404) {
          setNotFound(true);
          setCollege(null);
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load college");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (tab === "courses") {
      if (courses || coursesLoading) return;
      const controller = new AbortController();

      setCoursesLoading(true);
      setCoursesError(null);

      fetchCourses(id, controller.signal)
        .then((data) => setCourses(Array.isArray(data.courses) ? data.courses : []))
        .catch((err) => {
          if (controller.signal.aborted) return;
          setCoursesError(err instanceof Error ? err.message : "Failed to load courses");
        })
        .finally(() => {
          if (controller.signal.aborted) return;
          setCoursesLoading(false);
        });

      return () => controller.abort();
    }

    if (tab === "reviews") {
      if (reviews || reviewsLoading) return;
      const controller = new AbortController();

      setReviewsLoading(true);
      setReviewsError(null);

      fetchReviews(id, controller.signal)
        .then((data) => setReviews(Array.isArray(data.reviews) ? data.reviews : []))
        .catch((err) => {
          if (controller.signal.aborted) return;
          setReviewsError(err instanceof Error ? err.message : "Failed to load reviews");
        })
        .finally(() => {
          if (controller.signal.aborted) return;
          setReviewsLoading(false);
        });

      return () => controller.abort();
    }

    if (tab === "discussions") {
      if (threads || threadsLoading) return;
      const controller = new AbortController();

      setThreadsLoading(true);
      setThreadsError(null);

      fetchDiscussions(id, controller.signal)
        .then((data) => setThreads(Array.isArray(data.threads) ? data.threads : []))
        .catch((err) => {
          if (controller.signal.aborted) return;
          setThreadsError(
            err instanceof Error ? err.message : "Failed to load discussions"
          );
        })
        .finally(() => {
          if (controller.signal.aborted) return;
          setThreadsLoading(false);
        });

      return () => controller.abort();
    }
  }, [
    tab,
    id,
    courses,
    coursesLoading,
    reviews,
    reviewsLoading,
    threads,
    threadsLoading,
  ]);

  useEffect(() => {
    if (!sessionEmail) return;
    if (!reviews || reviews.length === 0) return;

    const my = reviews.find((r) => r.user?.email?.toLowerCase?.() === sessionEmail);
    if (!my) return;

    setReviewRating(my.rating);
    setReviewTitle(my.title);
    setReviewBody(my.body);
  }, [reviews, sessionEmail]);

  useEffect(() => {
    const controller = new AbortController();

    fetchSavedIds(controller.signal)
      .then((data) => {
        const ids = Array.isArray(data.ids) ? data.ids : [];
        setIsSaved(ids.includes(id));
      })
      .catch(() => {
        setIsSaved(false);
      });

    return () => controller.abort();
  }, [id]);

  async function onToggleSaved() {
    if (isSaving) return;

    setIsSaving(true);
    try {
      if (!isSaved) {
        await saveCollege(id);
        setIsSaved(true);
      } else {
        await unsaveCollege(id);
        setIsSaved(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update saved colleges");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <DetailSkeleton />;

  if (notFound) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-sm text-gray-600">College not found.</p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Back to colleges
        </Link>
      </section>
    );
  }

  if (error || !college) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-sm font-medium text-gray-900">Something went wrong</p>
        <p className="mt-1 text-sm text-gray-600">{error ?? "Please try again."}</p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
          <Link
            href="/"
            className="inline-flex"
          >
            <Button variant="outline">Back</Button>
          </Link>
        </div>
      </section>
    );
  }

  async function onSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (reviewSubmitting) return;

    setReviewSubmitting(true);
    setReviewSubmitError(null);

    try {
      await postReview(id, {
        rating: reviewRating,
        title: reviewTitle,
        body: reviewBody,
      });

      const latest = await fetchReviews(id);
      setReviews(Array.isArray(latest.reviews) ? latest.reviews : []);
    } catch (err) {
      setReviewSubmitError(
        err instanceof Error ? err.message : "Failed to submit review"
      );
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function onSubmitThread(e: React.FormEvent) {
    e.preventDefault();
    if (threadSubmitting) return;

    setThreadSubmitting(true);
    setThreadSubmitError(null);

    try {
      await postThread(id, { title: threadTitle, body: threadBody });
      const latest = await fetchDiscussions(id);
      setThreads(Array.isArray(latest.threads) ? latest.threads : []);
      setThreadTitle("");
      setThreadBody("");
    } catch (err) {
      setThreadSubmitError(
        err instanceof Error ? err.message : "Failed to post discussion"
      );
    } finally {
      setThreadSubmitting(false);
    }
  }

  async function onSubmitReply(threadId: number) {
    if (!sessionEmail) return;
    const body = (replyDrafts[threadId] || "").trim();
    if (!body) return;
    if (replySubmitting[threadId]) return;

    setReplySubmitting((prev) => ({ ...prev, [threadId]: true }));

    try {
      await postReply(threadId, { body });
      const latest = await fetchDiscussions(id);
      setThreads(Array.isArray(latest.threads) ? latest.threads : []);
      setReplyDrafts((prev) => ({ ...prev, [threadId]: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setReplySubmitting((prev) => ({ ...prev, [threadId]: false }));
    }
  }

  function Stars({ rating }: { rating: number }) {
    const safe = Math.max(0, Math.min(5, Math.floor(rating)));
    return (
      <span className="inline-flex items-center gap-0.5" aria-label={`${safe} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < safe ? "text-gray-900" : "text-gray-300"}>
            ★
          </span>
        ))}
      </span>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
        ← Back
      </Link>

      <div className="mt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {college.name}
            </h1>
            <p className="mt-1 text-sm text-gray-600">{college.location}</p>
          </div>

          <Button
            variant={isSaved ? "default" : "outline"}
            aria-pressed={isSaved}
            disabled={isSaving}
            onClick={onToggleSaved}
          >
            {isSaving ? "..." : isSaved ? "Saved" : "Save"}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl border bg-white">
          <img
            src={college.image}
            alt={college.name}
            className="h-72 w-full object-cover"
          />
          <div className="p-4">
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border px-3 py-1 text-gray-700">
                Fees: ₹{college.fees}
              </span>
              <span className="rounded-full border px-3 py-1 text-gray-700">
                Rating: ⭐ {college.rating}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <h2 className="text-base font-semibold">About</h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                {college.overview}
              </p>

              <h2 className="mt-6 text-base font-semibold">Placements</h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                {college.placements}
              </p>
            </TabsContent>

            <TabsContent value="courses" className="mt-4">
              {coursesLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                </div>
              ) : coursesError ? (
                <div>
                  <p className="text-sm font-medium text-gray-900">Couldn’t load courses</p>
                  <p className="mt-1 text-sm text-gray-600">{coursesError}</p>
                </div>
              ) : courses && courses.length > 0 ? (
                <div className="space-y-3">
                  {courses.map((c) => (
                    <div key={c.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                          <p className="mt-0.5 text-sm text-gray-600">
                            {c.level} · {c.duration}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">₹{c.totalFees}</p>
                          <p className="mt-0.5 text-xs text-gray-600">Total fees</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No courses added yet.</p>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold">Student reviews</h2>

                  {reviewsLoading ? (
                    <div className="mt-3 space-y-2">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                    </div>
                  ) : reviewsError ? (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-900">Couldn’t load reviews</p>
                      <p className="mt-1 text-sm text-gray-600">{reviewsError}</p>
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {reviews.map((r) => (
                        <div key={r.id} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-900">{r.title}</p>
                            <Stars rating={r.rating} />
                          </div>
                          <p className="mt-2 text-sm leading-6 text-gray-700">{r.body}</p>
                          <p className="mt-2 text-xs text-gray-500">
                            {r.user?.name || r.user?.email}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-gray-600">No reviews yet. Be the first.</p>
                  )}
                </div>

                <div className="rounded-xl border bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-gray-900">Write a review</h3>
                    {!sessionEmail ? (
                      <Link href="/login" className="text-sm text-gray-900 underline underline-offset-4">
                        Sign in
                      </Link>
                    ) : null}
                  </div>

                  {!sessionEmail ? (
                    <p className="mt-2 text-sm text-gray-600">
                      Sign in to post a review.
                    </p>
                  ) : (
                    <form className="mt-3 space-y-3" onSubmit={onSubmitReview}>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label className="space-y-1">
                          <span className="text-xs font-medium text-gray-700">Rating</span>
                          <select
                            className="h-10 w-full rounded-lg border bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                          >
                            {[5, 4, 3, 2, 1].map((v) => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="space-y-1">
                          <span className="text-xs font-medium text-gray-700">Title</span>
                          <Input
                            value={reviewTitle}
                            onChange={(e) => setReviewTitle(e.target.value)}
                            placeholder="Eg. Great placements and campus"
                          />
                        </label>
                      </div>

                      <label className="space-y-1">
                        <span className="text-xs font-medium text-gray-700">Review</span>
                        <Textarea
                          value={reviewBody}
                          onChange={(e) => setReviewBody(e.target.value)}
                          placeholder="What did you like? What could be improved?"
                        />
                      </label>

                      {reviewSubmitError ? (
                        <p className="text-sm text-red-600">{reviewSubmitError}</p>
                      ) : null}

                      <div className="flex items-center gap-2">
                        <Button type="submit" disabled={reviewSubmitting}>
                          {reviewSubmitting ? "Posting..." : "Post review"}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setReviewTitle("");
                            setReviewBody("");
                            setReviewRating(5);
                            setReviewSubmitError(null);
                          }}
                          disabled={reviewSubmitting}
                        >
                          Clear
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600">
                        Posting again updates your previous review.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="discussions" className="mt-4">
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold">Questions & discussions</h2>

                  {threadsLoading ? (
                    <div className="mt-3 space-y-2">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                    </div>
                  ) : threadsError ? (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-900">Couldn’t load discussions</p>
                      <p className="mt-1 text-sm text-gray-600">{threadsError}</p>
                    </div>
                  ) : threads && threads.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {threads.map((t) => (
                        <div key={t.id} className="rounded-xl border p-4">
                          <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                          <p className="mt-2 text-sm leading-6 text-gray-700">{t.body}</p>
                          <p className="mt-2 text-xs text-gray-500">
                            {t.user?.name || t.user?.email}
                          </p>

                          {t.replies && t.replies.length > 0 ? (
                            <div className="mt-3 space-y-2 border-l pl-3">
                              {t.replies.map((r) => (
                                <div key={r.id} className="rounded-lg bg-gray-50 p-3">
                                  <p className="text-sm text-gray-800">{r.body}</p>
                                  <p className="mt-1 text-xs text-gray-500">
                                    {r.user?.name || r.user?.email}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-3 text-sm text-gray-600">No replies yet.</p>
                          )}

                          <div className="mt-4 rounded-lg border bg-white p-3">
                            {!sessionEmail ? (
                              <p className="text-sm text-gray-600">
                                <Link
                                  href="/login"
                                  className="text-gray-900 underline underline-offset-4"
                                >
                                  Sign in
                                </Link>{" "}
                                to reply.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                <Textarea
                                  value={replyDrafts[t.id] || ""}
                                  onChange={(e) =>
                                    setReplyDrafts((prev) => ({
                                      ...prev,
                                      [t.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Write a reply"
                                  className="min-h-20"
                                />
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => void onSubmitReply(t.id)}
                                    disabled={Boolean(replySubmitting[t.id])}
                                  >
                                    {replySubmitting[t.id] ? "Posting..." : "Reply"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                      setReplyDrafts((prev) => ({
                                        ...prev,
                                        [t.id]: "",
                                      }))
                                    }
                                    disabled={Boolean(replySubmitting[t.id])}
                                  >
                                    Clear
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-gray-600">
                      No discussions yet. Ask the first question.
                    </p>
                  )}
                </div>

                <div className="rounded-xl border bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-gray-900">Ask a question</h3>
                    {!sessionEmail ? (
                      <Link
                        href="/login"
                        className="text-sm text-gray-900 underline underline-offset-4"
                      >
                        Sign in
                      </Link>
                    ) : null}
                  </div>

                  {!sessionEmail ? (
                    <p className="mt-2 text-sm text-gray-600">
                      Sign in to start a discussion.
                    </p>
                  ) : (
                    <form className="mt-3 space-y-3" onSubmit={onSubmitThread}>
                      <label className="space-y-1">
                        <span className="text-xs font-medium text-gray-700">Title</span>
                        <Input
                          value={threadTitle}
                          onChange={(e) => setThreadTitle(e.target.value)}
                          placeholder="Eg. How are placements for CSE?"
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="text-xs font-medium text-gray-700">Question</span>
                        <Textarea
                          value={threadBody}
                          onChange={(e) => setThreadBody(e.target.value)}
                          placeholder="Add details so others can help"
                        />
                      </label>

                      {threadSubmitError ? (
                        <p className="text-sm text-red-600">{threadSubmitError}</p>
                      ) : null}

                      <div className="flex items-center gap-2">
                        <Button type="submit" disabled={threadSubmitting}>
                          {threadSubmitting ? "Posting..." : "Post question"}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setThreadTitle("");
                            setThreadBody("");
                            setThreadSubmitError(null);
                          }}
                          disabled={threadSubmitting}
                        >
                          Clear
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
