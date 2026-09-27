import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { Empty, ErrorState, Loading } from "../src/components/shared";
it("announces loading accessibly", () => {
  render(<Loading />);
  expect(
    screen.getByRole("status", { name: "Loading workspace" }),
  ).toBeVisible();
});
it("provides retry after failure", () => {
  const retry = vi.fn();
  render(<ErrorState message="Connection interrupted" retry={retry} />);
  expect(screen.getByRole("alert")).toHaveTextContent("Connection interrupted");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(retry).toHaveBeenCalledOnce();
});
it("explains an empty search", () => {
  render(<Empty />);
  expect(
    screen.getByText("Try a different search or clear your filters."),
  ).toBeVisible();
});
