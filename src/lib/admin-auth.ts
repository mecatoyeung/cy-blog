import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "admin_session";

type AdminSessionPayload = {
  role: "admin";
  iat: number;
};

function toBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getAdminPassword() {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value && value.length > 0 ? value : null;
}

function signPayload(encodedPayload: string, password: string) {
  return createHmac("sha256", password).update(encodedPayload).digest("base64url");
}

export function hasAdminPasswordConfigured() {
  return getAdminPassword() !== null;
}

export function createAdminSessionToken() {
  const password = getAdminPassword();
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not configured.");
  }

  const payload: AdminSessionPayload = {
    role: "admin",
    iat: Date.now(),
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload, password);
  return `${encodedPayload}.${signature}`;
}

export function validateAdminPassword(input: string) {
  const password = getAdminPassword();
  if (!password) {
    return false;
  }

  const expected = Buffer.from(password);
  const provided = Buffer.from(input);

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(expected, provided);
}

export function isValidAdminSessionToken(token: string) {
  const password = getAdminPassword();
  if (!password) {
    return false;
  }

  const [encodedPayload, providedSignature] = token.split(".");
  if (!encodedPayload || !providedSignature) {
    return false;
  }

  const expectedSignature = signPayload(encodedPayload, password);
  const expectedBuffer = Buffer.from(expectedSignature);
  const providedBuffer = Buffer.from(providedSignature);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  const isSignatureValid = timingSafeEqual(expectedBuffer, providedBuffer);
  if (!isSignatureValid) {
    return false;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as AdminSessionPayload;
    return payload.role === "admin" && typeof payload.iat === "number";
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    return false;
  }

  return isValidAdminSessionToken(token);
}
