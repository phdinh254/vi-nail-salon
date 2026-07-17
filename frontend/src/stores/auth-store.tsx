"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, hasSessionCookie } from "@/lib/api-client";

export type AuthUser = {
  id: string;
  phone: string;
  name: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
};

// The login/session token lives only in an httpOnly cookie set by the backend — never
// readable by JS, so nothing to store here. The booking session token below is a
// deliberately different, lower-sensitivity token: short-lived (30 min), single-purpose
// (proves an OTP was verified for a phone number during guest checkout), not tied to any
// user account, and not a target worth protecting behind httpOnly cookies.
const BOOKING_TOKEN_KEY = "vi-nail-booking-token";

type AuthContextValue = {
  user: AuthUser | null;
  bookingToken: string | null;
  isHydrated: boolean;
  setSession: (user: AuthUser) => void;
  clearSession: () => Promise<void>;
  setBookingToken: (token: string) => void;
  clearBookingToken: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bookingToken, setBookingTokenState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    function restoreBookingToken() {
      const storedBookingToken = window.localStorage.getItem(BOOKING_TOKEN_KEY);
      if (storedBookingToken) setBookingTokenState(storedBookingToken);
    }
    restoreBookingToken();

    async function hydrate() {
      try {
        const me = await apiRequest<AuthUser>("/auth/me", { token: null });
        setUser(me);
      } catch {
        // No valid access token cookie. If a session ever existed (readable CSRF cookie,
        // set/cleared alongside the refresh token) try one silent refresh before giving up,
        // so a page reload after the 15-minute access token expires doesn't force a
        // re-login. Guests who never logged in have nothing to refresh — skip the round trip
        // entirely, since every guest page view otherwise fires a POST /auth/refresh.
        if (hasSessionCookie()) {
          try {
            await apiRequest("/auth/refresh", { method: "POST", token: null });
            const me = await apiRequest<AuthUser>("/auth/me", { token: null });
            setUser(me);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } finally {
        setIsHydrated(true);
      }
    }
    void hydrate();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      bookingToken,
      isHydrated,
      setSession: (nextUser) => setUser(nextUser),
      clearSession: async () => {
        try {
          await apiRequest("/auth/logout", { method: "POST", token: null });
        } finally {
          setUser(null);
        }
      },
      setBookingToken: (nextToken) => {
        window.localStorage.setItem(BOOKING_TOKEN_KEY, nextToken);
        setBookingTokenState(nextToken);
      },
      clearBookingToken: () => {
        window.localStorage.removeItem(BOOKING_TOKEN_KEY);
        setBookingTokenState(null);
      },
    }),
    [user, bookingToken, isHydrated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong AuthProvider.");
  return ctx;
}

const ROLE_HOME: Record<AuthUser["role"], string> = {
  ADMIN: "/admin/dashboard",
  STAFF: "/staff/dashboard",
  CUSTOMER: "/customer/dashboard",
};

/**
 * Bảo vệ toàn bộ layout theo role: chờ hydrate xong, điều hướng về /login
 * nếu chưa đăng nhập, hoặc về đúng trang chủ theo role nếu sai quyền.
 */
export function useRequireRole(role: AuthUser["role"]) {
  const { user, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== role) {
      router.replace(ROLE_HOME[user.role]);
    }
  }, [isHydrated, user, role, router]);

  return { user, isReady: isHydrated && user?.role === role };
}
