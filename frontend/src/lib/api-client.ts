// Server-side rendering runs inside the frontend container/process, where a relative path
// ("/api", used in production behind nginx) is not a valid fetch URL, and "localhost" would
// point at the frontend itself rather than the backend. API_INTERNAL_URL (server-only, not
// inlined into the client bundle) gives SSR an address that actually reaches the backend —
// e.g. the Docker-internal "http://backend:3001/api". The browser always uses
// NEXT_PUBLIC_API_URL, which is baked in at build time and correctly resolves relative paths
// against the page's own origin.
const API_URL =
  typeof window === "undefined"
    ? (process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api");

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("vi-nail-auth-token");
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
  query?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(`${API_URL}${path}`, API_URL.startsWith("/") ? "http://placeholder" : undefined);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return API_URL.startsWith("/") ? `${url.pathname}${url.search}` : url.toString();
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = options.token !== undefined ? options.token : readToken();
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(buildUrl(path, options.query), {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message =
      (payload && typeof payload === "object" && "message" in payload
        ? Array.isArray(payload.message)
          ? payload.message.join(", ")
          : String(payload.message)
        : null) ?? `Yêu cầu thất bại (${res.status}).`;
    throw new ApiError(res.status, message, payload);
  }

  return payload as T;
}
