import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

type ApiError = {
  message?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { email?: unknown; password?: unknown; name?: unknown }
      | null;

    const emailRaw = body?.email;
    const passwordRaw = body?.password;
    const nameRaw = body?.name;

    const email = typeof emailRaw === "string" ? emailRaw.toLowerCase().trim() : "";
    const password = typeof passwordRaw === "string" ? passwordRaw : "";
    const name = typeof nameRaw === "string" ? nameRaw.trim() : undefined;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { message: "Invalid email" } satisfies ApiError,
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" } satisfies ApiError,
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "Email is already registered" } satisfies ApiError,
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to register" } satisfies ApiError,
      { status: 500 }
    );
  }
}
