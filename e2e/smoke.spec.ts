import { test, expect } from "@playwright/test";
test("admin can create, edit, filter, inspect metrics and sign out", async ({
  page,
}) => {
  await page.goto("/tickets");
  await expect(page).toHaveURL(/login/);
  await page.getByRole("button", { name: "Enter workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Tickets.", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Team members" })).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/page=1/);
  await page.getByRole("button", { name: "Previous", exact: true }).click();
  await page.getByLabel("Filter by status").selectOption("Open");
  await expect(page).toHaveURL(/status=Open/);
  await page.getByLabel("Filter by priority").selectOption("Low");
  await expect(page).toHaveURL(/priority=Low/);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByRole("button", { name: "Subject", exact: true }).click();
  await expect(page).toHaveURL(/sort=title/);
  await page.locator("summary").filter({ hasText: "Columns" }).click();
  await page.getByLabel("Assignee", { exact: true }).uncheck();
  await expect(
    page.getByRole("columnheader", { name: "Assignee" }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("columnheader", { name: "Assignee" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "New ticket" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "New ticket" })).toBeFocused();
  await page.getByRole("button", { name: "New ticket" }).click();
  await page.getByLabel("Ticket title").fill("Smoke test customer request");
  await page.getByLabel("Customer email").fill("smoke@example.com");
  await page
    .getByLabel("Description", { exact: true })
    .fill("A customer needs help with their workspace setup.");
  await page
    .getByRole("button", { name: "Create ticket", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Smoke test customer request" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit ticket" }).click();
  await page.getByLabel("Status", { exact: true }).selectOption("Closed");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Updated status")).toBeVisible();
  await page.getByRole("link", { name: "Back to tickets" }).click();
  await page
    .getByRole("textbox", { name: "Search tickets" })
    .fill("Smoke test customer request");
  await expect(page).toHaveURL(/q=Smoke/);
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Ticket activity" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Team members" }).click();
  await expect(
    page.getByRole("heading", { name: "Workspace members" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/login/);
});
test("agent is gated from users and mobile theme/navigation work", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await page.getByLabel("Demo account").selectOption("agent@demo.com");
  await page.getByRole("button", { name: "Enter workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Tickets.", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("link", { name: "Team members" })).toHaveCount(0);
  await page
    .getByRole("button", { name: "Close navigation", exact: true })
    .last()
    .click();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.goto("/users");
  await expect(page).toHaveURL(/tickets/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("textbox", { name: "Search tickets" })
    .fill("no-such-ticket-ever");
  await expect(
    page.getByRole("heading", { name: "No tickets match your filters" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
