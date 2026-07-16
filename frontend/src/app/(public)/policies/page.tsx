import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { Accordion } from "@/components/ui/accordion";
import { listFaq } from "@/services/catalog.service";

export const metadata: Metadata = { title: "Chính sách" };

const policySections = [
  {
    title: "Chính sách đặt lịch",
    content: [
      "Khách hàng có thể đặt lịch trực tuyến không cần tài khoản, xác minh bằng số điện thoại và mã OTP.",
      "Vui lòng đặt lịch trước tối thiểu 2 giờ để tiệm sắp xếp nhân viên phù hợp.",
    ],
  },
  {
    title: "Chính sách đổi và hủy lịch",
    content: [
      "Đổi hoặc hủy lịch miễn phí khi thực hiện trước giờ hẹn tối thiểu 2 giờ.",
      "Hủy trễ hoặc không đến nhiều lần có thể ảnh hưởng đến khả năng đặt lịch trong tương lai.",
    ],
  },
  {
    title: "Chính sách bảo mật thông tin",
    content: [
      "Thông tin liên hệ của khách hàng chỉ được sử dụng để xác nhận và chăm sóc lịch hẹn.",
      "Tiệm không chia sẻ thông tin khách hàng cho bên thứ ba khi chưa có sự đồng ý.",
    ],
  },
];

export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  const faqItems = await listFaq();

  return (
    <Container className="py-10 sm:py-14">
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Chính sách" }]} />
      <PageHeader className="mt-4" title="Chính sách của tiệm" />

      <div className="mt-8 flex flex-col gap-8">
        {policySections.map((section) => (
          <section key={section.title}>
            <h2 className="text-h3 font-serif font-semibold text-text">{section.title}</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {section.content.map((line) => (
                <li key={line} className="text-body-sm text-text-muted">
                  {line}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section id="faq" className="mt-14 scroll-mt-20">
        <h2 className="text-h2 font-serif font-semibold text-text">Câu hỏi thường gặp</h2>
        <div className="mt-6">
          <Accordion items={faqItems.map((item) => ({ id: item.id, title: item.question, content: item.answer }))} />
        </div>
      </section>
    </Container>
  );
}
