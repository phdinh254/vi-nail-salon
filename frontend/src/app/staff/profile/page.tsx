import { PageHeader } from "@/components/ui/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { demoStaffSession } from "@/fixtures/session";
import { getStaffById } from "@/fixtures/staff";

export default function StaffProfilePage() {
  const profile = getStaffById(demoStaffSession.staffId as string);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Hồ sơ của tôi" description="Thông tin công khai với khách hàng khi đặt lịch." />

      <div className="flex items-center gap-4">
        <Avatar initials={demoStaffSession.initials} size="lg" />
        <div>
          <p className="text-body font-semibold text-text">{demoStaffSession.name}</p>
          <p className="text-body-sm text-text-muted">{profile?.role}</p>
        </div>
      </div>

      {profile ? (
        <div className="max-w-xl rounded-lg border border-border bg-surface p-5">
          <p className="text-body-sm text-text-muted">{profile.bio}</p>

          <div className="mt-4">
            <p className="text-label text-text">Chuyên môn</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {profile.specialties.map((s) => (
                <Badge key={s} tone="neutral">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-label text-text">Ca làm việc</p>
            <ul className="mt-2 flex flex-col gap-1">
              {profile.shifts.map((shift) => (
                <li key={shift.day} className="text-body-sm text-text-muted">
                  {shift.day}: {shift.time}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-caption text-text-muted">
            Liên hệ quản trị viên nếu cần cập nhật thông tin chuyên môn hoặc ca làm việc.
          </p>
        </div>
      ) : null}
    </div>
  );
}
