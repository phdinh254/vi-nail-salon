import type { AuthUser } from "@/stores/auth-store";
import type { DemoSession } from "@/fixtures/session";

export function toDemoSession(user: AuthUser, title?: string): DemoSession {
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
