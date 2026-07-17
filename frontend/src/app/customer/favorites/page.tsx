"use client";

import { Heart } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/stores/auth-store";
import { useApi } from "@/hooks/use-api";
import { listFavorites } from "@/services/catalog.service";
import { FavoritesClient } from "@/app/customer/favorites/favorites-client";

export default function CustomerFavoritesPage() {
  const { user } = useAuth();
  const { data: designs, isLoading, error } = useApi(listFavorites, [], { enabled: Boolean(user) });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Mẫu nail yêu thích" description="Danh sách mẫu nail bạn đã lưu để xem lại." />
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="aspect-square w-full" />
        </div>
      ) : error ? (
        <EmptyState icon={Heart} title="Không thể tải mẫu yêu thích" description={error} />
      ) : (
        <FavoritesClient initialDesigns={designs ?? []} />
      )}
    </div>
  );
}
