import { PageHeader } from "@/components/ui/page-header";
import { Avatar } from "@/components/ui/avatar";
import { staffMembers } from "@/fixtures/staff";
import { timeOffRequests, timeOffStatusLabel } from "@/fixtures/time-off";
import { Badge } from "@/components/ui/badge";
import { formatDateShortVN } from "@/utils/format";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export default function AdminSchedulesPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Ca làm việc" description="Tổng hợp ca làm việc và nghỉ phép của toàn bộ nhân viên." />

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <ul className="divide-y divide-border">
          {staffMembers.map((staff) => (
            <li key={staff.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Avatar initials={initialsOf(staff.name)} size="sm" />
                <p className="text-body-sm font-medium text-text">{staff.name}</p>
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-text-muted">
                {staff.shifts.map((shift) => (
                  <li key={shift.day}>
                    {shift.day}: {shift.time}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <section>
        <h2 className="text-h3 font-serif font-semibold text-text">Yêu cầu nghỉ phép</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface">
          <ul className="divide-y divide-border">
            {timeOffRequests.map((req) => {
              const staff = staffMembers.find((s) => s.id === req.staffId);
              return (
                <li key={req.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <div>
                    <p className="text-body-sm font-medium text-text">{staff?.name}</p>
                    <p className="text-caption text-text-muted">
                      {formatDateShortVN(new Date(req.startDate))} - {formatDateShortVN(new Date(req.endDate))} · {req.reason}
                    </p>
                  </div>
                  <Badge tone={req.status === "APPROVED" ? "success" : req.status === "REJECTED" ? "error" : "warning"}>
                    {timeOffStatusLabel[req.status]}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
