export const siteConfig = {
  brandName: "Vi Nail",
  brandTagline: "Chăm sóc móng tinh tế cho phái đẹp",
  brandShortName: "Vi Nail",
  description:
    "Tiệm nail một chi nhánh tại Việt Nam, cung cấp dịch vụ manicure, pedicure, gel và nail art theo tiêu chuẩn cao cấp.",
  phone: "0909 123 456",
  phoneHref: "tel:0909123456",
  zalo: "0909 123 456",
  email: "hello@vinail.vn",
  address: "12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
  mapEmbedUrl:
    "https://www.google.com/maps?q=12+Nguy%E1%BB%85n+Hu%E1%BB%87,+Qu%E1%BA%ADn+1,+TP.HCM&output=embed",
  openingHours: [
    { day: "Thứ Hai - Thứ Sáu", time: "09:00 - 20:00" },
    { day: "Thứ Bảy - Chủ Nhật", time: "09:00 - 21:00" },
  ],
  socials: [
    { label: "Facebook", href: "https://facebook.com" },
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Zalo", href: "https://zalo.me" },
  ],
} as const;

export const navLinks = [
  { label: "Dịch vụ", href: "/services" },
  { label: "Bảng giá", href: "/pricing" },
  { label: "Mẫu nail", href: "/nail-gallery" },
  { label: "Đội ngũ", href: "/staff" },
  { label: "Ưu đãi", href: "/promotions" },
  { label: "Giới thiệu", href: "/about" },
  { label: "Liên hệ", href: "/contact" },
] as const;

export const footerLinks = {
  explore: [
    { label: "Dịch vụ", href: "/services" },
    { label: "Bảng giá", href: "/pricing" },
    { label: "Bộ sưu tập mẫu nail", href: "/nail-gallery" },
    { label: "Đội ngũ nhân viên", href: "/staff" },
    { label: "Ưu đãi", href: "/promotions" },
  ],
  support: [
    { label: "Câu hỏi thường gặp", href: "/policies#faq" },
    { label: "Chính sách đặt lịch", href: "/policies" },
    { label: "Liên hệ", href: "/contact" },
    { label: "Tra cứu lịch hẹn", href: "/guest-booking" },
  ],
  account: [
    { label: "Đăng nhập", href: "/login" },
    { label: "Tạo tài khoản", href: "/register" },
    { label: "Đặt lịch ngay", href: "/booking" },
  ],
} as const;
