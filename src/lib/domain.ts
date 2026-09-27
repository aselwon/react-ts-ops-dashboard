import { z } from "zod";
export const statuses = ["Open", "In progress", "Pending", "Closed"] as const;
export const priorities = ["Low", "Medium", "High", "Urgent"] as const;
export const assignees = [
  "Unassigned",
  "Alex Morgan",
  "Jamie Chen",
  "Sam Rivera",
] as const;
export const ticketSchema = z.object({
  title: z.string().trim().min(5, "Use at least 5 characters").max(120),
  description: z
    .string()
    .trim()
    .min(10, "Add at least 10 characters of context")
    .max(4000),
  customer: z.email("Enter a valid customer email"),
  status: z.enum(statuses),
  priority: z.enum(priorities),
  assignee: z.enum(assignees),
});
export type TicketInput = z.infer<typeof ticketSchema>;
export type Ticket = TicketInput & {
  id: string;
  createdAt: string;
  closedAt: string | null;
  dueAt: string;
  activity: { text: string; at: string; actor: string }[];
};
export type User = { email: string; name: string; role: "admin" | "agent" };
export const users: User[] = [
  { email: "admin@demo.com", name: "Alex Morgan", role: "admin" },
  { email: "agent@demo.com", name: "Jamie Chen", role: "agent" },
];
export function breached(t: Ticket, now = Date.now()) {
  return new Date(t.closedAt ?? now).getTime() > new Date(t.dueAt).getTime();
}
export function summarize(tickets: Ticket[], now = Date.now()) {
  const closed = tickets.filter((t) => t.status === "Closed").length;
  const breaches = tickets.filter((t) => breached(t, now)).length;
  return {
    total: tickets.length,
    open: tickets.length - closed,
    closed,
    breaches,
    sla: tickets.length ? Math.round((breaches / tickets.length) * 100) : 0,
    statuses: statuses.map((status) => ({
      name: status,
      value: tickets.filter((t) => t.status === status).length,
    })),
    trend: Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now - (6 - i) * 86400000)
        .toISOString()
        .slice(0, 10);
      return {
        date,
        created: tickets.filter((t) => t.createdAt.startsWith(date)).length,
        closed: tickets.filter((t) => t.closedAt?.startsWith(date)).length,
      };
    }),
  };
}
export type Metrics = ReturnType<typeof summarize>;
