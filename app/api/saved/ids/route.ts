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

      const rows = await prisma.userSavedCollege.findMany({
        where: { userId: user.id },
        select: { collegeId: true },
      });

      return NextResponse.json({ ids: rows.map((r) => r.collegeId) });
    }

    const { deviceId, isNew } = getOrCreateDeviceId(request);

    const rows = await prisma.savedCollege.findMany({
      where: { deviceId },
      select: { collegeId: true },
    });

    const response = NextResponse.json({ ids: rows.map((r) => r.collegeId) });
    if (isNew) setDeviceIdCookie(response, deviceId);
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to load saved ids" } satisfies ApiError,
      { status: 500 }
    );
  }
}
