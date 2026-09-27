import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { users } from "./domain";
// Public demo secret is intentional: this is mock authentication, not production identity.
const secret = process.env.SESSION_SECRET || "opsboard-public-demo-only";
export function token(email: string) {
  const payload = Buffer.from(
    JSON.stringify({ email, expires: Date.now() + 86400000 }),
  ).toString("base64url");
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("hex")}`;
}
export async function getUser() {
  const value = (await cookies()).get("ops-session")?.value;
  if (!value) return null;
  try {
    const [payload, signature] = value.split(".");
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    if (
      !signature ||
      signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    )
      return null;
    const data: { email: string; expires: number } = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    );
    return data.expires > Date.now()
      ? (users.find((u) => u.email === data.email) ?? null)
      : null;
  } catch {
    return null;
  }
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const source = new URL(origin);
    const target = new URL(request.url);
    // Next may normalize request.url to localhost behind its local/proxy server.
    const host = request.headers.get("host") ?? target.host;
    return (
      (source.protocol === "http:" || source.protocol === "https:") &&
      source.host === host
    );
  } catch {
    return false;
  }
}
