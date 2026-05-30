import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { DB_UNAVAILABLE_MESSAGE, isDbUnavailableError } from "@/lib/db-unavailable";

type ApiError = { message?: string };

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Params) {
  try {
    const { id } = await context.params;
    const collegeId = Number(id);

    if (!Number.isFinite(collegeId)) {
      return NextResponse.json({ message: "Invalid college id" } satisfies ApiError, {
        status: 400,
      });
    }

    const threads = await prisma.discussionThread.findMany({
      where: { collegeId: Math.floor(collegeId) },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, name: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, email: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({ threads });
  } catch (error) {
    if (isDbUnavailableError(error)) {
      return NextResponse.json(
        { message: DB_UNAVAILABLE_MESSAGE } satisfies ApiError,
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load discussions" } satisfies ApiError,
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

    const input = (await request.json().catch(() => null)) as
      | { title?: unknown; body?: unknown }
      | null;

    const title = typeof input?.title === "string" ? input.title.trim() : "";
    const body = typeof input?.body === "string" ? input.body.trim() : "";

    if (!title || title.length < 6) {
      return NextResponse.json(
        { message: "Title is too short" } satisfies ApiError,
        { status: 400 }
      );
    }

    if (!body || body.length < 20) {
      return NextResponse.json(
        { message: "Question must be at least 20 characters" } satisfies ApiError,
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

    const thread = await prisma.discussionThread.create({
      data: {
        collegeId,
        userId: user.id,
        title,
        body,
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { id: true, email: true, name: true } } },
        },
      },
    });

    return NextResponse.json({ thread }, { status: 201 });
  } catch (error) {
    if (isDbUnavailableError(error)) {
      return NextResponse.json(
        { message: DB_UNAVAILABLE_MESSAGE } satisfies ApiError,
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: "Failed to post discussion" } satisfies ApiError,
      { status: 500 }
    );
  }
}
