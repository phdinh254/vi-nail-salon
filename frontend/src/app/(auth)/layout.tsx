import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-subtle">
      <header className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Logo />
        <Link href="/" className="inline-flex items-center gap-1.5 text-body-sm text-text-muted hover:text-primary">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Về trang chủ
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
