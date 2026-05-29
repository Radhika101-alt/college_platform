import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function parseIds(raw: string | null) {
  if (!raw) return [];

  // Accept either: ids=1,2,3 OR ids=1&ids=2 style is out of scope.
  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const ids = parts
    .map((p) => Number(p))
    .filter((n) => Number.isFinite(n))
    .map((n) => Math.floor(n));

  // Remove duplicates while preserving order.
  const unique: number[] = [];
  for (const id of ids) {
    if (id <= 0) continue;
    if (!unique.includes(id)) unique.push(id);
  }

  return unique;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = parseIds(searchParams.get("ids"));

    // MVP constraint: keep comparison readable.
    if (ids.length < 2) {
      return NextResponse.json(
        { message: "Please provide at least 2 college ids to compare." },
        { status: 400 }
      );
    }

    if (ids.length > 4) {
      return NextResponse.json(
        { message: "You can compare up to 4 colleges at a time." },
        { status: 400 }
      );
    }

    const colleges = await prisma.college.findMany({
      where: { id: { in: ids } },
    });

    // Preserve the order of ids in the response.
    const byId = new Map(colleges.map((c) => [c.id, c] as const));
    const ordered = ids.map((id) => byId.get(id)).filter(Boolean);

    return NextResponse.json(ordered);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to compare colleges" },
      { status: 500 }
    );
  }
}
