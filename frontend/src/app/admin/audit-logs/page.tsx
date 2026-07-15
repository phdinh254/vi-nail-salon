import { PageHeader } from "@/components/ui/page-header";
import { AdminAuditLogsClient } from "@/app/admin/audit-logs/admin-audit-logs-client";
import { auditLogs } from "@/fixtures/audit-logs";

export default function AdminAuditLogsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nhật ký hoạt động" description="Ghi nhận hành động của quản trị viên, nhân viên và hệ thống." />
      <AdminAuditLogsClient logs={auditLogs} />
    </div>
  );
}
