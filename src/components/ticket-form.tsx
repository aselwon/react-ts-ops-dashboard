"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assignees,
  priorities,
  statuses,
  ticketSchema,
  type Ticket,
  type TicketInput,
} from "@/lib/domain";
import { api } from "@/lib/api";
import { useUI } from "./providers";
export function TicketForm({
  ticket,
  onDone,
}: {
  ticket?: Ticket;
  onDone: (ticket: Ticket) => void;
}) {
  const [values, setValues] = useState<TicketInput>(
    ticket ?? {
      title: "",
      description: "",
      customer: "",
      priority: "Medium",
      status: "Open",
      assignee: "Unassigned",
    },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const client = useQueryClient();
  const { notify } = useUI();
  const mutation = useMutation({
    mutationFn: (data: TicketInput) =>
      api<Ticket>(ticket ? `/api/tickets/${ticket.id}` : "/api/tickets", {
        method: ticket ? "PATCH" : "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      client.invalidateQueries({ queryKey: ["tickets"] });
      client.invalidateQueries({ queryKey: ["ticket", data.id] });
      client.invalidateQueries({ queryKey: ["kpis"] });
      notify(
        ticket
          ? "Ticket updated successfully"
          : `${data.id} created successfully`,
      );
      onDone(data);
    },
  });
  const field = (
    key: keyof TicketInput,
    label: string,
    options?: readonly string[],
  ) => (
    <div
      className={key === "title" || key === "description" ? "full-field" : ""}
    >
      <label htmlFor={key}>{label}</label>
      {options ? (
        <select
          id={key}
          value={values[key]}
          onChange={(e) => setValues({ ...values, [key]: e.target.value })}
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : key === "description" ? (
        <textarea
          id={key}
          rows={5}
          value={values[key]}
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `${key}-error` : undefined}
          onChange={(e) => setValues({ ...values, [key]: e.target.value })}
        />
      ) : (
        <input
          id={key}
          value={values[key]}
          type={key === "customer" ? "email" : "text"}
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `${key}-error` : undefined}
          onChange={(e) => setValues({ ...values, [key]: e.target.value })}
        />
      )}{" "}
      {errors[key] && (
        <p className="error-text" id={`${key}-error`}>
          {errors[key]}
        </p>
      )}
    </div>
  );
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const result = ticketSchema.safeParse(values);
        if (!result.success) {
          const next: Record<string, string> = {};
          result.error.issues.forEach((i) => {
            next[String(i.path[0])] = i.message;
          });
          setErrors(next);
          document
            .getElementById(String(result.error.issues[0].path[0]))
            ?.focus();
          return;
        }
        setErrors({});
        mutation.mutate(result.data);
      }}
    >
      <div className="form-grid">
        {field("title", "Ticket title")}
        {field("customer", "Customer email")}
        {field("priority", "Priority", priorities)}
        {field("status", "Status", statuses)}
        {field("assignee", "Assignee", assignees)}
        {field("description", "Description")}
      </div>
      {mutation.error && (
        <p role="alert" className="error-text">
          {mutation.error.message}
        </p>
      )}
      <div className="form-actions">
        <button className="btn primary" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Saving…"
            : ticket
              ? "Save changes"
              : "Create ticket"}
        </button>
      </div>
    </form>
  );
}
