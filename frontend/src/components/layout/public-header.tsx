"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/config/site";
import { cn } from "@/utils/cn";

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Điều hướng chính" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3.5 py-2 text-body-sm font-medium transition-colors duration-fast",
                      active ? "text-primary" : "text-text hover:text-primary",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Đăng nhập</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/booking">Đặt lịch</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Đóng menu" : "Mở menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded-md text-text lg:hidden"
        >
          {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
        </button>
      </div>

      {open ? (
        <div className="animate-fade-in border-t border-border bg-surface lg:hidden">
          <nav aria-label="Điều hướng di động" className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-body font-medium text-text hover:bg-bg-subtle"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
              <Button asChild variant="secondary">
                <Link href="/login" onClick={() => setOpen(false)}>
                  Đăng nhập
                </Link>
              </Button>
              <Button asChild>
                <Link href="/booking" onClick={() => setOpen(false)}>
                  Đặt lịch ngay
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
