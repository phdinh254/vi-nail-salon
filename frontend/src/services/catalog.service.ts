import { apiRequest } from "@/lib/api-client";
import type { Service, ServiceCategory } from "@/types/service";
import type { Staff } from "@/types/staff";
import type { NailDesign, NailDesignStyle } from "@/types/nail-design";
import type { Promotion } from "@/types/promotion";
import type { Review } from "@/types/review";
import { faqItems } from "@/fixtures/faq";

// Nội dung FAQ là văn bản tĩnh biên tập sẵn, không phải dữ liệu nghiệp vụ —
// không có model backend tương ứng nên vẫn dùng fixture.
export { faqItems };

// ---- mappers: chuyển shape Prisma trả về sang type UI đã có sẵn ----

const BACKEND_NAIL_STYLE_TO_UI: Record<string, NailDesignStyle> = {
  MINIMALIST: "MINIMALIST",
  FRENCH: "FRENCH",
  OMBRE: "OMBRE",
  CHROME: "CHROME",
  THREE_D_ART: "3D_ART",
  SEASONAL: "SEASONAL",
};

type BackendStaff = {
  id: string;
  user: { id: string; name: string; phone: string };
  role: string;
  bio: string;
  yearsExperience: number;
  specialties: string[];
  isActive: boolean;
  services: { serviceId: string }[];
  shifts: { day: string; time: string }[];
};

function mapStaff(raw: BackendStaff): Staff {
  return {
    id: raw.id,
    name: raw.user.name,
    role: raw.role,
    bio: raw.bio,
    yearsExperience: raw.yearsExperience,
    specialties: raw.specialties,
    serviceIds: raw.services.map((s) => s.serviceId),
    isActive: raw.isActive,
    shifts: raw.shifts.map((s) => ({ day: s.day, time: s.time })),
  };
}

type BackendNailDesign = {
  id: string;
  name: string;
  style: string;
  colors: string[];
  serviceId: string | null;
  description: string;
  isNew: boolean;
};

function mapNailDesign(raw: BackendNailDesign): NailDesign {
  return {
    id: raw.id,
    name: raw.name,
    style: BACKEND_NAIL_STYLE_TO_UI[raw.style] ?? "MINIMALIST",
    colors: raw.colors as NailDesign["colors"],
    serviceId: raw.serviceId ?? "",
    description: raw.description,
    isNew: raw.isNew,
  };
}

// ---- services ----

export async function listServices(): Promise<Service[]> {
  return apiRequest<Service[]>("/services");
}

export async function listServicesByCategory(category: ServiceCategory | "ALL"): Promise<Service[]> {
  if (category === "ALL") return listServices();
  return apiRequest<Service[]>("/services", { query: { category } });
}

export async function listFeaturedServices(): Promise<Service[]> {
  const services = await listServices();
  return services.filter((service) => service.isFeatured);
}

export async function getService(slug: string): Promise<Service | undefined> {
  try {
    return await apiRequest<Service>(`/services/${slug}`);
  } catch {
    return undefined;
  }
}

export async function getServiceByIdAsync(id: string): Promise<Service | undefined> {
  const services = await listServices();
  return services.find((service) => service.id === id);
}

// ---- staff ----

export async function listStaff(): Promise<Staff[]> {
  const raw = await apiRequest<BackendStaff[]>("/staff");
  return raw.map(mapStaff);
}

export async function getStaffMember(id: string): Promise<Staff | undefined> {
  try {
    const raw = await apiRequest<BackendStaff>(`/staff/${id}`);
    return mapStaff(raw);
  } catch {
    return undefined;
  }
}

export async function listStaffForService(serviceId: string): Promise<Staff[]> {
  const staff = await listStaff();
  return staff.filter((member) => member.serviceIds.includes(serviceId));
}

// ---- nail designs ----

export async function listNailDesigns(): Promise<NailDesign[]> {
  const raw = await apiRequest<BackendNailDesign[]>("/nail-designs");
  return raw.map(mapNailDesign);
}

export async function getNailDesign(id: string): Promise<NailDesign | undefined> {
  try {
    const raw = await apiRequest<BackendNailDesign>(`/nail-designs/${id}`);
    return mapNailDesign(raw);
  } catch {
    return undefined;
  }
}

// ---- favorites (customer only) ----

export async function listFavorites(): Promise<NailDesign[]> {
  const raw = await apiRequest<BackendNailDesign[]>("/favorites");
  return raw.map(mapNailDesign);
}

