import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

const SESSION_COOKIE = "tt_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

type SessionPayload = {
  userId: string;
  role: string;
  expiresAt: number;
};

function getSessionSecret() {
  if (!env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is required for auth.");
  }

  return env.SESSION_SECRET;
}

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(value: string) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as SessionPayload;
}

function signValue(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function createSessionToken(payload: SessionPayload) {
  const encoded = encodePayload(payload);
  const signature = signValue(encoded);
  return `${encoded}.${signature}`;
}

function verifySessionToken(token: string) {
  const [encoded, providedSignature] = token.split(".");

  if (!encoded || !providedSignature) {
    return null;
  }

  const expectedSignature = signValue(encoded);
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  const payload = decodePayload(encoded);

  if (Date.now() > payload.expiresAt) {
    return null;
  }

  return payload;
}

export async function createUserSession(userId: string, role: string, persist = false) {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + (persist ? SESSION_TTL_MS : 1000 * 60 * 60 * 8);
  const token = createSessionToken({ userId, role, expiresAt });

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt)
  });
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function getCurrentUser() {
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  return db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      mustChangePassword: true,
      isActive: true
    }
  });
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user || !user.isActive) {
    redirect("/login");
  }

  return user;
}
