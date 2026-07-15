import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { ContactForm } from "@/features/contact/contact-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Liên hệ" };

export default function ContactPage() {
  return (
    <Container className="py-10 sm:py-14">
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Liên hệ" }]} />
      <PageHeader className="mt-4" title="Liên hệ với chúng tôi" description="Gửi câu hỏi hoặc gọi trực tiếp, tiệm sẽ phản hồi sớm nhất có thể." />

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div>
          <ul className="flex flex-col gap-4 text-body text-text-muted">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              {siteConfig.address}
            </li>
            <li className="flex items-center gap-3">
              <Phone className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <a href={siteConfig.phoneHref} className="hover:text-primary">
                {siteConfig.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <a href={`mailto:${siteConfig.email}`} className="hover:text-primary">
                {siteConfig.email}
              </a>
            </li>
            {siteConfig.openingHours.map((item) => (
              <li key={item.day} className="flex items-start gap-3">
                <Clock className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                {item.day}: {item.time}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <PlaceholderImage label="Bản đồ vị trí tiệm" ratio="aspect-[4/3]" />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 shadow-soft-sm">
          <ContactForm />
        </div>
      </div>
    </Container>
  );
}
