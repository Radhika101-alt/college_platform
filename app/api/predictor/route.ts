import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { DB_UNAVAILABLE_MESSAGE, isDbUnavailableError } from "@/lib/db-unavailable";

type ApiError = { message?: string };

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const exam = (searchParams.get("exam") || "JEE").trim();
    const category = (searchParams.get("category") || "General").trim();
    const yearNum = Number(searchParams.get("year") || new Date().getFullYear());
    const scoreNum = Number(searchParams.get("score") || "");

    const year = Number.isFinite(yearNum) ? Math.floor(yearNum) : NaN;
    const score = Number.isFinite(scoreNum) ? Math.floor(scoreNum) : NaN;

    if (!exam) {
      return NextResponse.json({ message: "Exam is required" } satisfies ApiError, {
        status: 400,
      });
    }

    if (!category) {
      return NextResponse.json(
        { message: "Category is required" } satisfies ApiError,
        { status: 400 }
      );
    }

    if (!(year >= 2000 && year <= 2100)) {
      return NextResponse.json({ message: "Invalid year" } satisfies ApiError, {
        status: 400,
      });
    }

    if (!(score >= 0 && score <= 100)) {
      return NextResponse.json(
        { message: "Score must be between 0 and 100" } satisfies ApiError,
        { status: 400 }
      );
    }

    const matches = await prisma.admissionCutoff.findMany({
      where: {
        exam,
        category,
        year,
        minScore: { lte: score },
      },
      orderBy: [{ minScore: "desc" }],
      take: 50,
      include: {
        course: {
          include: {
            college: true,
          },
        },
      },
    });

    const results = matches.map((m) => ({
      cutoff: {
        id: m.id,
        exam: m.exam,
        category: m.category,
        year: m.year,
        minScore: m.minScore,
      },
      course: {
        id: m.course.id,
        name: m.course.name,
        level: m.course.level,
        duration: m.course.duration,
        totalFees: m.course.totalFees,
      },
      college: {
        id: m.course.college.id,
        name: m.course.college.name,
        location: m.course.college.location,
        rating: m.course.college.rating,
      },
    }));

    return NextResponse.json({ results });
  } catch (error) {
    if (isDbUnavailableError(error)) {
      return NextResponse.json(
        { message: DB_UNAVAILABLE_MESSAGE } satisfies ApiError,
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: "Failed to run predictor" } satisfies ApiError,
      { status: 500 }
    );
  }
}
