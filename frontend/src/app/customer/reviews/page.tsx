"use client";

import { Star } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerReviewsClient } from "@/app/customer/reviews/reviews-client";
import { useAuth } from "@/stores/auth-store";
import { useApi } from "@/hooks/use-api";
import { listMyAppointments } from "@/services/appointment.service";
import { listReviews } from "@/services/catalog.service";

export default function CustomerReviewsPage() {
  const { user } = useAuth();
  const {
    data: appointments,
    isLoading: isLoadingAppointments,
    error: appointmentsError,
  } = useApi(listMyAppointments, [], { enabled: Boolean(user) });
  const {
    data: reviews,
    isLoading: isLoadingReviews,
    refetch: refetchReviews,
  } = useApi(listReviews, [], { enabled: Boolean(user) });

  const reviewable = (appointments ?? []).filter((a) => a.status === "COMPLETED");
  // Không có endpoint "đánh giá của tôi" riêng — API /reviews trả về toàn bộ đánh giá
  // công khai. Vì kiểu Review không lưu appointmentId, ta lọc gần đúng theo tên khách
  // hàng khớp với tài khoản đang đăng nhập để hiển thị mục "đánh giá đã gửi".
  const myReviews = (reviews ?? []).filter((r) => r.customerName === user?.name);
  const isLoading = isLoadingAppointments || isLoadingReviews;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Đánh giá của tôi" description="Chia sẻ trải nghiệm sau mỗi lượt sử dụng dịch vụ." />
      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : appointmentsError ? (
        <EmptyState icon={Star} title="Không thể tải dữ liệu đánh giá" description={appointmentsError} />
      ) : (
        <CustomerReviewsClient
          reviewableAppointments={reviewable}
          myReviews={myReviews}
          onSubmitted={refetchReviews}
        />
      )}
    </div>
  );
}
