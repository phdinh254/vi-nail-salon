import { services, getServiceById, getServiceBySlug } from "@/fixtures/services";
import { staffMembers, getStaffById, getStaffForService } from "@/fixtures/staff";
import { nailDesigns, getNailDesignById } from "@/fixtures/nail-designs";
import { promotions, getActivePromotions } from "@/fixtures/promotions";
import { reviews, getAverageRating } from "@/fixtures/reviews";
import { faqItems } from "@/fixtures/faq";
import type { Service, ServiceCategory } from "@/types/service";
import type { Staff } from "@/types/staff";
import type { NailDesign } from "@/types/nail-design";

// Lớp data-access này trả về fixture đã được đánh type; khi backend sẵn sàng
// chỉ cần thay phần thân hàm bằng lời gọi API/Prisma, chữ ký hàm giữ nguyên.

export async function listServices(): Promise<Service[]> {
  return services;
}

export async function listServicesByCategory(
  category: ServiceCategory | "ALL",
): Promise<Service[]> {
  if (category === "ALL") return services;
  return services.filter((service) => service.category === category);
}

export async function listFeaturedServices(): Promise<Service[]> {
  return services.filter((service) => service.isFeatured);
}

export async function getService(slug: string): Promise<Service | undefined> {
  return getServiceBySlug(slug);
}

export async function getServiceByIdAsync(id: string): Promise<Service | undefined> {
  return getServiceById(id);
}

export async function listStaff(): Promise<Staff[]> {
  return staffMembers;
}

export async function getStaffMember(id: string): Promise<Staff | undefined> {
  return getStaffById(id);
}

export async function listStaffForService(serviceId: string): Promise<Staff[]> {
  return getStaffForService(serviceId);
}

export async function listNailDesigns(): Promise<NailDesign[]> {
  return nailDesigns;
}

export async function getNailDesign(id: string): Promise<NailDesign | undefined> {
  return getNailDesignById(id);
}

export async function listPromotions() {
  return promotions;
}

export async function listActivePromotions() {
  return getActivePromotions();
}

export async function listReviews() {
  return reviews;
}

export async function getReviewAverage() {
  return getAverageRating();
}

export async function listFaq() {
  return faqItems;
}
