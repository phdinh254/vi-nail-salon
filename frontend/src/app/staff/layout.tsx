"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { staffNavItems, staffMobileNavItems } from "@/components/layout/dashboard-nav-config";
import { demoStaffSession } from "@/fixtures/session";
import { staffNotifications } from "@/fixtures/notifications";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const unread = staffNotifications.filter((n) => !n.isRead).length;
  return (
    <DashboardShell
      session={demoStaffSession}
      roleLabel="Nhân viên"
      sidebarItems={staffNavItems}
      mobileNavItems={staffMobileNavItems}
      notificationCount={unread}
    >
      {children}
    </DashboardShell>
  );
}
