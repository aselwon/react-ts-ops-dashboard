"use client";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { api } from "@/lib/api";
import type { Metrics } from "@/lib/domain";
import { Empty, ErrorState, Loading } from "./shared";
const colors = ["#38bdf8", "#f59e0b", "#94a3b8", "#34d399"];
export function Kpis() {
  const query = useQuery({
    queryKey: ["kpis"],
    queryFn: () => api<Metrics>("/api/kpis"),
  });
  const data = query.data;
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
          <span className="eyebrow">PAGERLINE / TELEMETRY</span>
          <h1>Overview</h1>
          <p>Queue health, resolution activity and SLA exposure.</p>
        </div>
        <span className="period">Last 7 days · UTC</span>
      </div>
      {query.isLoading ? (
        <Loading />
      ) : query.error ? (
        <ErrorState
          message={query.error.message}
          retry={() => query.refetch()}
        />
      ) : !data?.total ? (
        <div className="panel">
          <Empty title="Your insights start with a ticket">
            Create your first ticket to see workspace performance.
          </Empty>
        </div>
      ) : (
        <>
          <div className="stats">
            <div className="stat">
              <div className="stat-label">Total tickets</div>
              <strong>{data.total}</strong>
              <small>All time</small>
            </div>
            <div className="stat">
              <div className="stat-label">Active workload</div>
              <strong>{data.open}</strong>
              <small>Open, in progress & pending</small>
            </div>
            <div className="stat">
              <div className="stat-label">Resolved</div>
              <strong>{data.closed}</strong>
              <small>
                {Math.round((data.closed / data.total) * 100)}% of all tickets
              </small>
            </div>
            <div className="stat">
              <div className="stat-label">SLA breach rate</div>
              <strong>{data.sla}%</strong>
              <small>{data.breaches} tickets exceeded 48 hours</small>
              <progress
                className="sla-meter"
                aria-label="SLA breach rate"
                value={data.sla}
                max={100}
              />
            </div>
          </div>
          <div className="chart-grid">
            <section className="panel chart-panel">
              <h2>Ticket activity</h2>
              <p>Created vs. closed over the last 7 days</p>
              <div
                className="chart"
                role="img"
                aria-label="Created and closed tickets per day; exact values in the data table below"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.trend}
                    margin={{ top: 20, right: 15, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="fillCreated"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#38bdf8"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="100%"
                          stopColor="#38bdf8"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => String(v).slice(5)}
                      tick={{ fill: "var(--muted)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "var(--muted)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                        borderRadius: 10,
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="created"
                      name="Created"
                      stroke="#38bdf8"
                      strokeWidth={3}
                      fill="url(#fillCreated)"
                    />
                    <Area
                      type="monotone"
                      dataKey="closed"
                      name="Closed"
                      stroke="#34d399"
                      strokeWidth={2}
                      fill="transparent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
            <section className="panel chart-panel">
              <h2>Tickets by status</h2>
              <p>Current distribution across the queue</p>
              <div
                className="chart donut"
                role="img"
                aria-label={data.statuses
                  .map((s) => `${s.name}: ${s.value}`)
                  .join(", ")}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.statuses}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={5}
                      stroke="none"
                    >
                      {data.statuses.map((s, i) => (
                        <Cell key={s.name} fill={colors[i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend">
                {data.statuses.map((s, i) => (
                  <div key={s.name}>
                    <span style={{ background: colors[i] }} />
                    {s.name}
                    <strong>{s.value}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <details className="panel data-details">
            <summary>View chart data and metric definitions</summary>
            <p>
              SLA breach: resolved after the 48-hour deadline, or currently
              unresolved past it. The denominator is all tickets. Status counts
              include all tickets; activity uses UTC calendar dates.
            </p>
            <table>
              <caption className="sr-only">Daily ticket activity</caption>
              <thead>
                <tr>
                  <th>Date (UTC)</th>
                  <th>Created</th>
                  <th>Closed</th>
                </tr>
              </thead>
              <tbody>
                {data.trend.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    <td>{row.created}</td>
                    <td>{row.closed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      )}
    </>
  );
}
