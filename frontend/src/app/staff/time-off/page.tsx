"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TimeOffClient } from "@/app/staff/time-off/time-off-client";
import { useAuth } from "@/stores/auth-store";
import { useApi } from "@/hooks/use-api";
import { listMyTimeOff } from "@/services/time-off.service";

export default function StaffTimeOffPage() {
  const { user } = useAuth();
  const { data: requests, isLoading, error, refetch } = useApi(listMyTimeOff, [], {
    enabled: Boolean(user),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nghỉ phép" description="Gửi yêu cầu nghỉ phép và theo dõi trạng thái phê duyệt." />
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <EmptyState title="Không thể tải yêu cầu nghỉ phép" description={error} />
      ) : (
        <TimeOffClient requests={requests ?? []} onRequested={refetch} />
      )}
    </div>
  );
}
