"use client";

import { useMemo, useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { ServiceCard } from "@/components/domain/service-card";
import { SERVICE_CATEGORIES, serviceCategoryLabel, type Service } from "@/types/service";
import { Search } from "lucide-react";

export function ServicesExplorer({ services }: { services: Service[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("ALL");

  const tabs = [
    { value: "ALL", label: "Tất cả" },
    ...SERVICE_CATEGORIES.map((cat) => ({ value: cat, label: serviceCategoryLabel[cat] })),
  ];

  const filtered = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory = category === "ALL" || service.category === category;
      const matchesQuery = service.name.toLowerCase().includes(query.trim().toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [services, category, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs items={tabs} value={category} onChange={setCategory} className="sm:max-w-2xl" />
        <SearchInput
          placeholder="Tìm dịch vụ..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Tìm kiếm dịch vụ"
          className="sm:w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={Search}
            title="Không tìm thấy dịch vụ phù hợp"
            description="Hãy thử từ khóa khác hoặc chọn nhóm dịch vụ khác."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
