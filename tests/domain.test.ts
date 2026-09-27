import { describe, expect, it } from "vitest";
import { breached, summarize, ticketSchema } from "../src/lib/domain";
import { seedTickets } from "../src/lib/store";
describe("ticket domain", () => {
  const now = Date.UTC(2026, 8, 26, 12);
  const seed = seedTickets(now);
  it("seeds at least 30 valid unique tickets", () => {
    expect(seed.length).toBeGreaterThanOrEqual(30);
    expect(new Set(seed.map((t) => t.id)).size).toBe(seed.length);
    seed.forEach((t) => expect(ticketSchema.safeParse(t).success).toBe(true));
  });
  it("rejects empty and malformed customer input", () => {
    expect(
      ticketSchema.safeParse({
        ...seed[0],
        title: " ",
        description: "short",
        customer: "invalid",
      }).success,
    ).toBe(false);
  });
  it("calculates status counts and safe empty metrics", () => {
    const metrics = summarize(seed, now);
    expect(metrics.statuses.reduce((sum, s) => sum + s.value, 0)).toBe(
      seed.length,
    );
    expect(metrics.open + metrics.closed).toBe(seed.length);
    expect(summarize([], now).sla).toBe(0);
    expect(metrics.trend).toHaveLength(7);
  });
  it("uses resolution time for closed SLA and now for active tickets", () => {
    const t = {
      ...seed[0],
      dueAt: new Date(now - 1000).toISOString(),
      closedAt: new Date(now - 2000).toISOString(),
    };
    expect(breached(t, now)).toBe(false);
    expect(breached({ ...t, closedAt: null }, now)).toBe(true);
    expect(breached({ ...t, closedAt: new Date(now).toISOString() }, now)).toBe(
      true,
    );
  });
});
