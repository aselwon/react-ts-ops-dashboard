"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
const UI = createContext<{
  dark: boolean;
  toggle: () => void;
  notify: (message: string) => void;
}>({
  dark: true,
  toggle: () => {},
  notify: () => {},
});
export const useUI = () => useContext(UI);
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, staleTime: 15000 } },
      }),
  );
  const [dark, setDark] = useState(true);
  const [message, setMessage] = useState("");
  useEffect(() => {
    setDark(localStorage.getItem("ops-theme") !== "light");
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 4500);
    return () => clearTimeout(timer);
  }, [message]);
  return (
    <QueryClientProvider client={client}>
      <UI.Provider
        value={{
          dark,
          toggle: () =>
            setDark((v) => {
              localStorage.setItem("ops-theme", !v ? "dark" : "light");
              return !v;
            }),
          notify: setMessage,
        }}
      >
        {children}
        <div role="status" className={message ? "toast" : "sr-only"}>
          {message}
        </div>
      </UI.Provider>
    </QueryClientProvider>
  );
}
