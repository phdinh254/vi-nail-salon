import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StaffCard } from "@/components/domain/staff-card";
import { listStaff } from "@/services/catalog.service";

export const metadata: Metadata = { title: "Đội ngũ nhân viên" };

export default async function StaffPage() {
  const staff = await listStaff();

  return (
    <Container className="py-10 sm:py-14">
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Đội ngũ" }]} />
      <PageHeader
        className="mt-4"
        title="Đội ngũ của chúng tôi"
        description="Kỹ thuật viên giàu kinh nghiệm, mỗi người một thế mạnh riêng."
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((member) => (
          <StaffCard key={member.id} staff={member} />
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 rounded-lg bg-bg-subtle p-8 text-center">
        <p className="text-body font-semibold text-text">Muốn đặt lịch với một nhân viên cụ thể?</p>
        <Button asChild>
          <Link href="/booking">Đặt lịch ngay</Link>
        </Button>
      </div>
    </Container>
  );
}
