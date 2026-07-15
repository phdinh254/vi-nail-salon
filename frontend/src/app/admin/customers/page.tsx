import { PageHeader } from "@/components/ui/page-header";
import { AdminCustomersClient } from "@/app/admin/customers/admin-customers-client";
import { adminCustomers } from "@/fixtures/admin-customers";

export default function AdminCustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Khách hàng" description="Tra cứu và theo dõi lịch sử khách hàng đã đặt lịch." />
      <AdminCustomersClient customers={adminCustomers} />
    </div>
  );
}
