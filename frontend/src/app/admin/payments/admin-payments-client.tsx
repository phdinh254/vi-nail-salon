"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/providers/toast-provider";
import { refundPayment } from "@/services/admin.service";
import { ApiError } from "@/lib/api-client";
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  paymentMethodLabel,
  paymentStatusLabel,
  type Payment,
} from "@/types/payment";
import { formatCurrencyVND, formatDateShortVN, formatTimeVN } from "@/utils/format";

export function AdminPaymentsClient({ payments, onRefunded }: { payments: Payment[]; onRefunded?: () => void }) {
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);

  const filtered = useMemo(
    () =>
      payments.filter((p) => {
        const matchesQuery =
          p.customerName.toLowerCase().includes(query.toLowerCase()) ||
          p.appointmentCode.toLowerCase().includes(query.toLowerCase());
        const matchesMethod = method === "ALL" || p.method === method;
        const matchesStatus = status === "ALL" || p.status === status;
        return matchesQuery && matchesMethod && matchesStatus;
      }),
    [payments, query, method, status],
  );

  async function handleRefund() {
    if (!refundTarget) return;
    setIsRefunding(true);
    try {
      await refundPayment(refundTarget.id);
      showToast({ variant: "success", title: "Đã hoàn tiền", description: refundTarget.appointmentCode });
      onRefunded?.();
      setRefundTarget(null);
    } catch (err) {
      showToast({
        variant: "error",
        title: "Không thể hoàn tiền",
        description: err instanceof ApiError ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setIsRefunding(false);
    }
  }

  const columns: DataTableColumn<Payment>[] = [
    { header: "Mã lịch hẹn", cell: (p) => <span className="font-medium">{p.appointmentCode}</span> },
    { header: "Khách hàng", cell: (p) => p.customerName },
    {
      header: "Thời gian",
      cell: (p) => `${formatDateShortVN(new Date(p.paidAt))} ${formatTimeVN(new Date(p.paidAt))}`,
    },
    { header: "Phương thức", cell: (p) => paymentMethodLabel[p.method] },
    {
      header: "Trạng thái",
      cell: (p) => <Badge tone={p.status === "PAID" ? "success" : "warning"}>{paymentStatusLabel[p.status]}</Badge>,
    },
    {
      header: "Số tiền",
      cell: (p) => (
        <span className={p.status === "REFUNDED" ? "text-error" : "text-text"}>
          {p.status === "REFUNDED" ? "-" : ""}
          {formatCurrencyVND(p.amount)}
        </span>
      ),
    },
    {
      header: "",
      cell: (p) =>
        p.status === "PAID" ? (
          <button
            type="button"
            onClick={() => setRefundTarget(p)}
            className="text-body-sm font-medium text-primary hover:underline"
          >
            Hoàn tiền
          </button>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          placeholder="Tìm theo tên khách hoặc mã lịch hẹn..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-sm"
        />
        <Select value={method} onChange={(e) => setMethod(e.target.value)} className="sm:max-w-xs" aria-label="Lọc theo phương thức">
          <option value="ALL">Tất cả phương thức</option>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {paymentMethodLabel[m]}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:max-w-xs" aria-label="Lọc theo trạng thái">
          <option value="ALL">Tất cả trạng thái</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {paymentStatusLabel[s]}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="Không tìm thấy giao dịch phù hợp" />
      ) : (
        <DataTable columns={columns} rows={filtered} />
      )}

      <ConfirmDialog
        open={Boolean(refundTarget)}
        onClose={() => setRefundTarget(null)}
        onConfirm={handleRefund}
        title="Xác nhận hoàn tiền"
        description={refundTarget ? `Hoàn tiền giao dịch ${refundTarget.appointmentCode} của khách ${refundTarget.customerName}?` : undefined}
        destructive
        confirmLabel="Xác nhận hoàn tiền"
        isLoading={isRefunding}
      />
    </div>
  );
}
