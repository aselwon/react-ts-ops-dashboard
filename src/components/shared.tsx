import { AlertCircle, Inbox } from "lucide-react";
export function Badge({ value }: { value: string }) {
  return (
    <span className={`badge ${value.toLowerCase().replaceAll(" ", "-")}`}>
      <span />
      {value}
    </span>
  );
}
export function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading workspace"
      className="panel skeleton-wrap"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="skeleton" />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div className="panel state" role="alert">
      <AlertCircle />
      <h2>We couldn’t load this view</h2>
      <p>{message}</p>
      <button className="btn" onClick={retry}>
        Try again
      </button>
    </div>
  );
}
export function Empty({
  title = "No tickets match your filters",
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="state">
      <Inbox size={30} />
      <h2>{title}</h2>
      <p>{children ?? "Try a different search or clear your filters."}</p>
    </div>
  );
}
