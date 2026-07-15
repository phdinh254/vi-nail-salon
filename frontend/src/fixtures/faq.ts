export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    id: "faq-dat-truoc",
    question: "Tôi cần đặt lịch trước bao lâu?",
    answer:
      "Bạn nên đặt lịch trước ít nhất 2 giờ để tiệm sắp xếp nhân viên phù hợp. Vào cuối tuần và ngày lễ nên đặt trước 1-2 ngày.",
  },
  {
    id: "faq-huy-lich",
    question: "Chính sách đổi hoặc hủy lịch như thế nào?",
    answer:
      "Bạn có thể đổi hoặc hủy lịch miễn phí trước giờ hẹn tối thiểu 2 giờ. Hủy trễ hơn hoặc không đến có thể ảnh hưởng đến việc đặt lịch những lần sau.",
  },
  {
    id: "faq-dat-coc",
    question: "Tôi có cần đặt cọc khi đặt lịch không?",
    answer:
      "Phần lớn dịch vụ không yêu cầu đặt cọc. Một số khung giờ cao điểm hoặc dịch vụ đặc biệt có thể yêu cầu đặt cọc, thông tin sẽ hiển thị rõ khi đặt lịch.",
  },
  {
    id: "faq-di-tre",
    question: "Nếu tôi đến trễ so với giờ hẹn thì sao?",
    answer:
      "Vui lòng liên hệ tiệm nếu đến trễ. Tiệm sẽ cố gắng sắp xếp, tuy nhiên nếu trễ quá 15 phút, lịch hẹn có thể cần dời sang khung giờ khác.",
  },
  {
    id: "faq-thanh-toan",
    question: "Tiệm nhận những hình thức thanh toán nào?",
    answer: "Tiệm nhận thanh toán tiền mặt, chuyển khoản và các ví điện tử phổ biến.",
  },
  {
    id: "faq-mot-chi-nhanh",
    question: "Tiệm có nhiều chi nhánh không?",
    answer: "Hiện tại Lys Nail Studio chỉ có một chi nhánh duy nhất tại địa chỉ được ghi ở trang Liên hệ.",
  },
];
