"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/providers/toast-provider";
import { useApi } from "@/hooks/use-api";
import { listStaff, listServices, updateStaff } from "@/services/catalog.service";
import { listAllAppointments } from "@/services/appointment.service";
import { ApiError } from "@/lib/api-client";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export function AdminStaffClient() {
  const { showToast } = useToast();
  const staffState = useApi(listStaff, []);
  const servicesState = useApi(listServices, []);
  const appointmentsState = useApi(listAllAppointments, []);

  const staffMembers = staffState.data ?? [];
  const services = servicesState.data ?? [];
  const appointments = appointmentsState.data ?? [];

  const isLoading = staffState.isLoading || servicesState.isLoading || appointmentsState.isLoading;
  const error = staffState.error ?? servicesState.error ?? appointmentsState.error;

  async function handleToggleActive(id: string, name: string, checked: boolean) {
    try {
      await updateStaff(id, { isActive: checked });
      showToast({ variant: "info", title: checked ? "Đã kích hoạt nhân viên" : "Đã tạm ngưng nhân viên" });
      staffState.refetch();
    } catch (err) {
      showToast({
        variant: "error",
        title: "Không thể cập nhật trạng thái",
        description: err instanceof ApiError ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-56 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-body-sm text-error">{error}</p>;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {staffMembers.map((staff) => {
        const completed = appointments.filter((a) => a.staffId === staff.id && a.status === "COMPLETED").length;
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
                checked={staff.isActive}
                label={`Trạng thái hoạt động của ${staff.name}`}
                onChange={(checked) => handleToggleActive(staff.id, staff.name, checked)}
              />
            </div>

            <div className="mt-4">
              <p className="text-caption text-text-muted">Dịch vụ có thể thực hiện</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {staff.serviceIds.map((id) => {
                  const service = services.find((s) => s.id === id);
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
