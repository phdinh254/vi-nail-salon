import { PageHeader } from "@/components/ui/page-header";
import { AdminServicesClient } from "@/app/admin/services/admin-services-client";

export default function AdminServicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dịch vụ" description="Quản lý giá, thời lượng và trạng thái nổi bật của dịch vụ." />
      <AdminServicesClient />
    </div>
  );
}
