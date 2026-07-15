import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarPlus,
  Heart,
  Bell,
  Star,
  UserCircle,
  CalendarDays,
  Users,
  Palmtree,
  BarChart3,
  ClipboardList,
  UserCog,
  Scissors,
  Sparkles,
  Tag,
  Wallet,
  LineChart,
  ShieldCheck,
  Settings,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon };

export const customerNavItems: NavItem[] = [
  { label: "Tổng quan", href: "/customer/dashboard", icon: LayoutDashboard },
  { label: "Lịch hẹn", href: "/customer/appointments", icon: CalendarCheck },
  { label: "Đặt lịch mới", href: "/booking", icon: CalendarPlus },
  { label: "Yêu thích", href: "/customer/favorites", icon: Heart },
  { label: "Thông báo", href: "/customer/notifications", icon: Bell },
  { label: "Đánh giá", href: "/customer/reviews", icon: Star },
  { label: "Hồ sơ", href: "/customer/profile", icon: UserCircle },
];

export const customerMobileNavItems: NavItem[] = [
  { label: "Tổng quan", href: "/customer/dashboard", icon: LayoutDashboard },
  { label: "Lịch hẹn", href: "/customer/appointments", icon: CalendarCheck },
  { label: "Đặt lịch", href: "/booking", icon: CalendarPlus },
  { label: "Yêu thích", href: "/customer/favorites", icon: Heart },
  { label: "Hồ sơ", href: "/customer/profile", icon: UserCircle },
];

export const staffNavItems: NavItem[] = [
  { label: "Tổng quan", href: "/staff/dashboard", icon: LayoutDashboard },
  { label: "Lịch hẹn", href: "/staff/appointments", icon: CalendarCheck },
  { label: "Lịch làm việc", href: "/staff/calendar", icon: CalendarDays },
  { label: "Khách hàng", href: "/staff/customers", icon: Users },
  { label: "Nghỉ phép", href: "/staff/time-off", icon: Palmtree },
  { label: "Hiệu suất", href: "/staff/performance", icon: BarChart3 },
  { label: "Hồ sơ", href: "/staff/profile", icon: UserCircle },
];

export const staffMobileNavItems: NavItem[] = [
  { label: "Tổng quan", href: "/staff/dashboard", icon: LayoutDashboard },
  { label: "Lịch hẹn", href: "/staff/appointments", icon: CalendarCheck },
  { label: "Lịch làm việc", href: "/staff/calendar", icon: CalendarDays },
  { label: "Hồ sơ", href: "/staff/profile", icon: UserCircle },
];

export const adminNavItems: NavItem[] = [
  { label: "Tổng quan", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Lịch hẹn", href: "/admin/appointments", icon: ClipboardList },
  { label: "Khách hàng", href: "/admin/customers", icon: Users },
  { label: "Nhân viên", href: "/admin/staff", icon: UserCog },
  { label: "Ca làm", href: "/admin/schedules", icon: CalendarDays },
  { label: "Dịch vụ", href: "/admin/services", icon: Scissors },
  { label: "Mẫu nail", href: "/admin/nail-designs", icon: Sparkles },
  { label: "Ưu đãi", href: "/admin/promotions", icon: Tag },
  { label: "Thanh toán", href: "/admin/payments", icon: Wallet },
  { label: "Báo cáo", href: "/admin/reports", icon: LineChart },
  { label: "Đánh giá", href: "/admin/reviews", icon: Star },
  { label: "Nhật ký", href: "/admin/audit-logs", icon: ShieldCheck },
  { label: "Cài đặt", href: "/admin/settings", icon: Settings },
];
