import { createHash } from "node:crypto";

function getUserPassword() {
  const value = process.env.USER_PASSWORD?.trim();
  return value && value.length > 0 ? value : null;
}

export function hasUserPasswordConfigured() {
  return getUserPassword() !== null;
}

export function getUserPasswordHash() {
  const password = getUserPassword();
  if (!password) {
    return null;
  }

  return createHash("sha256").update(password).digest("hex");
}