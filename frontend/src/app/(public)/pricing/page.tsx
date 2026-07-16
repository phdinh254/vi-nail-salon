import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { listServices } from "@/services/catalog.service";
import { SERVICE_CATEGORIES, serviceCategoryLabel } from "@/types/service";
import { formatDurationMinutes, formatPriceRange } from "@/utils/format";

export const metadata: Metadata = { title: "Bảng giá" };
export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const services = await listServices();

  return (
    <Container className="py-10 sm:py-14">
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Bảng giá" }]} />
      <PageHeader
        className="mt-4"
        title="Bảng giá dịch vụ"
        description="Giá có thể thay đổi theo độ dài, kiểu dáng móng thực tế. Giá “từ” là giá khởi điểm."
      />

      <div className="mt-8 flex flex-col gap-8">
        {SERVICE_CATEGORIES.map((category) => {
          const items = services.filter((s) => s.category === category);
          if (items.length === 0) return null;
          return (
            <section key={category} className="rounded-lg border border-border bg-surface">
              <h2 className="border-b border-border px-5 py-4 text-h3 font-serif font-semibold text-text">
                {serviceCategoryLabel[category]}
              </h2>
              <ul className="divide-y divide-border">
                {items.map((service) => (
                  <li key={service.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <p className="text-body font-medium text-text">{service.name}</p>
                      <p className="mt-0.5 text-caption text-text-muted">
                        {formatDurationMinutes(service.durationMinutes)}
                        {!service.isFixedPrice ? (
                          <Badge tone="neutral" className="ml-2">
                            Giá tham khảo
                          </Badge>
                        ) : null}
                      </p>
                    </div>
                    <p className="shrink-0 text-body font-semibold text-primary">
                      {!service.isFixedPrice ? "Từ " : ""}
                      {formatPriceRange(service.priceFrom, service.priceTo ?? undefined)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </Container>
  );
}
