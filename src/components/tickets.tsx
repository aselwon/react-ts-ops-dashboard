"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDownUp,
  Plus,
  Search,
  SlidersHorizontal,
  X,
  Inbox,
  Clock3,
  CircleCheck,
  TriangleAlert,
  ArrowUpRight,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  breached,
  priorities,
  statuses,
  summarize,
  type Ticket,
} from "@/lib/domain";
import { Badge, Empty, ErrorState, Loading } from "./shared";
import { TicketForm } from "./ticket-form";
export function Tickets() {
  const query = useQuery({
    queryKey: ["tickets"],
    queryFn: () => api<Ticket[]>("/api/tickets"),
  });
  const params = useSearchParams();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const createButton = useRef<HTMLButtonElement>(null);
  const [creating, setCreating] = useState(false);
  const q = params.get("q") ?? "";
  const status = params.get("status") ?? "";
  const priority = params.get("priority") ?? "";
  const sortId = [
    "id",
    "title",
    "status",
    "priority",
    "assignee",
    "createdAt",
  ].includes(params.get("sort") ?? "")
    ? params.get("sort")!
    : "createdAt";
  const page = Math.max(0, Number(params.get("page")) || 0);
  const hidden = (params.get("hidden") ?? "").split(",");
  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    window.history.replaceState(null, "", `/tickets?${next}`);
  }
  useEffect(() => {
    if (creating) {
      dialog.current?.showModal();
      dialog.current?.querySelector("input")?.focus();
    } else dialog.current?.close();
  }, [creating]);
  const filtered = useMemo(
    () =>
      (query.data ?? []).filter(
        (t) =>
          (!status || t.status === status) &&
          (!priority || t.priority === priority) &&
          `${t.id} ${t.title} ${t.customer}`
            .toLowerCase()
            .includes(q.toLowerCase()),
      ),
    [query.data, status, priority, q],
  );
  const columns = useMemo<ColumnDef<Ticket>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Ticket",
        cell: (c) => (
          <Link className="ticket-id" href={`/tickets/${c.row.original.id}`}>
            {c.getValue<string>()}
          </Link>
        ),
      },
      {
        accessorKey: "title",
        header: "Subject",
        cell: (c) => (
          <Link className="subject" href={`/tickets/${c.row.original.id}`}>
            <strong>{c.getValue<string>()}</strong>
            <small>{c.row.original.customer}</small>
          </Link>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (c) => <Badge value={c.getValue<string>()} />,
      },
      {
        accessorKey: "priority",
        header: "Priority",
        sortingFn: (a, b) =>
          priorities.indexOf(a.original.priority) -
          priorities.indexOf(b.original.priority),
        cell: (c) => <Badge value={c.getValue<string>()} />,
      },
      {
        accessorKey: "assignee",
        header: "Assignee",
        cell: (c) => (
          <span className="assignee">
            <span className="mini-avatar">
              {c.getValue<string>() === "Unassigned"
                ? "—"
                : c
                    .getValue<string>()
                    .split(" ")
                    .map((s) => s[0])
                    .join("")}
            </span>
            {c.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: (c) => (
          <span className="muted">
            {new Date(c.getValue<string>()).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            })}
            {breached(c.row.original) && c.row.original.status !== "Closed" && (
              <small className="sla-warning">SLA overdue</small>
            )}
          </span>
        ),
      },
    ],
    [],
  );
  const table = useReactTable({
    data: filtered,
    autoResetPageIndex: false,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting: [{ id: sortId, desc: params.get("dir") !== "asc" }],
      pagination: {
        pageIndex: Math.min(
          page,
          Math.max(0, Math.ceil(filtered.length / 10) - 1),
        ),
        pageSize: 10,
      },
      columnVisibility: {
        priority: !hidden.includes("priority"),
        assignee: !hidden.includes("assignee"),
        createdAt: !hidden.includes("createdAt"),
      },
    },
    onSortingChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(table.getState().sorting)
          : updater;
      update({
        sort: next[0]?.id ?? "createdAt",
        dir: next[0]?.desc ? "desc" : "asc",
        page: "",
      });
    },
  });
  const metrics = summarize(query.data ?? []);
  return (
    <>
      <div className="refresh-readout">
        LAST SYNC{" "}
        <time>
          {query.dataUpdatedAt
            ? new Date(query.dataUpdatedAt).toLocaleTimeString("en-GB", {
                timeZone: "UTC",
              }) + " UTC"
            : "Awaiting data"}
        </time>
      </div>
      <div className="page-heading">
        <div>
          <span className="eyebrow">PAGERLINE / INCIDENT QUEUE</span>
          <h1>Tickets.</h1>
          <p>Incident triage, ownership and resolution deadlines.</p>
        </div>
        <button
          ref={createButton}
          className="btn primary"
          onClick={() => setCreating(true)}
        >
          <Plus size={17} />
          New ticket
        </button>
      </div>
      <div className="stats">
        {[
          {
            label: "Total tickets",
            value: metrics.total,
            icon: Inbox,
            note: "Total recorded incidents",
          },
          {
            label: "Active tickets",
            value: metrics.open,
            icon: Clock3,
            note: "Open · in progress · pending",
          },
          {
            label: "Resolved tickets",
            value: metrics.closed,
            icon: CircleCheck,
            note: "Resolution complete",
          },
          {
            label: "SLA breach rate",
            value: `${metrics.sla}%`,
            icon: TriangleAlert,
            note: "48-hour resolution target",
          },
        ].map(({ label, value, icon: Icon, note }) => (
          <div className="stat" key={label}>
            <div className="stat-label">
              {label}
              <Icon size={17} />
            </div>
            <strong>{query.isLoading ? "—" : value}</strong>
            <small>{note}</small>
            {label === "SLA breach rate" && (
              <progress
                className="sla-meter"
                aria-label="SLA breach rate"
                value={metrics.sla}
                max={100}
              />
            )}
          </div>
        ))}
      </div>
      <section className="panel ticket-panel">
        <div className="panel-heading">
          <div>
            <h2>
              Ticket inbox <span className="count">{filtered.length}</span>
            </h2>
            <p>Live queue / severity and SLA tracking</p>
          </div>
          <Link className="text-link" href="/kpis">
            View insights
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="toolbar">
          <div className="search-field">
            <Search size={17} />
            <input
              aria-label="Search tickets"
              placeholder="Search tickets, customers, or ID…"
              value={q}
              onChange={(e) => update({ q: e.target.value, page: "" })}
            />
          </div>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => update({ status: e.target.value, page: "" })}
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            aria-label="Filter by priority"
            value={priority}
            onChange={(e) => update({ priority: e.target.value, page: "" })}
          >
            <option value="">All priorities</option>
            {priorities.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <details className="columns-menu">
            <summary className="btn">
              <SlidersHorizontal size={16} />
              Columns
            </summary>
            <div className="popover">
              {["priority", "assignee", "createdAt"].map((id) => (
                <label key={id}>
                  <input
                    type="checkbox"
                    checked={!hidden.includes(id)}
                    onChange={(e) =>
                      update({
                        hidden: (e.target.checked
                          ? hidden.filter((h) => h !== id)
                          : [...hidden, id]
                        )
                          .filter(Boolean)
                          .join(","),
                      })
                    }
                  />
                  {id === "createdAt"
                    ? "Created"
                    : id[0].toUpperCase() + id.slice(1)}
                </label>
              ))}
            </div>
          </details>
          {(q || status || priority) && (
            <button
              className="text-link"
              onClick={() =>
                update({ q: "", status: "", priority: "", page: "" })
              }
            >
              Clear filters
            </button>
          )}
        </div>
        {query.isLoading ? (
          <Loading />
        ) : query.error ? (
          <ErrorState
            message={query.error.message}
            retry={() => query.refetch()}
          />
        ) : filtered.length === 0 ? (
          <Empty />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                {table.getHeaderGroups().map((group) => (
                  <tr key={group.id}>
                    {group.headers.map((header) => (
                      <th
                        key={header.id}
                        aria-sort={
                          header.column.getIsSorted() === "asc"
                            ? "ascending"
                            : header.column.getIsSorted() === "desc"
                              ? "descending"
                              : "none"
                        }
                      >
                        <button
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <ArrowDownUp size={12} />
                        </button>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="pagination">
          <span>
            {filtered.length
              ? `${table.getState().pagination.pageIndex * 10 + 1}–${Math.min((table.getState().pagination.pageIndex + 1) * 10, filtered.length)}`
              : "0"}{" "}
            of {filtered.length} tickets
          </span>
          <div>
            <button
              className="btn"
              disabled={!table.getCanPreviousPage()}
              onClick={() =>
                update({
                  page: String(table.getState().pagination.pageIndex - 1),
                })
              }
            >
              Previous
            </button>
            <span>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {Math.max(1, table.getPageCount())}
            </span>
            <button
              className="btn"
              disabled={!table.getCanNextPage()}
              onClick={() =>
                update({
                  page: String(table.getState().pagination.pageIndex + 1),
                })
              }
            >
              Next
            </button>
          </div>
        </div>
      </section>
      <dialog
        aria-labelledby="create-ticket-title"
        ref={dialog}
        onCancel={() => setCreating(false)}
        onClose={() => {
          setCreating(false);
          createButton.current?.focus();
        }}
      >
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">ADD TO YOUR QUEUE</span>
            <h2 id="create-ticket-title">Create a ticket</h2>
          </div>
          <button
            className="icon-btn"
            aria-label="Close create ticket"
            onClick={() => setCreating(false)}
          >
            <X />
          </button>
        </div>
        {creating && (
          <TicketForm
            onDone={(ticket) => {
              setCreating(false);
              router.push(`/tickets/${ticket.id}`);
            }}
          />
        )}
      </dialog>
    </>
  );
}
