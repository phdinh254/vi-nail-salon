"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StaffAppointmentsList } from "@/app/staff/appointments/appointments-list";
import { useAuth } from "@/stores/auth-store";
import { useApi } from "@/hooks/use-api";
import { listAppointmentsByStaff } from "@/services/appointment.service";

export default function StaffAppointmentsPage() {
  const { user } = useAuth();
  const { data: appointments, isLoading, error } = useApi(listAppointmentsByStaff, [], {
    enabled: Boolean(user),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Lịch hẹn của tôi" description="Chỉ hiển thị lịch hẹn được phân công cho bạn." />
      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : error ? (
        <EmptyState title="Không thể tải lịch hẹn" description={error} />
      ) : (
        <StaffAppointmentsList appointments={appointments ?? []} />
      )}
    </div>
  );
}