export async function addFavorite(nailDesignId: string): Promise<void> {
  await apiRequest(`/favorites/${nailDesignId}`, { method: "POST" });
}

export async function removeFavorite(nailDesignId: string): Promise<void> {
  await apiRequest(`/favorites/${nailDesignId}`, { method: "DELETE" });
}

// ---- promotions ----

export async function listPromotions(): Promise<Promotion[]> {
  return apiRequest<Promotion[]>("/promotions");
}

export async function listActivePromotions(): Promise<Promotion[]> {
  return apiRequest<Promotion[]>("/promotions", { query: { active: "true" } });
}

// ---- reviews ----

export async function listReviews(): Promise<Review[]> {
  return apiRequest<Review[]>("/reviews");
}

export async function getReviewAverage(): Promise<number> {
  const reviews = await listReviews();
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

// ---- faq ----

export async function listFaq() {
  return faqItems;
}

// ---- admin mutations ----

export async function createService(input: Omit<Service, "id">): Promise<Service> {
  return apiRequest<Service>("/services", { method: "POST", body: input });
}

export async function updateService(id: string, input: Partial<Omit<Service, "id">>): Promise<Service> {
  return apiRequest<Service>(`/services/${id}`, { method: "PATCH", body: input });
}

export async function deleteService(id: string): Promise<void> {
  await apiRequest(`/services/${id}`, { method: "DELETE" });
}

export type StaffMutationInput = {
  name: string;
  phone: string;
  password?: string;
  role: string;
  bio: string;
  yearsExperience: number;
  specialties: string[];
  serviceIds?: string[];
  shifts?: { day: string; time: string }[];
  isActive?: boolean;
};

export async function createStaff(input: StaffMutationInput): Promise<Staff> {
  const raw = await apiRequest<BackendStaff>("/staff", { method: "POST", body: input });
  return mapStaff(raw);
}

export async function updateStaff(
  id: string,
  input: Partial<Omit<StaffMutationInput, "phone" | "password">>,
): Promise<Staff> {
  const raw = await apiRequest<BackendStaff>(`/staff/${id}`, { method: "PATCH", body: input });
  return mapStaff(raw);
}

export async function deleteStaff(id: string): Promise<void> {
  await apiRequest(`/staff/${id}`, { method: "DELETE" });
}

const UI_NAIL_STYLE_TO_BACKEND: Record<NailDesignStyle, string> = {
  MINIMALIST: "MINIMALIST",
  FRENCH: "FRENCH",
  OMBRE: "OMBRE",
  CHROME: "CHROME",
  "3D_ART": "THREE_D_ART",
  SEASONAL: "SEASONAL",
};

export type NailDesignMutationInput = Omit<NailDesign, "id" | "serviceId"> & { serviceId?: string };

export async function createNailDesign(input: NailDesignMutationInput): Promise<NailDesign> {
  const raw = await apiRequest<BackendNailDesign>("/nail-designs", {
    method: "POST",
    body: { ...input, style: UI_NAIL_STYLE_TO_BACKEND[input.style] },
  });
  return mapNailDesign(raw);
}

export async function updateNailDesign(
  id: string,
  input: Partial<NailDesignMutationInput>,
): Promise<NailDesign> {
  const raw = await apiRequest<BackendNailDesign>(`/nail-designs/${id}`, {
    method: "PATCH",
    body: { ...input, style: input.style ? UI_NAIL_STYLE_TO_BACKEND[input.style] : undefined },
  });
  return mapNailDesign(raw);
}

export async function deleteNailDesign(id: string): Promise<void> {
  await apiRequest(`/nail-designs/${id}`, { method: "DELETE" });
}

export async function createPromotion(input: Omit<Promotion, "id">): Promise<Promotion> {
  return apiRequest<Promotion>("/promotions", { method: "POST", body: input });
}

export async function updatePromotion(id: string, input: Partial<Omit<Promotion, "id">>): Promise<Promotion> {
  return apiRequest<Promotion>(`/promotions/${id}`, { method: "PATCH", body: input });
}

export async function deletePromotion(id: string): Promise<void> {
  await apiRequest(`/promotions/${id}`, { method: "DELETE" });
}

export async function createReview(input: { appointmentId: string; rating: number; content: string }): Promise<Review> {
  return apiRequest<Review>("/reviews", { method: "POST", body: input });
}

export async function deleteReview(id: string): Promise<void> {
  await apiRequest(`/reviews/${id}`, { method: "DELETE" });
}
