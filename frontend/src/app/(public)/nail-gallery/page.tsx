import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { NailGalleryExplorer } from "@/features/gallery/nail-gallery-explorer";
import { listNailDesigns } from "@/services/catalog.service";

export const metadata: Metadata = { title: "Bộ sưu tập mẫu nail" };
// Dữ liệu backend thay đổi thường xuyên và không có lúc build (Docker build
// không có backend sống) — luôn render động ở mỗi request thay vì prerender tĩnh.
export const dynamic = "force-dynamic";

export default async function NailGalleryPage() {
  const designs = await listNailDesigns();

  return (
    <Container className="py-10 sm:py-14">
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Bộ sưu tập mẫu nail" }]} />
      <PageHeader
        className="mt-4"
        title="Bộ sưu tập mẫu nail"
        description="Tham khảo mẫu và chọn sẵn khi đặt lịch để tiết kiệm thời gian tư vấn."
      />
      <div className="mt-8">
        <NailGalleryExplorer designs={designs} />
      </div>
    </Container>
  );
}
