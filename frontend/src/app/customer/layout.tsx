"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { customerNavItems, customerMobileNavItems } from "@/components/layout/dashboard-nav-config";
import { useRequireRole } from "@/stores/auth-store";
import { toDemoSession } from "@/utils/session";
import { useApi } from "@/hooks/use-api";
import { listCustomerNotifications } from "@/services/notification.service";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, isReady } = useRequireRole("CUSTOMER");
  const { data: notifications } = useApi(listCustomerNotifications, [], { enabled: isReady });
  const unread = notifications?.filter((n) => !n.isRead).length ?? 0;

  if (!isReady || !user) return null;

  return (
    <DashboardShell
      session={toDemoSession(user, "Khách hàng")}
      roleLabel="Khách hàng"
      sidebarItems={customerNavItems}
      mobileNavItems={customerMobileNavItems}
      notificationCount={unread}
      notificationsHref="/customer/notifications"
    >
      {children}
    </DashboardShell>
  );
}
