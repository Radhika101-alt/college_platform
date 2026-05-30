import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { DB_UNAVAILABLE_MESSAGE, isDbUnavailableError } from "@/lib/db-unavailable";

type ApiError = { message?: string };

type Params = {
  params: Promise<{ threadId: string }>;
};

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

    const { threadId } = await context.params;
    const threadIdRaw = Number(threadId);
    if (!Number.isFinite(threadIdRaw)) {
      return NextResponse.json(
        { message: "Invalid thread id" } satisfies ApiError,
        { status: 400 }
      );
    }

    const input = (await request.json().catch(() => null)) as
      | { body?: unknown }
      | null;

    const body = typeof input?.body === "string" ? input.body.trim() : "";

    if (!body || body.length < 4) {
      return NextResponse.json(
        { message: "Reply is too short" } satisfies ApiError,
        { status: 400 }
      );
    }

    const thread = await prisma.discussionThread.findUnique({
      where: { id: Math.floor(threadIdRaw) },
      select: { id: true },
    });

    if (!thread) {
      return NextResponse.json(
        { message: "Thread not found" } satisfies ApiError,
        { status: 404 }
      );
    }

    const reply = await prisma.discussionReply.create({
      data: {
        threadId: thread.id,
        userId: user.id,
        body,
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    return NextResponse.json({ reply }, { status: 201 });
  } catch (error) {
    if (isDbUnavailableError(error)) {
      return NextResponse.json(
        { message: DB_UNAVAILABLE_MESSAGE } satisfies ApiError,
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: "Failed to post reply" } satisfies ApiError,
      { status: 500 }
    );
  }
}
