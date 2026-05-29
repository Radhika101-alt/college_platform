import { prisma } from "@/lib/prisma";
import { getOrCreateDeviceId, setDeviceIdCookie } from "@/lib/device";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse, type NextRequest } from "next/server";

type ApiError = {
  message?: string;
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase().trim();

    if (email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json(
          { message: "User not found" } satisfies ApiError,
          { status: 404 }
        );
      }

      const saved = await prisma.userSavedCollege.findMany({
        where: { userId: user.id },
        include: { college: true },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        colleges: saved.map((row) => row.college),
      });
    }

    const { deviceId, isNew } = getOrCreateDeviceId(request);

    const saved = await prisma.savedCollege.findMany({
      where: { deviceId },
      include: { college: true },
      orderBy: { createdAt: "desc" },
    });

    const response = NextResponse.json({
      colleges: saved.map((row) => row.college),
    });

    if (isNew) setDeviceIdCookie(response, deviceId);
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to load saved colleges" } satisfies ApiError,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase().trim();

    const { deviceId, isNew } = getOrCreateDeviceId(request);

    const body = (await request.json().catch(() => null)) as
      | { collegeId?: unknown }
      | null;

    const collegeIdRaw = body?.collegeId;
    const collegeId = Number(collegeIdRaw);

    if (!Number.isFinite(collegeId)) {
      return NextResponse.json(
        { message: "Invalid collegeId" } satisfies ApiError,
        { status: 400 }
      );
    }

    const id = Math.floor(collegeId);

    const college = await prisma.college.findUnique({ where: { id } });
    if (!college) {
      return NextResponse.json(
        { message: "College not found" } satisfies ApiError,
        { status: 404 }
      );
    }

    if (email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json(
          { message: "User not found" } satisfies ApiError,
          { status: 404 }
        );
      }

      await prisma.userSavedCollege.upsert({
        where: {
          userId_collegeId: {
            userId: user.id,
            collegeId: id,
          },
        },
        create: {
          userId: user.id,
          collegeId: id,
        },
        update: {},
      });

      return NextResponse.json({ ok: true });
    }

    await prisma.savedCollege.upsert({
      where: {
        deviceId_collegeId: {
          deviceId,
          collegeId: id,
        },
      },
      create: {
        deviceId,
        collegeId: id,
      },
      update: {},
    });

    const response = NextResponse.json({ ok: true });
    if (isNew) setDeviceIdCookie(response, deviceId);
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to save college" } satisfies ApiError,
      { status: 500 }
    );
  }
}
