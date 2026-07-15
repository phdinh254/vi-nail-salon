"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/providers/toast-provider";
import type { Staff } from "@/types/staff";
import { getAppointmentsByStaffId } from "@/fixtures/appointments";
import { getServiceById } from "@/fixtures/services";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export function AdminStaffClient({ staffMembers }: { staffMembers: Staff[] }) {
  const { showToast } = useToast();
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>(
    Object.fromEntries(staffMembers.map((s) => [s.id, s.isActive])),
  );

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {staffMembers.map((staff) => {
        const completed = getAppointmentsByStaffId(staff.id).filter((a) => a.status === "COMPLETED").length;
        return (
          <div key={staff.id} className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar initials={initialsOf(staff.name)} />
                <div>
                  <p className="text-body font-semibold text-text">{staff.name}</p>
                  <p className="text-body-sm text-text-muted">{staff.role}</p>
                </div>
              </div>
              <Switch
                id={`active-${staff.id}`}
                checked={activeMap[staff.id]}
                label={`Trạng thái hoạt động của ${staff.name}`}
                onChange={(checked) => {
                  setActiveMap((prev) => ({ ...prev, [staff.id]: checked }));
                  showToast({ variant: "info", title: checked ? "Đã kích hoạt nhân viên" : "Đã tạm ngưng nhân viên" });
                }}
              />
            </div>

            <div className="mt-4">
              <p className="text-caption text-text-muted">Dịch vụ có thể thực hiện</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {staff.serviceIds.map((id) => {
                  const service = getServiceById(id);
                  return service ? (
                    <Badge key={id} tone="neutral">
                      {service.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-caption text-text-muted">Ca làm việc</p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {staff.shifts.map((shift) => (
                  <li key={shift.day} className="text-body-sm text-text">
                    {shift.day}: {shift.time}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-body-sm">
              <span className="text-text-muted">Lịch đã hoàn thành</span>
              <span className="font-semibold text-text">{completed}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
