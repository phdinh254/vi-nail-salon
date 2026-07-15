import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Container } from "@/components/ui/container";
import { siteConfig, footerLinks } from "@/config/site";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-bg-subtle">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 text-body-sm text-text-muted">{siteConfig.description}</p>
          <ul className="mt-5 flex flex-col gap-2.5 text-body-sm text-text-muted">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              {siteConfig.address}
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <a href={siteConfig.phoneHref} className="hover:text-primary">
                {siteConfig.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <a href={`mailto:${siteConfig.email}`} className="hover:text-primary">
                {siteConfig.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-label text-text">Khám phá</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {footerLinks.explore.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-body-sm text-text-muted hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-label text-text">Hỗ trợ</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {footerLinks.support.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-body-sm text-text-muted hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-label text-text">Giờ mở cửa</p>
          <ul className="mt-4 flex flex-col gap-2.5 text-body-sm text-text-muted">
            {siteConfig.openingHours.map((item) => (
              <li key={item.day} className="flex items-start gap-2.5">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  {item.day}
                  <br />
                  {item.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-border py-5">
        <Container className="flex flex-col items-center justify-between gap-2 text-caption text-text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.brandName}. Đã đăng ký bản quyền.</p>
          <div className="flex gap-4">
            <Link href="/policies" className="hover:text-primary">
              Chính sách
            </Link>
            <Link href="/contact" className="hover:text-primary">
              Liên hệ
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
