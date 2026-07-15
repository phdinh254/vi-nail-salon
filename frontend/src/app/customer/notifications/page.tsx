import { PageHeader } from "@/components/ui/page-header";
import { NotificationsClient } from "@/app/customer/notifications/notifications-client";
import { customerNotifications } from "@/fixtures/notifications";

export default function CustomerNotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Thông báo" description="Cập nhật về lịch hẹn và ưu đãi dành cho bạn." />
      <NotificationsClient initialItems={customerNotifications} />
    </div>
  );
}
