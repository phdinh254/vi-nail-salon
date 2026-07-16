import Link from "next/link";
import {
  CalendarCheck,
  ListChecks,
  MapPin,
  MousePointerClick,
  PartyPopper,
  Phone,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion } from "@/components/ui/accordion";
import { StarRating } from "@/components/ui/star-rating";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { Reveal } from "@/components/ui/reveal";
import { HeroVisual } from "@/components/sections/hero-visual";
import { ServiceCard } from "@/components/domain/service-card";
import { NailDesignCard } from "@/components/domain/nail-design-card";
import { StaffCard } from "@/components/domain/staff-card";
import {
  listFeaturedServices,
  listPromotions,
  listReviews,
  listFaq,
  listNailDesigns,
  listStaff,
} from "@/services/catalog.service";
import { siteConfig } from "@/config/site";

const bookingSteps = [
  { icon: ListChecks, title: "Chọn dịch vụ", description: "Xem bảng giá và chọn dịch vụ phù hợp với nhu cầu." },
  { icon: CalendarCheck, title: "Chọn ngày giờ", description: "Chọn khung giờ trống và nhân viên yêu thích." },
  { icon: MousePointerClick, title: "Xác nhận nhanh", description: "Nhập thông tin và xác minh OTP trong ít bước." },
  { icon: PartyPopper, title: "Tận hưởng dịch vụ", description: "Đến tiệm đúng giờ hẹn và tận hưởng trải nghiệm." },
];

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [featuredServices, promotions, reviews, faqItems, nailDesigns, staffMembers] = await Promise.all([
    listFeaturedServices(),
    listPromotions(),
    listReviews(),
    listFaq(),
    listNailDesigns(),
    listStaff(),
  ]);
  const featuredDesigns = nailDesigns.slice(0, 4);
  const featuredStaff = staffMembers.slice(0, 3);

  return (
    <>
      <section className="overflow-hidden bg-bg-subtle">
        <Container className="grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div>
            <Badge tone="primary">Tiệm nail một chi nhánh tại TP. Hồ Chí Minh</Badge>
            <h1 className="mt-5 text-display font-serif font-semibold text-text">
              Chăm sóc đôi tay,{" "}
              <span className="text-primary">tôn vinh vẻ đẹp</span> của bạn
            </h1>
            <p className="mt-5 max-w-lg text-body-lg text-text-muted">
              {siteConfig.brandName} mang đến trải nghiệm làm nail tinh tế, tay nghề chỉn chu và
              không gian thư giãn — đặt lịch trong vài bước, không cần chờ đợi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/booking">Đặt lịch ngay</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/services">Xem dịch vụ</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <StarRating rating={5} />
              <p className="text-body-sm text-text-muted">
                {reviews.length}+ đánh giá từ khách hàng đã trải nghiệm
              </p>
            </div>
          </div>
          <HeroVisual />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <Reveal className="flex flex-col items-center text-center">
            <h2 className="text-h1 font-serif font-semibold text-text">Dịch vụ nổi bật</h2>
            <p className="mt-3 max-w-lg text-body text-text-muted">
              Những dịch vụ được khách hàng lựa chọn nhiều nhất tại tiệm.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredServices.map((service, index) => (
              <Reveal key={service.id} delayMs={index * 80}>
                <ServiceCard service={service} />
              </Reveal>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/services">Xem toàn bộ dịch vụ</Link>
            </Button>
          </div>
        </Container>
      </section>

      <section className="bg-bg-subtle py-16 sm:py-20">
        <Container>
          <Reveal className="flex flex-col items-center text-center">
            <h2 className="text-h1 font-serif font-semibold text-text">Đặt lịch chỉ trong vài bước</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bookingSteps.map((step, index) => (
              <Reveal key={step.title} delayMs={index * 80} className="flex flex-col items-center gap-3 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-surface text-primary shadow-soft-sm">
                  <step.icon className="size-6" aria-hidden="true" />
                </span>
                <p className="text-body font-semibold text-text">{step.title}</p>
                <p className="text-body-sm text-text-muted">{step.description}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild>
              <Link href="/booking">Bắt đầu đặt lịch</Link>
            </Button>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <Reveal className="flex flex-col items-center text-center">
            <h2 className="text-h1 font-serif font-semibold text-text">Bộ sưu tập mẫu nail</h2>
            <p className="mt-3 max-w-lg text-body text-text-muted">
              Tham khảo những mẫu được yêu thích nhất và chọn mẫu bạn ưng ý ngay khi đặt lịch.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {featuredDesigns.map((design, index) => (
              <Reveal key={design.id} delayMs={index * 80}>
                <NailDesignCard design={design} />
              </Reveal>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/nail-gallery">Xem toàn bộ bộ sưu tập</Link>
            </Button>
          </div>
        </Container>
      </section>

      <section className="bg-bg-subtle py-16 sm:py-20">
        <Container>
          <Reveal className="flex flex-col items-center text-center">
            <h2 className="text-h1 font-serif font-semibold text-text">Đội ngũ của chúng tôi</h2>
            <p className="mt-3 max-w-lg text-body text-text-muted">
              Kỹ thuật viên giàu kinh nghiệm, tận tâm với từng chi tiết.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {featuredStaff.map((staff, index) => (
              <Reveal key={staff.id} delayMs={index * 80}>
                <StaffCard staff={staff} />
              </Reveal>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/staff">Xem toàn bộ đội ngũ</Link>
            </Button>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <Reveal className="flex flex-col items-center text-center">
            <h2 className="text-h1 font-serif font-semibold text-text">Ưu đãi đang áp dụng</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {promotions.map((promotion, index) => (
              <Reveal
                key={promotion.id}
                delayMs={index * 80}
                className="flex flex-col rounded-lg border border-border bg-surface p-6 shadow-soft-sm"
              >
                <Badge tone="warning" className="w-fit">
                  {promotion.discountLabel}
                </Badge>
                <h3 className="mt-3 text-h3 font-serif font-semibold text-text">{promotion.title}</h3>
                <p className="mt-2 flex-1 text-body-sm text-text-muted">{promotion.description}</p>
                <Link href="/promotions" className="mt-4 text-body-sm font-semibold text-primary hover:underline">
                  Xem điều kiện áp dụng
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-bg-subtle py-16 sm:py-20">
        <Container>
          <Reveal className="flex flex-col items-center text-center">
            <h2 className="text-h1 font-serif font-semibold text-text">Khách hàng nói gì</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {reviews.map((review, index) => (
              <Reveal
                key={review.id}
                delayMs={index * 80}
                className="flex flex-col rounded-lg border border-border bg-surface p-5 shadow-soft-sm"
              >
                <StarRating rating={review.rating} />
                <p className="mt-3 flex-1 text-body-sm text-text">“{review.content}”</p>
                <p className="mt-4 text-caption font-semibold text-text">{review.customerName}</p>
                <p className="text-caption text-text-muted">{review.serviceName}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-h1 font-serif font-semibold text-text">Ghé thăm tiệm</h2>
            <ul className="mt-6 flex flex-col gap-4 text-body text-text-muted">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                {siteConfig.address}
              </li>
              {siteConfig.openingHours.map((item) => (
                <li key={item.day} className="flex items-start gap-3">
                  <CalendarCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  {item.day}: {item.time}
                </li>
              ))}
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <a href={siteConfig.phoneHref} className="hover:text-primary">
                  {siteConfig.phone}
                </a>
              </li>
            </ul>
          </Reveal>
          <Reveal delayMs={100}>
            <PlaceholderImage label="Bản đồ vị trí tiệm — thay bằng bản đồ nhúng thật khi có địa chỉ chính thức" ratio="aspect-[4/3]" />
          </Reveal>
        </Container>
      </section>

      <section className="bg-bg-subtle py-16 sm:py-20">
        <Container className="max-w-3xl">
          <Reveal className="text-center">
            <h2 className="text-h1 font-serif font-semibold text-text">Câu hỏi thường gặp</h2>
          </Reveal>
          <Reveal delayMs={100} className="mt-10">
            <Accordion items={faqItems.map((item) => ({ id: item.id, title: item.question, content: item.answer }))} />
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="flex flex-col items-center gap-5 rounded-xl bg-primary px-6 py-14 text-center text-primary-foreground">
          <h2 className="text-h1 font-serif font-semibold">Sẵn sàng cho lịch hẹn tiếp theo?</h2>
          <p className="max-w-md text-body text-primary-foreground/90">
            Đặt lịch chỉ mất chưa đến 2 phút, không cần tạo tài khoản.
          </p>
          <Button asChild size="lg" variant="secondary" className="bg-surface text-primary hover:bg-bg-subtle">
            <Link href="/booking">Đặt lịch ngay</Link>
          </Button>
        </Container>
      </section>
    </>
  );
}
