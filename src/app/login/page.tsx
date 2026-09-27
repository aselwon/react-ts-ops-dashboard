"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowRight, Check } from "lucide-react";
import { api } from "@/lib/api";
export default function Login() {
  const [email, setEmail] = useState("admin@demo.com");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <main className="login">
      <section className="login-story">
        <div className="brand">
          <span className="brand-icon">
            <Activity />
          </span>
          Pagerline
        </div>
        <span className="eyebrow">OPSBOARD / NETWORK OPERATIONS</span>
        <h1>
          Signal detected.
          <br />
          Take control.
        </h1>
        <p>
          Track incidents, prioritize response and keep resolution deadlines in
          sight.
        </p>
        <div className="login-benefits">
          {[
            "One queue. Everything in context.",
            "Keep your team moving together.",
            "Turn daily activity into insight.",
          ].map((s) => (
            <p key={s}>
              <Check size={18} />
              {s}
            </p>
          ))}
        </div>
        <small>PAGERLINE / PROD-EU1 / DEMO CONSOLE</small>
      </section>
      <section className="login-form">
        <div>
          <span className="eyebrow">OPERATOR ACCESS</span>
          <h2>Open your console.</h2>
          <p>Choose a demo account to explore Pagerline</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setPending(true);
              setError("");
              try {
                await api("/api/session", {
                  method: "POST",
                  body: JSON.stringify({ email }),
                });
                router.replace("/tickets");
                router.refresh();
              } catch (err) {
                setError((err as Error).message);
                setPending(false);
              }
            }}
          >
            <label htmlFor="email">Demo account</label>
            <select
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            >
              <option value="admin@demo.com">
                admin@demo.com — Administrator
              </option>
              <option value="agent@demo.com">
                agent@demo.com — Support agent
              </option>
            </select>
            <p className="field-help">
              No password needed. All data is a local demo.
            </p>
            {error && (
              <p role="alert" className="error-text">
                {error}
              </p>
            )}
            <button className="btn primary" disabled={pending}>
              {pending ? "Signing in…" : "Enter workspace"}
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="login-footnote">
            48 sample tickets · No external services required
          </div>
        </div>
      </section>
    </main>
  );
}
