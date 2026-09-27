import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { Providers } from "../src/components/providers";
import { TicketForm } from "../src/components/ticket-form";
it("shows field errors and focuses the first invalid field", () => {
  const done = vi.fn();
  render(
    <Providers>
      <TicketForm onDone={done} />
    </Providers>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Create ticket" }));
  expect(screen.getByText("Use at least 5 characters")).toBeInTheDocument();
  expect(screen.getByLabelText("Ticket title")).toHaveFocus();
  expect(screen.getByLabelText("Customer email")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  expect(done).not.toHaveBeenCalled();
});
