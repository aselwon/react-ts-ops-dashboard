import { getUser, sameOrigin } from "@/lib/auth";
import { ticketSchema } from "@/lib/domain";
import { tickets } from "@/lib/store";
type Context = { params: Promise<{ id: string }> };
export async function GET(_: Request, ctx: Context) {
  if (!(await getUser()))
    return Response.json({ error: "Please sign in" }, { status: 401 });
  const { id } = await ctx.params;
  const ticket = tickets.find((t) => t.id === id);
  return Response.json(ticket ?? { error: "Ticket not found" }, {
    status: ticket ? 200 : 404,
  });
}
export async function PATCH(request: Request, ctx: Context) {
  const user = await getUser();
  if (!user) return Response.json({ error: "Please sign in" }, { status: 401 });
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const { id } = await ctx.params;
  const ticket = tickets.find((t) => t.id === id);
  if (!ticket)
    return Response.json({ error: "Ticket not found" }, { status: 404 });
  const result = ticketSchema.safeParse(await request.json().catch(() => null));
  if (!result.success)
    return Response.json({ error: "Invalid ticket" }, { status: 400 });
  const changes = (
    Object.keys(result.data) as (keyof typeof result.data)[]
  ).filter((key) => ticket[key] !== result.data[key]);
  const now = new Date().toISOString();
  const closedAt =
    result.data.status === "Closed" ? (ticket.closedAt ?? now) : null;
  Object.assign(ticket, result.data, { closedAt });
  if (changes.length)
    ticket.activity.unshift({
      text: `Updated ${changes.join(", ")}`,
      at: now,
      actor: user.name,
    });
  return Response.json(ticket);
}
