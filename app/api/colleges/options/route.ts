import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Lightweight endpoint for dropdowns/autocomplete.
    // We only return what the UI needs to render a list.
    const colleges = await prisma.college.findMany({
      select: {
        id: true,
        name: true,
        location: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(colleges);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch college options" },
      { status: 500 }
    );
  }
}
