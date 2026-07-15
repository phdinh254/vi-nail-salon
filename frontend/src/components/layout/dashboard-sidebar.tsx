"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import type { NavItem } from "@/components/layout/dashboard-nav-config";
import { cn } from "@/utils/cn";

export function DashboardSidebar({ items, roleLabel }: { items: NavItem[]; roleLabel: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Logo />
      </div>
      <p className="px-5 pt-4 text-caption uppercase tracking-wide text-text-muted">{roleLabel}</p>
      <nav aria-label="Điều hướng khu vực" className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-body-sm font-medium transition-colors duration-fast",
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
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-body-sm font-medium text-text-muted hover:bg-bg-subtle hover:text-error"
        >
          <LogOut className="size-4.5" aria-hidden="true" />
          Đăng xuất
        </Link>
      </div>
    </aside>
  );
}
