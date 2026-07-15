import { PageHeader } from "@/components/ui/page-header";
import { TimeOffClient } from "@/app/staff/time-off/time-off-client";
import { demoStaffSession } from "@/fixtures/session";
import { timeOffRequests } from "@/fixtures/time-off";

export default function StaffTimeOffPage() {
  const requests = timeOffRequests.filter((r) => r.staffId === demoStaffSession.staffId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nghỉ phép" description="Gửi yêu cầu nghỉ phép và theo dõi trạng thái phê duyệt." />
      <TimeOffClient initialRequests={requests} />
    </div>
  );
}
