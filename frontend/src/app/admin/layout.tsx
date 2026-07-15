"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNavItems } from "@/components/layout/dashboard-nav-config";
import { demoAdminSession } from "@/fixtures/session";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell session={demoAdminSession} roleLabel="Quản trị viên" sidebarItems={adminNavItems}>
      {children}
    </DashboardShell>
  );
}
