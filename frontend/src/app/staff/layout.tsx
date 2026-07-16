"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { staffNavItems, staffMobileNavItems } from "@/components/layout/dashboard-nav-config";
import { useRequireRole } from "@/stores/auth-store";
import { toDemoSession } from "@/utils/session";
import { useApi } from "@/hooks/use-api";
import { listStaffNotifications } from "@/services/notification.service";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { user, isReady } = useRequireRole("STAFF");
  const { data: notifications } = useApi(listStaffNotifications, [], { enabled: isReady });
  const unread = notifications?.filter((n) => !n.isRead).length ?? 0;

  if (!isReady || !user) return null;

  return (
    <DashboardShell
      session={toDemoSession(user, "Nhân viên")}
      roleLabel="Nhân viên"
      sidebarItems={staffNavItems}
      mobileNavItems={staffMobileNavItems}
      notificationCount={unread}
    >
      {children}
    </DashboardShell>
  );
}
