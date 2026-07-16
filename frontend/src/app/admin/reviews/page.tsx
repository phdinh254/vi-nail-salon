"use client";

import { Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/providers/toast-provider";
import { useApi } from "@/hooks/use-api";
import { listReviews, deleteReview } from "@/services/catalog.service";
import { ApiError } from "@/lib/api-client";
import { formatDateShortVN } from "@/utils/format";

export default function AdminReviewsPage() {
  const { showToast } = useToast();
  const reviewsState = useApi(listReviews, []);
  const reviews = reviewsState.data ?? [];

  async function handleDelete(id: string) {
    try {
      await deleteReview(id);
      showToast({ variant: "success", title: "Đã xóa đánh giá" });
      reviewsState.refetch();
    } catch (err) {
      showToast({
        variant: "error",
        title: "Không thể xóa đánh giá",
        description: err instanceof ApiError ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Đánh giá" description="Đánh giá từ khách hàng đã xác thực sau khi hoàn thành dịch vụ." />

      {reviewsState.isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : reviewsState.error ? (
        <p className="text-body-sm text-error">{reviewsState.error}</p>
      ) : reviews.length === 0 ? (
        <EmptyState title="Chưa có đánh giá nào" />
      ) : (
        <div className="rounded-lg border border-border bg-surface">
          <ul className="divide-y divide-border">
            {reviews.map((review) => (
              <li key={review.id} className="flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <p className="text-body-sm font-semibold text-text">{review.customerName}</p>
                    {review.isVerified ? <Badge tone="success">Đã xác thực</Badge> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-caption text-text-muted">{formatDateShortVN(new Date(review.createdAt))}</span>
                    <IconButton label={`Xóa đánh giá của ${review.customerName}`} size="sm" onClick={() => handleDelete(review.id)}>
                      <Trash2 className="size-4" aria-hidden="true" />
                    </IconButton>
                  </div>
                </div>
                <StarRating rating={review.rating} />
                <p className="text-body-sm text-text">{review.content}</p>
                <p className="text-caption text-text-muted">Dịch vụ: {review.serviceName}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
