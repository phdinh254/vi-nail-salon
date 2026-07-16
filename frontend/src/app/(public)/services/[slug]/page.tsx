import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { StaffCard } from "@/components/domain/staff-card";
import { getService, listStaffForService } from "@/services/catalog.service";
import { serviceCategoryLabel } from "@/types/service";
import { formatDurationMinutes, formatPriceRange } from "@/utils/format";

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const staff = await listStaffForService(service.id);

  return (
    <Container className="py-10 sm:py-14">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Dịch vụ", href: "/services" },
          { label: service.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <PlaceholderImage label={`Ảnh minh họa dịch vụ: ${service.name}`} ratio="aspect-[4/3]" />
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="primary">{serviceCategoryLabel[service.category]}</Badge>
            {service.isFeatured ? <Badge tone="warning">Nổi bật</Badge> : null}
          </div>
          <h1 className="mt-4 text-h1 font-serif font-semibold text-text">{service.name}</h1>
          <p className="mt-3 text-body-lg text-text-muted">{service.description}</p>

          <div className="mt-6 flex flex-wrap gap-6">
            <div>
              <p className="text-caption text-text-muted">Thời lượng dự kiến</p>
              <p className="mt-1 flex items-center gap-1.5 text-body font-semibold text-text">
                <Clock className="size-4.5 text-primary" aria-hidden="true" />
                {formatDurationMinutes(service.durationMinutes)}
              </p>
            </div>
            <div>
              <p className="text-caption text-text-muted">{service.isFixedPrice ? "Giá dịch vụ" : "Giá tham khảo"}</p>
              <p className="mt-1 text-body font-semibold text-primary">
                {!service.isFixedPrice ? "Từ " : ""}
                {formatPriceRange(service.priceFrom, service.priceTo ?? undefined)}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={`/booking/services?service=${service.id}`}>Đặt lịch dịch vụ này</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/services">Xem dịch vụ khác</Link>
            </Button>
          </div>

          <ul className="mt-8 flex flex-col gap-2.5 text-body-sm text-text-muted">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
              Tư vấn dáng móng và màu sắc phù hợp trước khi thực hiện
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
              Dụng cụ được vệ sinh, khử trùng theo quy trình
            </li>
          </ul>
        </div>
      </div>

      {staff.length > 0 ? (
        <section className="mt-16">
          <h2 className="text-h2 font-serif font-semibold text-text">Kỹ thuật viên phù hợp</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {staff.map((member) => (
              <StaffCard key={member.id} staff={member} />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}
