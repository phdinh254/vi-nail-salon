export const SERVICE_CATEGORIES = [
  "MANICURE",
  "PEDICURE",
  "GEL_POLISH",
  "ACRYLIC",
  "GEL_EXTENSION",
  "NAIL_ART",
  "REMOVAL",
  "CARE",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const serviceCategoryLabel: Record<ServiceCategory, string> = {
  MANICURE: "Manicure",
  PEDICURE: "Pedicure",
  GEL_POLISH: "Sơn Gel",
  ACRYLIC: "Bột Acrylic",
  GEL_EXTENSION: "Nối Gel",
  NAIL_ART: "Vẽ Nail Art",
  REMOVAL: "Tháo Gỡ",
  CARE: "Chăm Sóc Da",
};

export type Service = {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  shortDescription: string;
  description: string;
  priceFrom: number;
  priceTo: number | null;
  isFixedPrice: boolean;
  durationMinutes: number;
  isFeatured: boolean;
};
