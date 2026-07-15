import { PageHeader } from "@/components/ui/page-header";
import { AdminNailDesignsClient } from "@/app/admin/nail-designs/admin-nail-designs-client";
import { nailDesigns } from "@/fixtures/nail-designs";

export default function AdminNailDesignsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Mẫu nail" description="Quản lý bộ sưu tập mẫu nail hiển thị cho khách hàng." />
      <AdminNailDesignsClient initialDesigns={nailDesigns} />
    </div>
  );
}
