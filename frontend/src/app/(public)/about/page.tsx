import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake, Sparkles, ShieldCheck, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Giới thiệu" };

const values = [
  { icon: Sparkles, title: "Tay nghề chỉn chu", description: "Kỹ thuật viên được đào tạo bài bản, cập nhật xu hướng liên tục." },
  { icon: ShieldCheck, title: "An toàn vệ sinh", description: "Dụng cụ khử trùng đúng quy trình cho từng lượt khách." },
  { icon: HeartHandshake, title: "Tận tâm với khách hàng", description: "Lắng nghe nhu cầu và tư vấn trung thực, không ép dịch vụ." },
  { icon: Clock, title: "Đúng giờ hẹn", description: "Hệ thống đặt lịch giúp hạn chế chờ đợi ngoài dự kiến." },
];

export default function AboutPage() {
  return (
    <Container className="py-10 sm:py-14">
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Giới thiệu" }]} />
      <PageHeader className="mt-4" title={`Về ${siteConfig.brandName}`} />

      <div className="mt-8 grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="text-body-lg text-text-muted">
            {siteConfig.brandName} được thành lập với mong muốn mang đến trải nghiệm làm nail
            chuyên nghiệp nhưng vẫn gần gũi, dễ chịu như ghé thăm một người bạn hiểu ý bạn.
          </p>
          <p className="mt-4 text-body text-text-muted">
            Chúng tôi tập trung vào một chi nhánh duy nhất để đảm bảo chất lượng đồng nhất trong
            từng dịch vụ, từ khâu tư vấn, thực hiện đến chăm sóc sau khi hoàn thành.
          </p>
        </div>
        <PlaceholderImage label="Ảnh không gian tiệm" ratio="aspect-[4/3]" />
      </div>

      <section className="mt-16">
        <h2 className="text-h2 font-serif font-semibold text-text">Giá trị cốt lõi</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <div key={value.title} className="rounded-lg border border-border bg-surface p-5">
              <span className="flex size-11 items-center justify-center rounded-full bg-accent/30 text-primary">
                <value.icon className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-3 text-body font-semibold text-text">{value.title}</p>
              <p className="mt-1.5 text-body-sm text-text-muted">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-h2 font-serif font-semibold text-text">Không gian tiệm</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <PlaceholderImage label="Ảnh khu vực tiếp đón" />
          <PlaceholderImage label="Ảnh khu vực làm móng tay" />
          <PlaceholderImage label="Ảnh khu vực pedicure" />
          <PlaceholderImage label="Ảnh khu vực chờ" />
        </div>
      </section>

      <div className="mt-16 flex flex-col items-center gap-3 rounded-lg bg-bg-subtle p-8 text-center">
        <p className="text-h3 font-serif font-semibold text-text">Ghé thăm chúng tôi</p>
        <Button asChild>
          <Link href="/booking">Đặt lịch ngay</Link>
        </Button>
      </div>
    </Container>
  );
}
