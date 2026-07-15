/**
 * Fixture phiên đăng nhập dùng để trình bày giao diện theo từng role.
 * Đây KHÔNG phải cơ chế xác thực thật — quyền truy cập thật sẽ được
 * enforce ở Route Handler và service layer khi kết nối backend.
 */
export type DemoSession = {
  name: string;
  initials: string;
  phone: string;
  email?: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
  title?: string;
  staffId?: string;
};

export const demoCustomerSession: DemoSession = {
  name: "Thảo My",
  initials: "TM",
  phone: "0909111222",
  email: "thaomy@gmail.com",
  role: "CUSTOMER",
};

export const demoStaffSession: DemoSession = {
  name: "Lê Ngọc Bích",
  initials: "NB",
  phone: "0955001122",
  role: "STAFF",
  title: "Kỹ thuật viên",
  staffId: "staff-ngoc-bich",
};

export const demoAdminSession: DemoSession = {
  name: "Hồng Vân",
  initials: "HV",
  phone: "0900112233",
  role: "ADMIN",
  title: "Quản trị viên",
};
