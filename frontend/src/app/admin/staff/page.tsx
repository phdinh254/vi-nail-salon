import { PageHeader } from "@/components/ui/page-header";
import { AdminStaffClient } from "@/app/admin/staff/admin-staff-client";
import { staffMembers } from "@/fixtures/staff";

export default function AdminStaffPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nhân viên" description="Quản lý hồ sơ, dịch vụ đảm nhận và ca làm việc." />
      <AdminStaffClient staffMembers={staffMembers} />
    </div>
  );
}
