"use client";

import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/container";
import { StepIndicator } from "@/components/ui/step-indicator";
import { BookingProvider } from "@/features/booking/booking-context";

const steps = [
  { path: "/booking/services", label: "Dịch vụ" },
  { path: "/booking/staff", label: "Nhân viên" },
  { path: "/booking/schedule", label: "Ngày giờ" },
  { path: "/booking/customer-info", label: "Thông tin" },
  { path: "/booking/verify-otp", label: "Xác minh" },
  { path: "/booking/review", label: "Kiểm tra" },
  { path: "/booking/success", label: "Hoàn tất" },
];

export default function BookingWizardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.path === pathname),
  );

  return (
    <BookingProvider>
      <div className="border-b border-border bg-bg-subtle py-5">
        <Container>
          <StepIndicator steps={steps.map((s) => s.label)} currentIndex={currentIndex} />
        </Container>
      </div>
      <Container className="py-8 sm:py-10">{children}</Container>
    </BookingProvider>
  );
}
