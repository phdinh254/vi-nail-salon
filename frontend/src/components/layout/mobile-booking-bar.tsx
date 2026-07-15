"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarPlus, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";

export function MobileBookingBar() {
  const pathname = usePathname();
  const hideOnBar = pathname.startsWith("/booking") || pathname.startsWith("/guest-booking");
  if (hideOnBar) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2.5 border-t border-border bg-surface/95 p-3 backdrop-blur lg:hidden">
      <a
        href={siteConfig.phoneHref}
        aria-label={`Gọi cho tiệm: ${siteConfig.phone}`}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border text-text"
      >
        <Phone className="size-5" aria-hidden="true" />
      </a>
      <Link
        href="/booking"
        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary text-body-sm font-semibold text-primary-foreground"
      >
        <CalendarPlus className="size-4.5" aria-hidden="true" />
        Đặt lịch ngay
      </Link>
    </div>
  );
}
