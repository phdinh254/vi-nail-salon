"use client";

import { use } from "react";
import { CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AppointmentDetailClient } from "@/app/customer/appointments/[id]/appointment-detail-client";
import { useAuth } from "@/stores/auth-store";
import { useApi } from "@/hooks/use-api";
import { getAppointment } from "@/services/appointment.service";

export default function CustomerAppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const {
    data: appointment,
    isLoading,
    error,
    refetch,
  } = useApi(() => getAppointment(id), [id], { enabled: Boolean(user) });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full max-w-2xl" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Lịch hẹn" />
        <EmptyState
          icon={CalendarCheck}
          title="Không thể tải lịch hẹn"
          description={error ?? "Lịch hẹn không tồn tại."}
        />
      </div>
    );
  }

  return <AppointmentDetailClient appointment={appointment} onCancelled={refetch} />;
}
