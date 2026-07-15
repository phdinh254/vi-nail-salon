"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, CalendarPlus, Home, UserPlus } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/features/booking/booking-context";
import { getStaffById } from "@/fixtures/staff";
import { formatCurrencyVND, formatDateVN, formatDurationMinutes } from "@/utils/format";

function buildIcsFile(title: string, start: Date, minutes: number, location: string) {
  const end = new Date(start.getTime() + minutes * 60000);
  const toIcsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");
}

export default function BookingSuccessPage() {
  const router = useRouter();
  const { state, selectedServices, totalPrice, totalDurationMinutes, reset } = useBooking();
  const [code] = useState(() => `LN-${Date.now().toString().slice(-6)}`);

  useEffect(() => {
    if (selectedServices.length === 0 || !state.otpVerified || !state.date) {
      router.replace("/booking/services");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const icsHref = useMemo(() => {
    if (!state.date) return null;
    const ics = buildIcsFile(
      selectedServices.map((s) => s.name).join(", "),
      state.date,
      totalDurationMinutes,
      "Lys Nail Studio",
    );
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
  }, [state.date, selectedServices, totalDurationMinutes]);

  if (selectedServices.length === 0 || !state.otpVerified || !state.date) return null;

  const staff = state.staffId && state.staffId !== "ANY" ? getStaffById(state.staffId) : null;

  return (
    <Container className="flex flex-col items-center py-14 text-center sm:py-20">
      <CheckCircle2 className="size-16 text-success" aria-hidden="true" />
      <h1 className="mt-5 text-h1 font-serif font-semibold text-text">Đặt lịch thành công</h1>
      <p className="mt-2 max-w-md text-body text-text-muted">
        Thông báo xác nhận đã được gửi tới số điện thoại {state.customerPhone}.
      </p>

      <div className="mt-8 w-full max-w-md rounded-lg border border-border bg-surface p-6 text-left shadow-soft-sm">
        <p className="text-caption text-text-muted">Mã lịch hẹn</p>
        <p className="text-h3 font-serif font-semibold text-text">{code}</p>

        <dl className="mt-4 flex flex-col gap-2.5 border-t border-border pt-4 text-body-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-text-muted">Dịch vụ</dt>
            <dd className="text-right text-text">{selectedServices.map((s) => s.name).join(", ")}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-text-muted">Thời gian</dt>
            <dd className="text-text">{formatDateVN(state.date)} · {state.time}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-text-muted">Nhân viên</dt>
            <dd className="text-text">{staff ? staff.name : "Đang chờ phân công"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-text-muted">Thời lượng dự kiến</dt>
            <dd className="text-text">{formatDurationMinutes(totalDurationMinutes)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-text-muted">Giá dự kiến</dt>
            <dd className="font-semibold text-primary">{formatCurrencyVND(totalPrice)}</dd>
          </div>
        </dl>

        <p className="mt-4 border-t border-border pt-4 text-caption text-text-muted">
          Có thể đổi hoặc hủy lịch miễn phí trước giờ hẹn tối thiểu 2 giờ tại trang tra cứu lịch hẹn.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {icsHref ? (
          <Button asChild variant="secondary">
            <a href={icsHref} download={`${code}.ics`}>
              <CalendarPlus className="size-4" aria-hidden="true" />
              Thêm vào lịch
            </a>
          </Button>
        ) : null}
        <Button asChild variant="secondary">
          <Link href="/" onClick={() => reset()}>
            <Home className="size-4" aria-hidden="true" />
            Về trang chủ
          </Link>
        </Button>
      </div>

      <div className="mt-10 flex w-full max-w-md flex-col items-center gap-3 rounded-lg bg-bg-subtle p-6">
        <UserPlus className="size-6 text-primary" aria-hidden="true" />
        <p className="text-body font-semibold text-text">Tạo tài khoản để quản lý lịch hẹn dễ dàng hơn</p>
        <p className="text-body-sm text-text-muted">
          Xem lại lịch sử, lưu mẫu nail yêu thích và đặt lịch nhanh hơn trong lần sau.
        </p>
        <Button asChild>
          <Link href="/register">Tạo tài khoản</Link>
        </Button>
      </div>
    </Container>
  );
}
