import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Distinct locations for the filter dropdown.
    const locationsRaw = await prisma.college.findMany({
      distinct: ["location"],
      select: { location: true },
      orderBy: { location: "asc" },
    });

    const locations = locationsRaw
      .map((row) => row.location)
      .filter((value): value is string => Boolean(value && value.trim()));

    // Fees range can be used to set helpful placeholders.
    const feesAgg = await prisma.college.aggregate({
      _min: { fees: true },
      _max: { fees: true },
    });

    return NextResponse.json({
      locations,
      fees: {
        min: feesAgg._min.fees ?? 0,
        max: feesAgg._max.fees ?? 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch colleges metadata" },
      { status: 500 }
    );
  }
}
