import type { NextRequest, NextResponse } from "next/server";

export const DEVICE_ID_COOKIE_NAME = "cdp_device_id";

export function getOrCreateDeviceId(request: NextRequest): {
  deviceId: string;
  isNew: boolean;
} {
  const fromCookie = request.cookies.get(DEVICE_ID_COOKIE_NAME)?.value;
  if (fromCookie) return { deviceId: fromCookie, isNew: false };

  return { deviceId: crypto.randomUUID(), isNew: true };
}

export function setDeviceIdCookie(
  response: NextResponse,
  deviceId: string
): void {
  response.cookies.set(DEVICE_ID_COOKIE_NAME, deviceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}
