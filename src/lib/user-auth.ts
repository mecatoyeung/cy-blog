import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

export const USER_SESSION_COOKIE = "user_session";

type UserSessionPayload = {
  role: "user";
  iat: number;
};

function toBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getUserPassword() {
  const value = process.env.USER_PASSWORD?.trim();
  return value && value.length > 0 ? value : null;
}

function signPayload(encodedPayload: string, password: string) {
  return createHmac("sha256", password).update(encodedPayload).digest("base64url");
}

export function hasUserPasswordConfigured() {
  return getUserPassword() !== null;
}

export function createUserSessionToken() {
  const password = getUserPassword();
  if (!password) {
    throw new Error("USER_PASSWORD is not configured.");
  }

  const payload: UserSessionPayload = {
    role: "user",
    iat: Date.now(),
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload, password);
  return `${encodedPayload}.${signature}`;
}

export function validateUserPassword(input: string) {
  const password = getUserPassword();
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

export function isValidUserSessionToken(token: string) {
  const password = getUserPassword();
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
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as UserSessionPayload;
    return payload.role === "user" && typeof payload.iat === "number";
  } catch {
    return false;
  }
}

export async function isUserAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_SESSION_COOKIE)?.value;
  if (!token) {
    return false;
  }

  return isValidUserSessionToken(token);
}