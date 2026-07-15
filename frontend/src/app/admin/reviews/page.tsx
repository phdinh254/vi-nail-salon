import { PageHeader } from "@/components/ui/page-header";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { reviews } from "@/fixtures/reviews";
import { formatDateShortVN } from "@/utils/format";

export default function AdminReviewsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Đánh giá" description="Đánh giá từ khách hàng đã xác thực sau khi hoàn thành dịch vụ." />

      <div className="rounded-lg border border-border bg-surface">
        <ul className="divide-y divide-border">
          {reviews.map((review) => (
            <li key={review.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <p className="text-body-sm font-semibold text-text">{review.customerName}</p>
                  {review.isVerified ? <Badge tone="success">Đã xác thực</Badge> : null}
                </div>
                <span className="text-caption text-text-muted">{formatDateShortVN(new Date(review.createdAt))}</span>
              </div>
              <StarRating rating={review.rating} />
              <p className="text-body-sm text-text">{review.content}</p>
              <p className="text-caption text-text-muted">Dịch vụ: {review.serviceName}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
