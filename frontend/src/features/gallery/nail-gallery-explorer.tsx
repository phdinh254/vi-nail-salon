"use client";

import { useMemo, useState } from "react";
import { ImageOff } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { NailDesignCard } from "@/components/domain/nail-design-card";
import {
  NAIL_DESIGN_STYLES,
  nailDesignStyleLabel,
  nailDesignColorLabel,
  type NailDesign,
  type NailDesignColor,
} from "@/types/nail-design";
import { useToast } from "@/components/providers/toast-provider";

const colorOptions: NailDesignColor[] = ["NUDE", "RED", "PINK", "WHITE", "BLACK", "GOLD", "PASTEL"];

export function NailGalleryExplorer({ designs }: { designs: NailDesign[] }) {
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState("ALL");
  const [color, setColor] = useState("ALL");
  const { showToast } = useToast();

  const filtered = useMemo(() => {
    return designs.filter((design) => {
      const matchesQuery = design.name.toLowerCase().includes(query.trim().toLowerCase());
      const matchesStyle = style === "ALL" || design.style === style;
      const matchesColor = color === "ALL" || design.colors.includes(color as NailDesignColor);
      return matchesQuery && matchesStyle && matchesColor;
    });
  }, [designs, query, style, color]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <SearchInput
          placeholder="Tìm mẫu nail..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Tìm kiếm mẫu nail"
        />
        <Select aria-label="Lọc theo phong cách" value={style} onChange={(e) => setStyle(e.target.value)}>
          <option value="ALL">Tất cả phong cách</option>
          {NAIL_DESIGN_STYLES.map((s) => (
            <option key={s} value={s}>
              {nailDesignStyleLabel[s]}
            </option>
          ))}
        </Select>
        <Select aria-label="Lọc theo màu" value={color} onChange={(e) => setColor(e.target.value)}>
          <option value="ALL">Tất cả màu sắc</option>
          {colorOptions.map((c) => (
            <option key={c} value={c}>
              {nailDesignColorLabel[c]}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={ImageOff}
            title="Không tìm thấy mẫu phù hợp"
            description="Thử điều chỉnh bộ lọc phong cách hoặc màu sắc."
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((design) => (
            <NailDesignCard
              key={design.id}
              design={design}
              onToggleFavorite={() =>
                showToast({
                  variant: "info",
                  title: "Đăng nhập để lưu mẫu yêu thích",
                  description: "Tạo tài khoản để lưu mẫu nail và xem lại bất cứ lúc nào.",
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
