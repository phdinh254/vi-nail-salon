"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, Clock, Phone, User, AlertTriangle, Wallet } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorState } from "@/components/ui/error-state";
import { siteConfig } from "@/config/site";
import { lookupGuestAppointment, canModifyStatuses } from "@/features/guest-booking/lookup";
import { GuestLookupForm } from "@/features/guest-booking/guest-lookup-form";
import { formatCurrencyVND, formatDateVN, formatDurationMinutes, formatTimeVN } from "@/utils/format";

function GuestBookingContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const phone = searchParams.get("phone");

  if (!code || !phone) {
    return (
      <Container className="max-w-lg py-10 sm:py-14">
        <PageHeader title="Tra cứu lịch hẹn" description="Nhập mã lịch hẹn và số điện thoại đã dùng khi đặt lịch." />
        <div className="mt-8">
          <GuestLookupForm />
        </div>
      </Container>
    );
  }

  const appointment = lookupGuestAppointment(code, phone);

  if (!appointment) {
    return (
      <Container className="max-w-lg py-10 sm:py-14">
        <ErrorState title="Không tìm thấy lịch hẹn" description="Liên kết hoặc thông tin tra cứu không còn hợp lệ." />
        <div className="mt-6 text-center">
          <Button asChild variant="secondary">
            <Link href="/guest-booking">Tra cứu lại</Link>
          </Button>
        </div>
      </Container>
    );
  }

  const canModify = canModifyStatuses.includes(appointment.status);
  const query = `code=${encodeURIComponent(appointment.code)}&phone=${encodeURIComponent(phone)}`;

  return (
    <Container className="max-w-2xl py-10 sm:py-14">
      <PageHeader title="Lịch hẹn của bạn" description={`Mã lịch hẹn ${appointment.code}`} actions={<StatusBadge status={appointment.status} />} />

      <div className="mt-8 rounded-lg border border-border bg-surface p-6 shadow-soft-sm">
        <dl className="flex flex-col gap-3 text-body-sm">
          <div className="flex items-center gap-2.5">
            <CalendarDays className="size-4.5 text-primary" aria-hidden="true" />
            <dt className="sr-only">Ngày giờ</dt>
            <dd className="text-text">
              {formatDateVN(new Date(appointment.startAt))} · {formatTimeVN(new Date(appointment.startAt))} - {formatTimeVN(new Date(appointment.endAt))}
            </dd>
          </div>
          <div className="flex items-center gap-2.5">
            <User className="size-4.5 text-primary" aria-hidden="true" />
            <dt className="sr-only">Nhân viên</dt>
            <dd className="text-text">{appointment.staffName ?? "Đang chờ phân công"}</dd>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="size-4.5 text-primary" aria-hidden="true" />
            <dt className="sr-only">Thời lượng</dt>
            <dd className="text-text">{formatDurationMinutes(appointment.totalDurationMinutes)}</dd>
          </div>
          <div className="flex items-center gap-2.5">
            <Wallet className="size-4.5 text-primary" aria-hidden="true" />
            <dt className="sr-only">Giá dự kiến</dt>
            <dd className="font-semibold text-primary">
              {formatCurrencyVND(appointment.totalPrice)}
              {appointment.depositAmount ? ` · Đã cọc ${formatCurrencyVND(appointment.depositAmount)}` : ""}
            </dd>
          </div>
        </dl>

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-label text-text">Dịch vụ</p>
          <ul className="mt-2 flex flex-col gap-1">
            {appointment.services.map((s) => (
              <li key={s.serviceId} className="text-body-sm text-text">
                {s.serviceName}
              </li>
            ))}
          </ul>
        </div>

        {appointment.requestNote ? (
          <p className="mt-4 border-t border-border pt-4 text-body-sm text-text-muted">Ghi chú: {appointment.requestNote}</p>
        ) : null}

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-label text-text">Lịch sử trạng thái</p>
          <ol className="mt-3 flex flex-col gap-2">
            {appointment.timeline.map((entry) => (
              <li key={entry.at} className="flex items-center gap-2.5 text-body-sm">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                <StatusBadge status={entry.status} />
                <span className="text-caption text-text-muted">
                  {formatDateVN(new Date(entry.at))} · {formatTimeVN(new Date(entry.at))}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-bg-subtle p-5 text-body-sm text-text-muted">
        <p className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
          Có thể đổi hoặc hủy lịch miễn phí trước giờ hẹn tối thiểu 2 giờ.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {canModify ? (
          <>
            <Button asChild>
              <Link href={`/guest-booking/reschedule?${query}`}>Đổi lịch hẹn</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={`/guest-booking/cancel?${query}`}>Hủy lịch hẹn</Link>
            </Button>
          </>
        ) : (
          <>
            <Button disabled>Đổi lịch hẹn</Button>
            <Button variant="secondary" disabled>
              Hủy lịch hẹn
            </Button>
          </>
        )}
        <Button asChild variant="ghost">
          <a href={siteConfig.phoneHref}>
            <Phone className="size-4" aria-hidden="true" />
            Liên hệ tiệm
          </a>
        </Button>
      </div>

      {!canModify ? (
        <p className="mt-2 text-caption text-text-muted">
          Lịch hẹn ở trạng thái hiện tại không thể tự đổi hoặc hủy trực tuyến. Vui lòng liên hệ tiệm để được hỗ trợ.
        </p>
      ) : null}

      <div className="mt-10 flex flex-col items-center gap-3 rounded-lg border border-dashed border-accent p-6 text-center">
        <p className="text-body font-semibold text-text">Muốn xem toàn bộ lịch sử đặt lịch?</p>
        <Button asChild variant="secondary">
          <Link href="/register">Tạo tài khoản</Link>
        </Button>
      </div>
    </Container>
  );
}

export default function GuestBookingPage() {
  return (
    <Suspense>
      <GuestBookingContent />
    </Suspense>
  );
}
