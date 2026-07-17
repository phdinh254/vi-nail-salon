"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Bell, LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { Drawer } from "@/components/ui/drawer";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/layout/logo";
import type { NavItem } from "@/components/layout/dashboard-nav-config";
import type { DemoSession } from "@/fixtures/session";
import { useAuth } from "@/stores/auth-store";
import { cn } from "@/utils/cn";

export function DashboardTopbar({
  session,
  items,
  notificationCount = 0,
  notificationsHref,
}: {
  session: DemoSession;
  items: NavItem[];
  notificationCount?: number;
  notificationsHref?: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { clearSession } = useAuth();

  async function handleLogout() {
    await clearSession();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        aria-label="Mở menu điều hướng"
        onClick={() => setDrawerOpen(true)}
        className="inline-flex size-10 items-center justify-center rounded-md text-text lg:hidden"
      >
        <Menu className="size-6" aria-hidden="true" />
      </button>

      <p className="hidden text-body-sm text-text-muted lg:block">
        Xin chào, <span className="font-semibold text-text">{session.name}</span>
      </p>

      <div className="flex items-center gap-2">
        {notificationsHref ? (
          <IconButton label="Thông báo" asChild className="relative">
            <Link href={notificationsHref}>
              <Bell className="size-5" aria-hidden="true" />
              {notificationCount > 0 ? (
                <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-error" aria-hidden="true" />
              ) : null}
            </Link>
          </IconButton>
        ) : null}
        <DropdownMenu
          align="end"
          trigger={
            <span className="flex items-center gap-2 rounded-full p-0.5 hover:bg-bg-subtle">
              <Avatar initials={session.initials} size="sm" />
            </span>
          }
          items={[
            { label: "Hồ sơ của tôi", onSelect: () => {}, icon: <Avatar initials={session.initials} size="sm" /> },
            { label: "Đăng xuất", onSelect: handleLogout, icon: <LogOut />, destructive: true },
          ]}
        />
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Menu" side="left">
        <div className="flex h-full flex-col">
          <div className="border-b border-border p-4">
            <Logo />
          </div>
          <nav aria-label="Điều hướng khu vực" className="flex-1 overflow-y-auto p-3">
            <ul className="flex flex-col gap-1">
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-3 text-body-sm font-medium",
                        active ? "bg-accent/30 text-primary-active" : "text-text hover:bg-bg-subtle",
                      )}
                    >
                      <Icon className="size-4.5 shrink-0" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t border-border p-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-body-sm font-medium text-text-muted hover:bg-bg-subtle hover:text-error"
            >
              <LogOut className="size-4.5" aria-hidden="true" />
              Đăng xuất
            </button>
          </div>
        </div>
      </Drawer>
    </header>
  );
}
