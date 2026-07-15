import type { Staff } from "@/types/staff";

export const staffMembers: Staff[] = [
  {
    id: "staff-lan",
    name: "Nguyễn Thị Lan",
    role: "Kỹ thuật viên trưởng",
    bio: "8 năm kinh nghiệm, chuyên sâu về nối gel và tạo dáng móng tự nhiên.",
    yearsExperience: 8,
    specialties: ["Nối Gel", "Tạo dáng móng"],
    serviceIds: ["svc-gel-extension", "svc-acrylic-full", "svc-acrylic-fill"],
    isActive: true,
    shifts: [
      { day: "Thứ Hai - Thứ Sáu", time: "09:00 - 18:00" },
      { day: "Thứ Bảy", time: "09:00 - 20:00" },
    ],
  },
  {
    id: "staff-minh-anh",
    name: "Trần Minh Anh",
    role: "Chuyên viên Nail Art",
    bio: "5 năm kinh nghiệm vẽ họa tiết và đính đá theo yêu cầu riêng.",
    yearsExperience: 5,
    specialties: ["Vẽ Nail Art", "Đính đá 3D"],
    serviceIds: ["svc-nail-art-basic", "svc-nail-art-3d", "svc-gel-polish-tay"],
    isActive: true,
    shifts: [
      { day: "Thứ Ba - Chủ Nhật", time: "10:00 - 19:00" },
    ],
  },
  {
    id: "staff-thu-ha",
    name: "Phạm Thu Hà",
    role: "Chuyên viên Chăm sóc da",
    bio: "4 năm kinh nghiệm về liệu trình dưỡng ẩm và chăm sóc tay chân.",
    yearsExperience: 4,
    specialties: ["Chăm sóc da tay", "Pedicure spa"],
    serviceIds: ["svc-pedicure-spa", "svc-care-hand-mask", "svc-care-paraffin"],
    isActive: true,
    shifts: [{ day: "Thứ Hai - Thứ Bảy", time: "09:00 - 17:30" }],
  },
  {
    id: "staff-ngoc-bich",
    name: "Lê Ngọc Bích",
    role: "Kỹ thuật viên",
    bio: "3 năm kinh nghiệm về manicure, pedicure và sơn gel.",
    yearsExperience: 3,
    specialties: ["Manicure", "Sơn Gel"],
    serviceIds: ["svc-manicure-co-ban", "svc-manicure-spa", "svc-gel-polish-tay", "svc-gel-polish-chan"],
    isActive: true,
    shifts: [{ day: "Thứ Hai - Thứ Sáu", time: "11:00 - 20:00" }],
  },
  {
    id: "staff-gia-han",
    name: "Đỗ Gia Hân",
    role: "Kỹ thuật viên",
    bio: "2 năm kinh nghiệm, chuyên tháo gỡ và chăm sóc móng cơ bản.",
    yearsExperience: 2,
    specialties: ["Tháo gỡ", "Manicure cơ bản"],
    serviceIds: ["svc-removal-gel", "svc-manicure-co-ban", "svc-pedicure-co-ban"],
    isActive: true,
    shifts: [{ day: "Thứ Tư - Chủ Nhật", time: "09:00 - 18:00" }],
  },
];

export function getStaffById(id: string): Staff | undefined {
  return staffMembers.find((staff) => staff.id === id);
}

export function getStaffForService(serviceId: string): Staff[] {
  return staffMembers.filter((staff) => staff.serviceIds.includes(serviceId));
}
