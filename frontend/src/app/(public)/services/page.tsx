import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { ServicesExplorer } from "@/features/services/services-explorer";
import { listServices } from "@/services/catalog.service";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Dịch vụ" };

export default async function ServicesPage() {
  const services = await listServices();

  return (
    <Container className="py-10 sm:py-14">
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Dịch vụ" }]} />
      <PageHeader
        className="mt-4"
        title={`Dịch vụ tại ${siteConfig.brandName}`}
        description="Chọn dịch vụ theo nhu cầu, xem giá và thời lượng dự kiến."
      />
      <div className="mt-8">
        <ServicesExplorer services={services} />
      </div>
    </Container>
  );
}
