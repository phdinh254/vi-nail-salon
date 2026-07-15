"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { customerNavItems, customerMobileNavItems } from "@/components/layout/dashboard-nav-config";
import { demoCustomerSession } from "@/fixtures/session";
import { customerNotifications } from "@/fixtures/notifications";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const unread = customerNotifications.filter((n) => !n.isRead).length;
  return (
    <DashboardShell
      session={demoCustomerSession}
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
