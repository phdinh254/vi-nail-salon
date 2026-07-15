"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { NailDesignCard } from "@/components/domain/nail-design-card";
import type { NailDesign } from "@/types/nail-design";

export function FavoritesClient({ initialDesigns }: { initialDesigns: NailDesign[] }) {
  const [designs, setDesigns] = useState(initialDesigns);

  if (designs.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Chưa có mẫu nail yêu thích"
        description="Lưu mẫu nail bạn thích khi xem bộ sưu tập để xem lại tại đây."
        actionLabel="Khám phá bộ sưu tập"
        actionHref="/nail-gallery"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {designs.map((design) => (
        <NailDesignCard
          key={design.id}
          design={design}
          isFavorite
          onToggleFavorite={() => setDesigns((prev) => prev.filter((d) => d.id !== design.id))}
        />
      ))}
    </div>
  );
}
