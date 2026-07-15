export function formatCurrencyVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPriceRange(from: number, to?: number): string {
  if (!to || to === from) return `${formatCurrencyVND(from)}`;
  return `${formatCurrencyVND(from)} - ${formatCurrencyVND(to)}`;
}

export function formatDurationMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} giờ` : `${hours} giờ ${rest} phút`;
}

const weekdays = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

export function formatDateVN(date: Date): string {
  return `${weekdays[date.getDay()]}, ${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
}

export function formatDateShortVN(date: Date): string {
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
}

export function formatTimeVN(date: Date): string {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

export function maskPhoneNumber(phone: string): string {
  const digits = phone.replace(/\s+/g, "");
  if (digits.length < 7) return phone;
  return `${digits.slice(0, 4)} *** ${digits.slice(-3)}`;
}

export function isValidVietnamesePhone(phone: string): boolean {
  return /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(phone.replace(/\s+/g, ""));
}
