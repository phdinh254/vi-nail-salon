import { PageHeader } from "@/components/ui/page-header";
import { CustomerReviewsClient } from "@/app/customer/reviews/reviews-client";
import { demoCustomerSession } from "@/fixtures/session";
import { getAppointmentsByPhone } from "@/fixtures/appointments";

export default function CustomerReviewsPage() {
  const reviewable = getAppointmentsByPhone(demoCustomerSession.phone).filter((a) => a.status === "COMPLETED");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Đánh giá của tôi" description="Chia sẻ trải nghiệm sau mỗi lượt sử dụng dịch vụ." />
      <CustomerReviewsClient reviewableAppointments={reviewable} />
    </div>
  );
}
