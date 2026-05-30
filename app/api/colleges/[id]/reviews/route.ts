import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { DB_UNAVAILABLE_MESSAGE, isDbUnavailableError } from "@/lib/db-unavailable";

type ApiError = {
  message?: string;
};

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Params) {
  try {
    const { id } = await context.params;
    const collegeId = Number(id);

    if (!Number.isFinite(collegeId)) {
      return NextResponse.json(
        { message: "Invalid college id" } satisfies ApiError,
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { collegeId: Math.floor(collegeId) },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    if (isDbUnavailableError(error)) {
      return NextResponse.json(
        { message: DB_UNAVAILABLE_MESSAGE } satisfies ApiError,
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load reviews" } satisfies ApiError,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: Params) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json(
        { message: "Not authenticated" } satisfies ApiError,
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" } satisfies ApiError,
        { status: 404 }
      );
    }

    const { id } = await context.params;
    const collegeIdRaw = Number(id);
    if (!Number.isFinite(collegeIdRaw)) {
      return NextResponse.json(
        { message: "Invalid college id" } satisfies ApiError,
        { status: 400 }
      );
    }
    const collegeId = Math.floor(collegeIdRaw);

    const body = (await request.json().catch(() => null)) as
      | { rating?: unknown; title?: unknown; body?: unknown }
      | null;

    const ratingNum = Number(body?.rating);
    const rating = Number.isFinite(ratingNum) ? Math.floor(ratingNum) : NaN;
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const text = typeof body?.body === "string" ? body.body.trim() : "";

    if (!(rating >= 1 && rating <= 5)) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5" } satisfies ApiError,
        { status: 400 }
      );
    }

    if (!title || title.length < 4) {
      return NextResponse.json(
        { message: "Title is too short" } satisfies ApiError,
        { status: 400 }
      );
    }

    if (!text || text.length < 20) {
      return NextResponse.json(
        { message: "Review text must be at least 20 characters" } satisfies ApiError,
        { status: 400 }
      );
    }

    const exists = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!exists) {
      return NextResponse.json(
        { message: "College not found" } satisfies ApiError,
        { status: 404 }
      );
    }

    const review = await prisma.review.upsert({
      where: {
        userId_collegeId: {
          userId: user.id,
          collegeId,
        },
      },
      create: {
        userId: user.id,
        collegeId,
        rating,
        title,
        body: text,
      },
      update: {
        rating,
        title,
        body: text,
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (isDbUnavailableError(error)) {
      return NextResponse.json(
        { message: DB_UNAVAILABLE_MESSAGE } satisfies ApiError,
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: "Failed to post review" } satisfies ApiError,
      { status: 500 }
    );
  }
}
