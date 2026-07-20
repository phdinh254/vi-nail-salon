import type { AuthUser } from "@/stores/auth-store";
import type { DisplaySession } from "@/types/session";

export function toDemoSession(user: AuthUser, title?: string): DisplaySession {
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return {
    name: user.name,
    initials: initials || "?",
    phone: user.phone,
    role: user.role,
    title,
  };
}
