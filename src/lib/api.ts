export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined")
      window.location.assign("/login");
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Something went wrong. Please try again.");
  }
  return res.status === 204 ? (undefined as T) : res.json();
}
