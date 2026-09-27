import { expect, it, vi } from "vitest";
const session = vi.hoisted(() => ({ value: "" }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => (session.value ? { value: session.value } : undefined),
  }),
}));
import { getUser, sameOrigin, token } from "../src/lib/auth";
it("accepts signed demo sessions and rejects tampering", async () => {
  session.value = token("admin@demo.com");
  expect((await getUser())?.role).toBe("admin");
  session.value += "0";
  expect(await getUser()).toBeNull();
  session.value = token("unknown@demo.com");
  expect(await getUser()).toBeNull();
  session.value = "";
  expect(await getUser()).toBeNull();
});
it("rejects cross-origin mutations", () => {
  expect(
    sameOrigin(
      new Request("http://localhost/api/session", {
        headers: { origin: "https://other.example" },
      }),
    ),
  ).toBe(false);
  expect(
    sameOrigin(
      new Request("http://localhost/api/session", {
        headers: { origin: "http://localhost" },
      }),
    ),
  ).toBe(true);
});
it("uses the incoming host when Next normalizes the internal URL", () => {
  expect(
    sameOrigin(
      new Request("http://localhost:3000/api/session", {
        headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000" },
      }),
    ),
  ).toBe(true);
  expect(
    sameOrigin(
      new Request("http://localhost:3000/api/session", {
        headers: { host: "127.0.0.1:3000", origin: "https://attacker.example" },
      }),
    ),
  ).toBe(false);
});
