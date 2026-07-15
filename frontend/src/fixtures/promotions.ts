import type { Promotion } from "@/types/promotion";

export const promotions: Promotion[] = [
  {
    id: "promo-khach-moi",
    title: "Ưu đãi khách hàng mới",
    description: "Giảm 15% cho lượt đặt lịch đầu tiên khi trải nghiệm dịch vụ tại Vi Nail.",
    discountLabel: "-15%",
    validFrom: "2026-07-01",
    validTo: "2026-08-31",
    conditions: [
      "Áp dụng cho khách đặt lịch lần đầu tiên",
      "Không áp dụng cùng lúc với ưu đãi khác",
      "Áp dụng cho mọi dịch vụ trừ tháo gỡ",
    ],
    isActive: true,
  },
  {
    id: "promo-combo-tay-chan",
    title: "Combo Tay Chân Trọn Gói",
    description: "Giảm 10% khi đặt đồng thời dịch vụ Manicure và Pedicure trong cùng lượt hẹn.",
    discountLabel: "-10%",
    validFrom: "2026-06-01",
    validTo: "2026-09-30",
    conditions: [
      "Áp dụng khi chọn tối thiểu 1 dịch vụ Manicure và 1 dịch vụ Pedicure",
      "Không áp dụng cho dịch vụ đã giảm giá khác",
    ],
    isActive: true,
  },
  {
    id: "promo-gio-vang",
    title: "Giờ Vàng Buổi Sáng",
    description: "Giảm 10% cho lịch hẹn trong khung giờ 9:00 - 12:00 các ngày trong tuần.",
    discountLabel: "-10%",
    validFrom: "2026-07-01",
    validTo: "2026-12-31",
    conditions: [
      "Áp dụng cho lịch hẹn bắt đầu từ 9:00 đến trước 12:00",
      "Áp dụng từ Thứ Hai đến Thứ Sáu",
    ],
    isActive: true,
  },
];

export function getActivePromotions(): Promotion[] {
  return promotions.filter((promotion) => promotion.isActive);
}
