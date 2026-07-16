import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { getNailDesign, getServiceByIdAsync } from "@/services/catalog.service";
import { nailDesignStyleLabel, nailDesignColorLabel } from "@/types/nail-design";

export const dynamic = "force-dynamic";

export default async function NailDesignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const design = await getNailDesign(id);
  if (!design) notFound();

  const relatedServices = await getServiceByIdAsync(design.serviceId);

  return (
    <Container className="py-10 sm:py-14">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Bộ sưu tập mẫu nail", href: "/nail-gallery" },
          { label: design.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <PlaceholderImage label={`Ảnh mẫu nail: ${design.name}`} ratio="aspect-square" />
        <div>
          <div className="flex flex-wrap gap-2">
            {design.isNew ? <Badge tone="warning">Mới</Badge> : null}
            <Badge tone="primary">{nailDesignStyleLabel[design.style]}</Badge>
          </div>
          <h1 className="mt-4 text-h1 font-serif font-semibold text-text">{design.name}</h1>
          <p className="mt-3 text-body-lg text-text-muted">{design.description}</p>

          <div className="mt-6">
            <p className="text-caption text-text-muted">Bảng màu</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {design.colors.map((color) => (
                <Badge key={color} tone="neutral">
                  {nailDesignColorLabel[color]}
                </Badge>
              ))}
            </div>
          </div>

          {relatedServices ? (
            <div className="mt-6 rounded-lg border border-border bg-bg-subtle p-4">
              <p className="text-caption text-text-muted">Thực hiện cùng dịch vụ</p>
              <p className="mt-1 text-body font-semibold text-text">{relatedServices.name}</p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={`/booking/services?nailDesign=${design.id}`}>Chọn mẫu này khi đặt lịch</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/nail-gallery">Xem mẫu khác</Link>
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
