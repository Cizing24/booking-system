import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/src/lib/prisma";

export const ADMIN_SESSION_COOKIE_NAME = "booking_admin_session";

type AdminSessionPayload = {
  adminUserId: string;
  expiresAt: number;
};

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }

  return secret;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function createSessionToken(adminUserId: string) {
  const payload: AdminSessionPayload = {
    adminUserId,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token: string): AdminSessionPayload | null {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);

  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    )
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AdminSessionPayload;

    if (!payload.adminUserId || !payload.expiresAt) {
      return null;
    }

    if (payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function setAdminSession(adminUserId: string) {
  const cookieStore = await cookies();
  const token = createSessionToken(adminUserId);

  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_SESSION_COOKIE_NAME);
}

export async function getCurrentAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = verifySessionToken(token);

  if (!payload) {
    return null;
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: {
      id: payload.adminUserId,
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return adminUser;
}