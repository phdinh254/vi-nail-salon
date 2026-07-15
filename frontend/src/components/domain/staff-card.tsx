import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Staff } from "@/types/staff";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export function StaffCard({ staff, className }: { staff: Staff; className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-6 text-center shadow-soft-sm ${className ?? ""}`}>
      <Avatar initials={initialsOf(staff.name)} size="lg" />
      <div>
        <p className="text-body font-semibold text-text">{staff.name}</p>
        <p className="text-body-sm text-primary">{staff.role}</p>
      </div>
      <p className="text-body-sm text-text-muted">{staff.bio}</p>
      <div className="flex flex-wrap justify-center gap-1.5">
        {staff.specialties.map((specialty) => (
          <Badge key={specialty} tone="neutral">
            {specialty}
          </Badge>
        ))}
      </div>
      <p className="text-caption text-text-muted">{staff.yearsExperience} năm kinh nghiệm</p>
    </div>
  );
}
