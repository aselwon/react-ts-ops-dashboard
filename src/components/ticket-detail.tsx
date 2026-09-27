"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Clock3 } from "lucide-react";
import { api } from "@/lib/api";
import { type Ticket, breached } from "@/lib/domain";
import { Badge, ErrorState, Loading } from "./shared";
import { TicketForm } from "./ticket-form";
export function TicketDetail({ id }: { id: string }) {
  const [editing, setEditing] = useState(false);
  const query = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => api<Ticket>(`/api/tickets/${id}`),
  });
  if (query.isLoading) return <Loading />;
  if (query.error)
    return (
      <ErrorState message={query.error.message} retry={() => query.refetch()} />
    );
  const ticket = query.data;
  if (!ticket) return null;
  return (
    <>
      <Link href="/tickets" className="text-link back-link">
        <ArrowLeft size={16} />
        Back to tickets
      </Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{ticket.id} · TICKET DETAIL</span>
          <h1 className="detail-title">{ticket.title}</h1>
          <p>Reported by {ticket.customer}</p>
        </div>
        <button className="btn" onClick={() => setEditing(!editing)}>
          <Pencil size={16} />
          {editing ? "Cancel editing" : "Edit ticket"}
        </button>
      </div>
      <div className="detail-grid">
        <section className="panel detail-content">
          {editing ? (
            <>
              <h2>Edit ticket</h2>
              <TicketForm
                key={ticket.id}
                ticket={ticket}
                onDone={() => setEditing(false)}
              />
            </>
          ) : (
            <>
              <h2>Description</h2>
              <p className="description">{ticket.description}</p>
              <div className="detail-properties">
                <div>
                  <small>Status</small>
                  <Badge value={ticket.status} />
                </div>
                <div>
                  <small>Priority</small>
                  <Badge value={ticket.priority} />
                </div>
                <div>
                  <small>Assignee</small>
                  <strong>{ticket.assignee}</strong>
                </div>
                <div className="sla-target">
                  <small>Resolution target</small>
                  <strong>
                    {new Date(ticket.dueAt).toLocaleString("en-GB")}
                  </strong>
                  <small className={breached(ticket) ? "error-text" : ""}>
                    {breached(ticket) ? "SLA breached" : "Within SLA"}
                  </small>
                </div>
              </div>
            </>
          )}
        </section>
        <section className="panel activity">
          <h2>
            <Clock3 size={18} />
            Activity
          </h2>
          <ol>
            {ticket.activity.map((a, i) => (
              <li key={`${a.at}-${i}`}>
                <strong>{a.text}</strong>
                <p>{a.actor}</p>
                <time dateTime={a.at}>
                  {new Date(a.at).toLocaleString("en-GB")}
                </time>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
