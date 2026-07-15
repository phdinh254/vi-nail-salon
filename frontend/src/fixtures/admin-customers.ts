import type { AdminCustomer } from "@/types/customer";

export const adminCustomers: AdminCustomer[] = [
  {
    id: "cus-thao-my",
    name: "Thảo My",
    phone: "0909111222",
    accountType: "CUSTOMER",
    totalVisits: 6,
    lastVisitAt: "2026-07-05T10:45:00+07:00",
    note: "Khách quen, thường đặt nối gel vào cuối tuần.",
  },
  {
    id: "cus-hai-yen",
    name: "Hải Yến",
    phone: "0977445566",
    accountType: "GUEST",
    totalVisits: 1,
    lastVisitAt: null,
    note: null,
  },
  {
    id: "cus-ngoc-diep",
    name: "Ngọc Diệp",
    phone: "0912345678",
    accountType: "CUSTOMER",
    totalVisits: 3,
    lastVisitAt: "2026-07-15T09:00:00+07:00",
    note: null,
  },
  {
    id: "cus-bao-tran",
    name: "Bảo Trân",
    phone: "0933221100",
    accountType: "CUSTOMER",
    totalVisits: 4,
    lastVisitAt: "2026-07-15T08:00:00+07:00",
    note: "Thích họa tiết đính đá.",
  },
  {
    id: "cus-minh-thu",
    name: "Minh Thư",
    phone: "0922334455",
    accountType: "GUEST",
    totalVisits: 1,
    lastVisitAt: "2026-07-14T09:00:00+07:00",
    note: "Vắng mặt không báo trước lần gần nhất.",
  },
  {
    id: "cus-gia-bao",
    name: "Gia Bảo",
    phone: "0987001122",
    accountType: "GUEST",
    totalVisits: 1,
    lastVisitAt: null,
    note: "Dị ứng tinh dầu tràm trà.",
  },
];

export function getAdminCustomerByPhone(phone: string): AdminCustomer | undefined {
  return adminCustomers.find((customer) => customer.phone === phone);
}
