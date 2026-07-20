export type DisplaySession = {
  name: string;
  initials: string;
  phone: string;
  email?: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
  title?: string;
  staffId?: string;
};
