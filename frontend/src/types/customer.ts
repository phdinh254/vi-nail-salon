export type CustomerAccountType = "GUEST" | "CUSTOMER";

export type AdminCustomer = {
  id: string;
  name: string;
  phone: string;
  accountType: CustomerAccountType;
  totalVisits: number;
  lastVisitAt: string | null;
  note: string | null;
};
