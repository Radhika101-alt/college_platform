import { prisma } from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: "Invalid college id" }, { status: 400 });
    }

    const college = await prisma.college.findUnique({
      where: { id },
    });

    if (!college) {
      return NextResponse.json({ message: "College not found" }, { status: 404 });
    }

    return NextResponse.json(college);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch college" },
      { status: 500 }
    );
  }
}
