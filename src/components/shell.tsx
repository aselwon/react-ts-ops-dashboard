"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Inbox,
  Users,
  Activity,
  PanelLeftClose,
  PanelLeftOpen,
  Moon,
  Sun,
  Menu,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";
import type { User } from "@/lib/domain";
import { api } from "@/lib/api";
import { useUI } from "./providers";
export function Shell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { dark, toggle, notify } = useUI();
  const links = [
    { href: "/tickets", title: "Tickets", icon: Inbox },
    { href: "/kpis", title: "Overview", icon: BarChart3 },
    ...(user.role === "admin"
      ? [{ href: "/users", title: "Team members", icon: Users }]
      : []),
  ];
  const section =
    links.find((l) => path.startsWith(l.href))?.title ?? "Operations";
  return (
    <div className={`app ${expanded ? "rail-expanded" : ""}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {open && (
        <button
          className="scrim"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <Link
          href="/tickets"
          className="brand"
          aria-label="Pagerline OpsBoard"
          title="Pagerline OpsBoard"
        >
          <span className="brand-icon">
            <Activity size={23} />
          </span>
          <span className="rail-label">
            Pagerline<small>OPSBOARD / NOC</small>
          </span>
        </Link>
        <button
          className="mobile close-nav icon-btn"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        >
          <X size={20} />
        </button>
        <button
          className="rail-toggle icon-btn"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
          aria-expanded={expanded}
          title={expanded ? "Collapse navigation" : "Expand navigation"}
        >
          {expanded ? (
            <PanelLeftClose size={18} />
          ) : (
            <PanelLeftOpen size={18} />
          )}
        </button>
        <p className="nav-label rail-label">OPERATIONS</p>
        <nav aria-label="Main navigation">
          {links.map(({ href, title, icon: Icon }) => (
            <Link
              key={href}
              aria-label={title}
              title={title}
              href={href}
              className={`nav-item ${path.startsWith(href) ? "active" : ""}`}
              aria-current={path.startsWith(href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <Icon size={19} />
              <span className="rail-label">{title}</span>
              <span className="rail-tooltip" aria-hidden="true">
                {title}
              </span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="profile">
            <span className="avatar">
              {user.name
                .split(" ")
                .map((s) => s[0])
                .join("")}
            </span>
            <div className="rail-label">
              <strong>{user.name}</strong>
              <small>
                {user.role === "admin" ? "Administrator" : "Support agent"}
              </small>
            </div>
            <button
              className="icon-btn"
              aria-label="Sign out"
              title="Sign out"
              onClick={async () => {
                try {
                  await api("/api/session", { method: "DELETE" });
                  client.clear();
                  router.replace("/login");
                  router.refresh();
                } catch (e) {
                  notify((e as Error).message);
                }
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <button
            className="mobile icon-btn"
            aria-label="Open navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <Menu size={22} />
          </button>
          <div className="breadcrumbs">
            <strong className="utility-brand">Pagerline</strong>
            <span className="environment">
              prod-eu1 <small>DEMO</small>
            </span>
            <ChevronRight size={14} />
            <span>{section}</span>
            {path.split("/").length > 2 && (
              <>
                <ChevronRight size={14} />
                <span>Detail</span>
              </>
            )}
          </div>
          <div className="top-actions">
            <span className="live-label">
              <span className="live-dot" />
              Demo system operational
            </span>
            <button
              className="icon-btn"
              onClick={toggle}
              aria-label={
                dark ? "Switch to light theme" : "Switch to dark theme"
              }
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer>
          <span>Pagerline / OpsBoard</span>
          <span>NETWORK OPERATIONS CONSOLE</span>
          <span>prod-eu1 · Demo environment</span>
        </footer>
      </div>
    </div>
  );
}
