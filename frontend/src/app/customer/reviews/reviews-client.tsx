"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/providers/toast-provider";
import { cn } from "@/utils/cn";
import type { Appointment } from "@/types/appointment";
import { formatDateVN } from "@/utils/format";

export function CustomerReviewsClient({ reviewableAppointments }: { reviewableAppointments: Appointment[] }) {
  const { showToast } = useToast();
  const [target, setTarget] = useState<Appointment | null>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);

  const pending = reviewableAppointments.filter((a) => !reviewedIds.includes(a.id));

  function handleSubmit() {
    if (!target) return;
    setReviewedIds((prev) => [...prev, target.id]);
    setTarget(null);
    setContent("");
    setRating(5);
    showToast({ variant: "success", title: "Đã gửi đánh giá", description: "Cảm ơn bạn đã chia sẻ trải nghiệm." });
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-h3 font-serif font-semibold text-text">Chờ đánh giá</h2>
        {pending.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Không có dịch vụ nào cần đánh giá" description="Đánh giá sẽ xuất hiện ở đây sau khi bạn hoàn thành lịch hẹn." />
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-2.5">
            {pending.map((appointment) => (
              <li key={appointment.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4">
                <div>
                  <p className="text-body-sm font-medium text-text">
                    {appointment.services.map((s) => s.serviceName).join(", ")}
                  </p>
                  <p className="text-caption text-text-muted">{formatDateVN(new Date(appointment.startAt))}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setTarget(appointment)}>
                  Viết đánh giá
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title="Đánh giá dịch vụ"
        description={target ? target.services.map((s) => s.serviceName).join(", ") : undefined}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Chọn số sao đánh giá">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={rating === star}
                aria-label={`${star} sao`}
                onClick={() => setRating(star)}
              >
                <Star className={cn("size-7", star <= rating ? "fill-warning text-warning" : "text-border")} aria-hidden="true" />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Chia sẻ trải nghiệm của bạn..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button onClick={handleSubmit} className="w-fit">
            Gửi đánh giá
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
