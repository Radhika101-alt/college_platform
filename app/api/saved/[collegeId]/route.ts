import { prisma } from "@/lib/prisma";
import { getOrCreateDeviceId, setDeviceIdCookie } from "@/lib/device";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse, type NextRequest } from "next/server";

type ApiError = {
  message?: string;
};

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ collegeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase().trim();

    const { deviceId, isNew } = getOrCreateDeviceId(request);

    const { collegeId: collegeIdParam } = await context.params;
    const id = Number(collegeIdParam);

    if (!Number.isFinite(id)) {
      return NextResponse.json(
        { message: "Invalid college id" } satisfies ApiError,
        { status: 400 }
      );
    }

    const collegeId = Math.floor(id);

    if (email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json(
          { message: "User not found" } satisfies ApiError,
          { status: 404 }
        );
      }

      await prisma.userSavedCollege.deleteMany({
        where: {
          userId: user.id,
          collegeId,
        },
      });

      return NextResponse.json({ ok: true });
    }

    await prisma.savedCollege.deleteMany({
      where: {
        deviceId,
        collegeId,
      },
    });

    const response = NextResponse.json({ ok: true });
    if (isNew) setDeviceIdCookie(response, deviceId);
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to unsave college" } satisfies ApiError,
      { status: 500 }
    );
  }
}
