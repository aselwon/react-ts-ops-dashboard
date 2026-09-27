import { cookies } from "next/headers";
import { getUser, sameOrigin, token } from "@/lib/auth";
import { users } from "@/lib/domain";
export async function GET() {
  const user = await getUser();
  return Response.json(user, { status: user ? 200 : 401 });
}
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  const body = await request.json().catch(() => null);
  const user = users.find((u) => u.email === body?.email);
  if (!user)
    return Response.json({ error: "Choose a demo account" }, { status: 400 });
  (await cookies()).set("ops-session", token(user.email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 86400,
  });
  return Response.json(user);
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  (await cookies()).delete("ops-session");
  return new Response(null, { status: 204 });
}
