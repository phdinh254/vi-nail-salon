"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type AuthUser = {
  id: string;
  phone: string;
  name: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
};

const TOKEN_KEY = "vi-nail-auth-token";
const USER_KEY = "vi-nail-auth-user";
const BOOKING_TOKEN_KEY = "vi-nail-booking-token";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  bookingToken: string | null;
  isHydrated: boolean;
  setSession: (token: string, user: AuthUser) => void;
  clearSession: () => void;
  setBookingToken: (token: string) => void;
  clearBookingToken: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [bookingToken, setBookingTokenState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    function hydrate() {
      const storedToken = window.localStorage.getItem(TOKEN_KEY);
      const storedUser = window.localStorage.getItem(USER_KEY);
      const storedBookingToken = window.localStorage.getItem(BOOKING_TOKEN_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as AuthUser);
      }
      if (storedBookingToken) setBookingTokenState(storedBookingToken);
      setIsHydrated(true);
    }
    hydrate();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      bookingToken,
      isHydrated,
      setSession: (nextToken, nextUser) => {
        window.localStorage.setItem(TOKEN_KEY, nextToken);
        window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        setToken(nextToken);
        setUser(nextUser);
      },
      clearSession: () => {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
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
    [user, token, bookingToken, isHydrated],
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
