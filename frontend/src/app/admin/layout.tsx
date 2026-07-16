"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNavItems } from "@/components/layout/dashboard-nav-config";
import { useRequireRole } from "@/stores/auth-store";
import { toDemoSession } from "@/utils/session";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isReady } = useRequireRole("ADMIN");
  if (!isReady || !user) return null;

  return (
    <DashboardShell
      session={toDemoSession(user, "Quản trị viên")}
      roleLabel="Quản trị viên"
      sidebarItems={adminNavItems}
    >
      {children}
    </DashboardShell>
  );
}
