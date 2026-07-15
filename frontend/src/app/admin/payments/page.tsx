import { Wallet, Receipt, TrendingUp, Undo2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { AdminPaymentsClient } from "@/app/admin/payments/admin-payments-client";
import { payments } from "@/fixtures/payments";
import { formatCurrencyVND } from "@/utils/format";

export default function AdminPaymentsPage() {
  const paid = payments.filter((p) => p.status === "PAID");
  const refunded = payments.filter((p) => p.status === "REFUNDED");
  const totalPaid = paid.reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = refunded.reduce((sum, p) => sum + p.amount, 0);
  const averageTicket = paid.length > 0 ? Math.round(totalPaid / paid.length) : 0;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Thanh toán" description="Lịch sử giao dịch thanh toán theo lịch hẹn đã hoàn thành." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tổng thu (đã thanh toán)" value={formatCurrencyVND(totalPaid)} icon={Wallet} tone="success" />
        <StatCard label="Số giao dịch" value={String(paid.length)} icon={Receipt} />
        <StatCard label="Giá trị trung bình" value={formatCurrencyVND(averageTicket)} icon={TrendingUp} />
        <StatCard label="Đã hoàn tiền" value={formatCurrencyVND(totalRefunded)} icon={Undo2} tone="warning" trend={`${refunded.length} giao dịch`} />
      </div>

      <AdminPaymentsClient payments={payments} />

      <p className="text-caption text-text-muted">
        Đây là dữ liệu minh họa từ lịch hẹn đã hoàn thành. Khi kết nối cổng thanh toán thật, trang này sẽ đọc trực
        tiếp từ hệ thống giao dịch thay vì fixture.
      </p>
    </div>
  );
}
