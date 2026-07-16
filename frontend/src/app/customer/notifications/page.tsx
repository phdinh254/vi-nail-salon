"use client";

import { BellOff } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationsClient } from "@/app/customer/notifications/notifications-client";
import { useAuth } from "@/stores/auth-store";
import { useApi } from "@/hooks/use-api";
import { listCustomerNotifications } from "@/services/notification.service";

export default function CustomerNotificationsPage() {
  const { user } = useAuth();
  const { data: notifications, isLoading, error } = useApi(listCustomerNotifications, [], {
    enabled: Boolean(user),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Thông báo" description="Cập nhật về lịch hẹn và ưu đãi dành cho bạn." />
      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : error ? (
        <EmptyState icon={BellOff} title="Không thể tải thông báo" description={error} />
      ) : (
        <NotificationsClient initialItems={notifications ?? []} />
      )}
    </div>
  );
}
