import { PageHeader } from "@/components/ui/page-header";
import { AdminPromotionsClient } from "@/app/admin/promotions/admin-promotions-client";
import { promotions } from "@/fixtures/promotions";

export default function AdminPromotionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Ưu đãi" description="Quản lý chương trình khuyến mãi đang áp dụng." />
      <AdminPromotionsClient initialPromotions={promotions} />
    </div>
  );
}
