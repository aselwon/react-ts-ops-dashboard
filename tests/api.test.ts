import { beforeEach, describe, expect, it, vi } from "vitest";
const auth = vi.hoisted(() => ({
  user: null as null | { name: string; email: string; role: "admin" | "agent" },
}));
vi.mock("../src/lib/auth", () => ({
  getUser: async () => auth.user,
  sameOrigin: () => true,
}));
import { GET, POST } from "../src/app/api/tickets/route";
import { PATCH } from "../src/app/api/tickets/[id]/route";
import { seedTickets } from "../src/lib/store";
describe("mock ticket API", () => {
  beforeEach(() => {
    auth.user = null;
  });
  it("rejects anonymous reads and writes", async () => {
    expect((await GET()).status).toBe(401);
    expect(
      (
        await POST(
          new Request("http://localhost/api/tickets", {
            method: "POST",
            body: "{}",
          }),
        )
      ).status,
    ).toBe(401);
  });
  it("validates input before creating records", async () => {
    auth.user = { name: "Agent", email: "agent@demo.com", role: "agent" };
    expect(
      (
        await POST(
          new Request("http://localhost/api/tickets", {
            method: "POST",
            body: JSON.stringify({ title: "Bad" }),
          }),
        )
      ).status,
    ).toBe(400);
  });
  it("creates and closes a ticket with activity", async () => {
    auth.user = { name: "Agent", email: "agent@demo.com", role: "agent" };
    const input = { ...seedTickets()[0], title: "API customer request" };
    const response = await POST(
      new Request("http://localhost/api/tickets", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    );
    expect(response.status).toBe(201);
    const created = await response.json();
    const updated = await PATCH(
      new Request(`http://localhost/api/tickets/${created.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...input, status: "Closed" }),
      }),
      { params: Promise.resolve({ id: created.id }) },
    );
    expect(updated.status).toBe(200);
    const result = await updated.json();
    expect(result.closedAt).toBeTruthy();
    expect(result.activity[0].text).toBe("Updated status");
    expect(result.activity[0].actor).toBe("Agent");
  });
  it("returns not found for missing ticket", async () => {
    auth.user = { name: "Agent", email: "agent@demo.com", role: "agent" };
    expect(
      (
        await PATCH(
          new Request("http://localhost/api/tickets/missing", {
            method: "PATCH",
            body: "{}",
          }),
          { params: Promise.resolve({ id: "missing" }) },
        )
      ).status,
    ).toBe(404);
  });
});
