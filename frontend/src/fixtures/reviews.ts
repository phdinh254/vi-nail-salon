import type { Review } from "@/types/review";

export const reviews: Review[] = [
  {
    id: "rv-1",
    customerName: "Khách hàng Thảo My",
    rating: 5,
    content: "Nhân viên tư vấn kỹ, tay nghề đẹp, không gian sạch sẽ. Sẽ quay lại lần sau.",
    serviceName: "Nối Gel Toàn Bộ",
    createdAt: "2026-06-18",
    isVerified: true,
  },
  {
    id: "rv-2",
    customerName: "Khách hàng Ngọc Diệp",
    rating: 5,
    content: "Đặt lịch online rất nhanh, đến nơi không phải chờ lâu. Màu gel lên rất chuẩn.",
    serviceName: "Sơn Gel Tay",
    createdAt: "2026-06-25",
    isVerified: true,
  },
  {
    id: "rv-3",
    customerName: "Khách hàng Hải Yến",
    rating: 4,
    content: "Dịch vụ tốt, giá hợp lý so với chất lượng. Chỉ hơi đông vào cuối tuần.",
    serviceName: "Pedicure Spa Thư Giãn",
    createdAt: "2026-07-02",
    isVerified: true,
  },
  {
    id: "rv-4",
    customerName: "Khách hàng Bảo Trân",
    rating: 5,
    content: "Mẫu nail art đúng như hình tham khảo, chị Minh Anh vẽ rất tỉ mỉ.",
    serviceName: "Đính Đá & Vẽ 3D",
    createdAt: "2026-07-08",
    isVerified: true,
  },
];

export function getAverageRating(): number {
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}
