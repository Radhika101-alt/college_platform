import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = (searchParams.get("search") ?? "").trim()
    const location = (searchParams.get("location") ?? "").trim();

    const limitRaw = (searchParams.get("limit") ?? "").trim();
    const offsetRaw = (searchParams.get("offset") ?? "").trim();
    const limitNum = Number(limitRaw);
    const offsetNum = Number(offsetRaw);

    const take = Number.isFinite(limitNum)
      ? Math.min(50, Math.max(1, Math.floor(limitNum)))
      : null;
    const skip = Number.isFinite(offsetNum)
      ? Math.max(0, Math.floor(offsetNum))
      : 0;

    const minFeesRaw = (searchParams.get("minFees") ?? "").trim();
    const maxFeesRaw = (searchParams.get("maxFees") ?? "").trim();
    const minFees = Number.isFinite(Number(minFeesRaw)) ? Number(minFeesRaw) : null;
    const maxFees = Number.isFinite(Number(maxFeesRaw)) ? Number(maxFeesRaw) : null;

    // Build a Prisma `where` object in a safe, beginner-friendly way.
    // - If a filter is empty/invalid, we skip it.
    // - This keeps the endpoint backward compatible.
    const where: Prisma.CollegeWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } },
                { overview: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        location
          ? {
              location: { equals: location, mode: "insensitive" },
            }
          : {},
        minFees !== null || maxFees !== null
          ? {
              fees: {
                ...(minFees !== null ? { gte: Math.max(0, Math.floor(minFees)) } : {}),
                ...(maxFees !== null ? { lte: Math.max(0, Math.floor(maxFees)) } : {}),
              },
            }
          : {},
      ],
    };

    const colleges = await prisma.college.findMany({
      where,
      orderBy: { rating: "desc" },
      ...(take !== null ? { take, skip } : {}),
    })

    return NextResponse.json(colleges)
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch colleges" },
      { status: 500 }
    )
  }
}