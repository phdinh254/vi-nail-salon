"use client";

import { CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerAppointmentsList } from "@/app/customer/appointments/appointments-list";
import { useAuth } from "@/stores/auth-store";
import { useApi } from "@/hooks/use-api";
import { listMyAppointments } from "@/services/appointment.service";

export default function CustomerAppointmentsPage() {
  const { user } = useAuth();
  const { data: appointments, isLoading, error } = useApi(listMyAppointments, [], { enabled: Boolean(user) });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Lịch hẹn của tôi" description="Theo dõi trạng thái và lịch sử các lượt hẹn." />
      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-72" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      ) : error ? (
        <EmptyState icon={CalendarCheck} title="Không thể tải lịch hẹn" description={error} />
      ) : (
        <CustomerAppointmentsList appointments={appointments ?? []} />
      )}
    </div>
  );
}
