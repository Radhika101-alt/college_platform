import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getOrCreateDeviceId, setDeviceIdCookie } from "@/lib/device";

type ApiError = {
  message?: string;
};

export async function POST(request: NextRequest) {
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

    const { deviceId, isNew } = getOrCreateDeviceId(request);

    const deviceSaved = await prisma.savedCollege.findMany({
      where: { deviceId },
      select: { collegeId: true },
    });

    if (deviceSaved.length === 0) {
      const response = NextResponse.json({ mergedCount: 0 });
      if (isNew) setDeviceIdCookie(response, deviceId);
      return response;
    }

    await prisma.$transaction(async (tx) => {
      for (const row of deviceSaved) {
        await tx.userSavedCollege.upsert({
          where: {
            userId_collegeId: {
              userId: user.id,
              collegeId: row.collegeId,
            },
          },
          create: {
            userId: user.id,
            collegeId: row.collegeId,
          },
          update: {},
        });
      }

      await tx.savedCollege.deleteMany({ where: { deviceId } });
    });

    const response = NextResponse.json({ mergedCount: deviceSaved.length });
    if (isNew) setDeviceIdCookie(response, deviceId);
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to merge saved colleges" } satisfies ApiError,
      { status: 500 }
    );
  }
}
