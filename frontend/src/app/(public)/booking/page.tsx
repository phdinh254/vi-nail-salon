import type { Metadata } from "next";
import Link from "next/link";
import { ListChecks, Users, CalendarClock, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Đặt lịch" };

const highlights = [
  { icon: ListChecks, text: "Chọn một hoặc nhiều dịch vụ theo nhu cầu" },
  { icon: Users, text: "Chọn nhân viên yêu thích hoặc để tiệm sắp xếp" },
  { icon: CalendarClock, text: "Chọn ngày giờ trống phù hợp với bạn" },
  { icon: ShieldCheck, text: "Xác minh nhanh bằng số điện thoại, không cần mật khẩu" },
];

export default function BookingIntroPage() {
  return (
    <Container className="flex flex-col items-center py-14 text-center sm:py-20">
      <h1 className="text-h1 font-serif font-semibold text-text">Đặt lịch tại Lys Nail Studio</h1>
      <p className="mt-3 max-w-lg text-body-lg text-text-muted">
        Không cần tạo tài khoản. Chỉ mất khoảng 2 phút với vài bước đơn giản.
      </p>

      <div className="mt-10 grid w-full max-w-2xl gap-4 text-left sm:grid-cols-2">
        {highlights.map((item) => (
          <div key={item.text} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/30 text-primary">
              <item.icon className="size-4.5" aria-hidden="true" />
            </span>
            <p className="text-body-sm text-text">{item.text}</p>
          </div>
        ))}
      </div>

      <Button asChild size="lg" className="mt-10">
        <Link href="/booking/services">Bắt đầu đặt lịch</Link>
      </Button>

      <p className="mt-4 text-body-sm text-text-muted">
        Đã có lịch hẹn?{" "}
        <Link href="/guest-booking" className="font-medium text-primary hover:underline">
          Tra cứu lịch hẹn của bạn
        </Link>
      </p>
    </Container>
  );
}
