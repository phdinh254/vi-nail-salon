import Link from "next/link";
import { CalendarPlus, Bell } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AppointmentCard } from "@/components/domain/appointment-card";
import { NailDesignCard } from "@/components/domain/nail-design-card";
import { demoCustomerSession } from "@/fixtures/session";
import { getAppointmentsByPhone } from "@/fixtures/appointments";
import { getFavoriteDesignIds } from "@/fixtures/favorites";
import { nailDesigns } from "@/fixtures/nail-designs";
import { customerNotifications } from "@/fixtures/notifications";
import { formatDateVN, formatTimeVN } from "@/utils/format";

const upcomingStatuses = ["PENDING_CONFIRMATION", "CONFIRMED", "CHECKED_IN", "IN_SERVICE"];

export default function CustomerDashboardPage() {
  const appointments = getAppointmentsByPhone(demoCustomerSession.phone);
  const upcoming = appointments.filter((a) => upcomingStatuses.includes(a.status));
  const history = appointments.filter((a) => a.status === "COMPLETED").slice(0, 2);
  const favoriteIds = getFavoriteDesignIds(demoCustomerSession.phone);
  const favoriteDesigns = nailDesigns.filter((d) => favoriteIds.includes(d.id)).slice(0, 3);
  const recentNotifications = customerNotifications.slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Xin chào, ${demoCustomerSession.name}`}
        description="Đây là tổng quan lịch hẹn và hoạt động gần đây của bạn."
        actions={
          <Button asChild>
            <Link href="/booking">
              <CalendarPlus className="size-4" aria-hidden="true" />
              Đặt lịch mới
            </Link>
          </Button>
        }
      />

      <section>
        <h2 className="text-h3 font-serif font-semibold text-text">Lịch hẹn sắp tới</h2>
        {upcoming.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Bạn chưa có lịch hẹn sắp tới" actionLabel="Đặt lịch ngay" actionHref="/booking" />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {upcoming.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} href={`/customer/appointments/${appointment.id}`} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-h3 font-serif font-semibold text-text">Mẫu nail yêu thích</h2>
          <Link href="/customer/favorites" className="text-body-sm font-medium text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>
        {favoriteDesigns.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Chưa có mẫu nail yêu thích" actionLabel="Khám phá bộ sưu tập" actionHref="/nail-gallery" />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {favoriteDesigns.map((design) => (
              <NailDesignCard key={design.id} design={design} isFavorite />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-h3 font-serif font-semibold text-text">Thông báo gần đây</h2>
            <Link href="/customer/notifications" className="text-body-sm font-medium text-primary hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            {recentNotifications.map((noti) => (
              <div key={noti.id} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
                <Bell className="mt-0.5 size-4.5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-body-sm font-medium text-text">{noti.title}</p>
                  <p className="text-caption text-text-muted">{noti.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-h3 font-serif font-semibold text-text">Lịch sử dịch vụ gần nhất</h2>
          {history.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Chưa có lịch sử dịch vụ" />
            </div>
          ) : (
            <ul className="mt-4 flex flex-col gap-2.5">
              {history.map((appointment) => (
                <li key={appointment.id} className="rounded-lg border border-border bg-surface p-4">
                  <p className="text-body-sm font-medium text-text">
                    {appointment.services.map((s) => s.serviceName).join(", ")}
                  </p>
                  <p className="text-caption text-text-muted">
                    {formatDateVN(new Date(appointment.startAt))} · {formatTimeVN(new Date(appointment.startAt))}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
