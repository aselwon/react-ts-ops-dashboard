import { assignees, priorities, statuses, type Ticket } from "./domain";
const subjects = [
  "Unable to access team workspace",
  "Invoice total does not match plan",
  "Webhook delivery timing out",
  "Export missing recent transactions",
  "SSO redirect loop on sign-in",
  "Order confirmation not received",
  "Update billing contact details",
  "Dashboard reporting delayed",
  "API rate limit clarification",
  "Duplicate payment notification",
  "Team invitation link expired",
  "Integration sync interrupted",
];
export function seedTickets(now = Date.now()): Ticket[] {
  return Array.from({ length: 48 }, (_, i) => {
    const created = now - (i % 7) * 86400000 - (i % 12) * 3600000;
    const status = statuses[i % 4];
    return {
      id: `OPS-${1048 - i}`,
      title: subjects[i % subjects.length],
      description:
        "Customer reported an issue affecting their daily workflow. Please investigate the account, confirm the root cause, and follow up with next steps.",
      customer: `${["olivia", "ethan", "mia", "noah", "ava", "liam"][i % 6]}@${["acme.io", "linearworks.co", "northstar.dev"][i % 3]}`,
      status,
      priority: priorities[(i * 7) % 4],
      assignee: assignees[i % 4],
      createdAt: new Date(created).toISOString(),
      closedAt:
        status === "Closed"
          ? new Date(created + 6 * 3600000).toISOString()
          : null,
      dueAt: new Date(created + 48 * 3600000).toISOString(),
      activity: [
        {
          text: "Ticket created",
          at: new Date(created).toISOString(),
          actor: "Customer",
        },
      ],
    };
  });
}
const globalStore = globalThis as typeof globalThis & { opsTickets?: Ticket[] };
export const tickets = (globalStore.opsTickets ??= seedTickets());
