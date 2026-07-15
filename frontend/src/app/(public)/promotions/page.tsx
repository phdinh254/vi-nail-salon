import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { listPromotions } from "@/services/catalog.service";
import { formatDateShortVN } from "@/utils/format";

export const metadata: Metadata = { title: "Ưu đãi" };

export default async function PromotionsPage() {
  const promotions = await listPromotions();

  return (
    <Container className="py-10 sm:py-14">
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Ưu đãi" }]} />
      <PageHeader className="mt-4" title="Chương trình ưu đãi" description="Áp dụng tự động khi đặt lịch trong thời gian khuyến mãi." />

      {promotions.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="Hiện chưa có chương trình ưu đãi" description="Vui lòng quay lại sau." />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {promotions.map((promotion) => (
            <div key={promotion.id} className="flex flex-col rounded-lg border border-border bg-surface p-6 shadow-soft-sm">
              <div className="flex items-center justify-between gap-3">
                <Badge tone="warning">{promotion.discountLabel}</Badge>
                <Badge tone={promotion.isActive ? "success" : "neutral"}>
                  {promotion.isActive ? "Đang áp dụng" : "Đã kết thúc"}
                </Badge>
              </div>
              <h2 className="mt-3 text-h3 font-serif font-semibold text-text">{promotion.title}</h2>
              <p className="mt-2 text-body-sm text-text-muted">{promotion.description}</p>
              <p className="mt-3 text-caption text-text-muted">
                Áp dụng từ {formatDateShortVN(new Date(promotion.validFrom))} đến {formatDateShortVN(new Date(promotion.validTo))}
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {promotion.conditions.map((condition) => (
                  <li key={condition} className="flex items-start gap-2 text-body-sm text-text-muted">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    {condition}
                  </li>
                ))}
              </ul>
              {promotion.isActive ? (
                <Button asChild className="mt-5 w-fit">
                  <Link href="/booking">Đặt lịch để nhận ưu đãi</Link>
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
