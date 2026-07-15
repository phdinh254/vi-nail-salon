export const PAYMENT_METHODS = ["CASH", "BANK_TRANSFER", "E_WALLET"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  CASH: "Tiền mặt",
  BANK_TRANSFER: "Chuyển khoản",
  E_WALLET: "Ví điện tử",
};

export const PAYMENT_STATUSES = ["PAID", "REFUNDED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn tiền",
};

export type Payment = {
  id: string;
  appointmentId: string;
  appointmentCode: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string;
};
