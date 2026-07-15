import Link from "next/link";
import { Sparkle } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Sparkle className="size-4.5" aria-hidden="true" />
      </span>
      <span className="font-serif text-lg font-semibold text-text">{siteConfig.brandShortName}</span>
    </Link>
  );
}
