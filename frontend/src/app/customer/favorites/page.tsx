import { PageHeader } from "@/components/ui/page-header";
import { FavoritesClient } from "@/app/customer/favorites/favorites-client";
import { demoCustomerSession } from "@/fixtures/session";
import { getFavoriteDesignIds } from "@/fixtures/favorites";
import { nailDesigns } from "@/fixtures/nail-designs";

export default function CustomerFavoritesPage() {
  const favoriteIds = getFavoriteDesignIds(demoCustomerSession.phone);
  const designs = nailDesigns.filter((d) => favoriteIds.includes(d.id));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Mẫu nail yêu thích" description="Danh sách mẫu nail bạn đã lưu để xem lại." />
      <FavoritesClient initialDesigns={designs} />
    </div>
  );
}
