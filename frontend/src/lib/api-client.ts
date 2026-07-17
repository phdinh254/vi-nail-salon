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

const CSRF_COOKIE = "vi_nail_csrf_token";
const CSRF_HEADER = "x-csrf-token";
const MUTATING_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

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

function readCsrfCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * The CSRF cookie is set alongside the refresh token (login/register/refresh) and cleared on
 * logout, so its presence — readable since it's non-httpOnly by design — is a reliable signal
 * that a session might still be refreshable. Guests who never logged in have no session to
 * refresh; callers should skip the refresh round trip entirely rather than firing it blind.
 */
export function hasSessionCookie(): boolean {
  return readCsrfCookie() !== null;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /**
   * Explicit Bearer token for the guest OTP booking-session flow, which is intentionally
   * separate from the cookie-based login session (see stores/auth-store.tsx). Leave unset
   * for authenticated user requests — the httpOnly session cookie is sent automatically.
   */
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

async function rawRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.token) headers["Authorization"] = `Bearer ${options.token}`;
  if (MUTATING_METHODS.has(method)) {
    const csrf = readCsrfCookie();
    if (csrf) headers[CSRF_HEADER] = csrf;
  }

  const res = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    credentials: "include",
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

let refreshInFlight: Promise<void> | null = null;

function refreshSession(): Promise<void> {
  refreshInFlight ??= rawRequest<void>("/auth/refresh", { method: "POST" }).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await rawRequest<T>(path, options);
  } catch (err) {
    const isAuthEndpoint = path.startsWith("/auth/");
    if (err instanceof ApiError && err.status === 401 && !isAuthEndpoint && hasSessionCookie()) {
      try {
        await refreshSession();
      } catch {
        throw err;
      }
      return rawRequest<T>(path, options);
    }
    throw err;
  }
}
