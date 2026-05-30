import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
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

    const courses = await prisma.course.findMany({
      where: { collegeId: Math.floor(collegeId) },
      orderBy: { totalFees: "asc" },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    if (isDbUnavailableError(error)) {
      return NextResponse.json(
        { message: DB_UNAVAILABLE_MESSAGE } satisfies ApiError,
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load courses" } satisfies ApiError,
      { status: 500 }
    );
  }
}
