import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { MobileBottomNavigation } from "@/components/layout/mobile-bottom-navigation";
import type { NavItem } from "@/components/layout/dashboard-nav-config";
import type { DisplaySession } from "@/types/session";

export function DashboardShell({
  session,
  roleLabel,
  sidebarItems,
  mobileNavItems,
  notificationCount,
  notificationsHref,
  children,
}: {
  session: DisplaySession;
  roleLabel: string;
  sidebarItems: NavItem[];
  mobileNavItems?: NavItem[];
  notificationCount?: number;
  notificationsHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg-subtle/40">
      <DashboardSidebar items={sidebarItems} roleLabel={roleLabel} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          session={session}
          items={sidebarItems}
          notificationCount={notificationCount}
          notificationsHref={notificationsHref}
        />
        <main className={`flex-1 px-4 py-6 sm:px-6 lg:px-8 ${mobileNavItems ? "pb-24 lg:pb-6" : ""}`}>
          {children}
        </main>
      </div>
      {mobileNavItems ? <MobileBottomNavigation items={mobileNavItems} /> : null}
    </div>
  );
}
