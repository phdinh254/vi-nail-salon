import type { Payment } from "@/types/payment";

export const payments: Payment[] = [
  {
    id: "pay-1",
    appointmentId: "apt-1004",
    appointmentCode: "VN-1004",
    customerName: "Bảo Trân",
    amount: 120000,
    method: "CASH",
    status: "PAID",
    paidAt: "2026-07-15T08:30:00+07:00",
  },
  {
    id: "pay-2",
    appointmentId: "apt-1007",
    appointmentCode: "VN-1007",
    customerName: "Thảo My",
    amount: 220000,
    method: "E_WALLET",
    status: "PAID",
    paidAt: "2026-07-05T10:45:00+07:00",
  },
  {
    id: "pay-3",
    appointmentId: "apt-1013",
    appointmentCode: "VN-1013",
    customerName: "Việt Hoàng",
    amount: 500000,
    method: "BANK_TRANSFER",
    status: "PAID",
    paidAt: "2026-07-08T15:40:00+07:00",
  },
  {
    id: "pay-4",
    appointmentId: "apt-1014",
    appointmentCode: "VN-1014",
    customerName: "Thu Hằng",
    amount: 40000,
    method: "CASH",
    status: "PAID",
    paidAt: "2026-07-11T15:20:00+07:00",
  },
  {
    id: "pay-5",
    appointmentId: "apt-1015",
    appointmentCode: "VN-1015",
    customerName: "Minh Thư",
    amount: 220000,
    method: "E_WALLET",
    status: "PAID",
    paidAt: "2026-07-12T11:40:00+07:00",
  },
  {
    id: "pay-6",
    appointmentId: "apt-1016",
    appointmentCode: "VN-1016",
    customerName: "Gia Bảo",
    amount: 230000,
    method: "BANK_TRANSFER",
    status: "PAID",
    paidAt: "2026-07-14T17:20:00+07:00",
  },
  {
    id: "pay-7",
    appointmentId: "apt-1006",
    appointmentCode: "VN-1006",
    customerName: "Thảo My",
    amount: 220000,
    method: "BANK_TRANSFER",
    status: "REFUNDED",
    paidAt: "2026-07-09T18:00:00+07:00",
  },
];

export function getPaymentByAppointmentId(appointmentId: string): Payment | undefined {
  return payments.find((payment) => payment.appointmentId === appointmentId);
}
