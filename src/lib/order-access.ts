import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "silk-room-order-access";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function signingSecret() {
  return (
    process.env.ORDER_ACCESS_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.RAZORPAY_KEY_SECRET ||
    "silk-room-dev-order-access"
  );
}

export function createOrderAccessToken(orderNumber: string) {
  const payload = `${orderNumber.toUpperCase()}.${Date.now()}`;
  const signature = crypto
    .createHmac("sha256", signingSecret())
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

export function verifyOrderAccessToken(token: string, orderNumber: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [storedOrder, issuedAt, signature] = parts;
  if (!storedOrder || !issuedAt || !signature) return false;
  if (storedOrder !== orderNumber.toUpperCase()) return false;
  const ageMs = Date.now() - Number(issuedAt);
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > MAX_AGE_SECONDS * 1000) {
    return false;
  }
  const expected = crypto
    .createHmac("sha256", signingSecret())
    .update(`${storedOrder}.${issuedAt}`)
    .digest("hex");
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  return (
    expectedBuf.length === actualBuf.length &&
    crypto.timingSafeEqual(expectedBuf, actualBuf)
  );
}

export async function grantOrderAccess(orderNumber: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, createOrderAccessToken(orderNumber), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function hasOrderAccess(orderNumber: string) {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyOrderAccessToken(token, orderNumber);
}
