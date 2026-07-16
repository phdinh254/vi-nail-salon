"use client";

import { Wallet, Receipt, TrendingUp, Undo2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPaymentsClient } from "@/app/admin/payments/admin-payments-client";
import { useApi } from "@/hooks/use-api";
import { listPayments } from "@/services/admin.service";
import { formatCurrencyVND } from "@/utils/format";

export default function AdminPaymentsPage() {
  const paymentsState = useApi(listPayments, []);
  const payments = paymentsState.data ?? [];

  const paid = payments.filter((p) => p.status === "PAID");
  const refunded = payments.filter((p) => p.status === "REFUNDED");
  const totalPaid = paid.reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = refunded.reduce((sum, p) => sum + p.amount, 0);
  const averageTicket = paid.length > 0 ? Math.round(totalPaid / paid.length) : 0;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Thanh toán" description="Lịch sử giao dịch thanh toán theo lịch hẹn đã hoàn thành." />

      {paymentsState.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : paymentsState.error ? (
        <p className="text-body-sm text-error">{paymentsState.error}</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Tổng thu (đã thanh toán)" value={formatCurrencyVND(totalPaid)} icon={Wallet} tone="success" />
            <StatCard label="Số giao dịch" value={String(paid.length)} icon={Receipt} />
            <StatCard label="Giá trị trung bình" value={formatCurrencyVND(averageTicket)} icon={TrendingUp} />
            <StatCard label="Đã hoàn tiền" value={formatCurrencyVND(totalRefunded)} icon={Undo2} tone="warning" trend={`${refunded.length} giao dịch`} />
          </div>

          <AdminPaymentsClient payments={payments} onRefunded={paymentsState.refetch} />
        </>
      )}
    </div>
  );
}
