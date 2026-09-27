import { getUser, sameOrigin } from "@/lib/auth";
import { ticketSchema, type Ticket } from "@/lib/domain";
import { tickets } from "@/lib/store";
export async function GET() {
  if (!(await getUser()))
    return Response.json({ error: "Please sign in" }, { status: 401 });
  return Response.json(tickets);
}
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return Response.json({ error: "Please sign in" }, { status: 401 });
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const result = ticketSchema.safeParse(await request.json().catch(() => null));
  if (!result.success)
    return Response.json(
      { error: "Invalid ticket", issues: result.error.issues },
      { status: 400 },
    );
  const now = new Date().toISOString();
  const ticket: Ticket = {
    ...result.data,
    id: `OPS-${Math.max(...tickets.map((t) => Number(t.id.slice(4)))) + 1}`,
    createdAt: now,
    closedAt: result.data.status === "Closed" ? now : null,
    dueAt: new Date(Date.now() + 48 * 3600000).toISOString(),
    activity: [{ text: "Ticket created", at: now, actor: user.name }],
  };
  tickets.unshift(ticket);
  return Response.json(ticket, { status: 201 });
}
