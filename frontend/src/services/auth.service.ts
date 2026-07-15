/**
 * Lớp data-access cho xác thực (OTP, magic-link, đăng nhập/đăng ký).
 *
 * Toàn bộ hàm ở đây hiện chỉ mô phỏng độ trễ mạng và trả về kết quả có kiểu rõ
 * ràng — KHÔNG có xác thực thật, không gọi SMS/Zalo thật, không tạo phiên đăng
 * nhập. Khi nối backend, chỉ cần thay phần thân từng hàm bằng lời gọi Route
 * Handler/API thật; chữ ký hàm (tham số + Promise<kết quả>) đã đúng hình dạng
 * cần thiết nên không phải sửa lại UI đang gọi các hàm này.
 */

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type SendOtpResult = { ok: true };

export async function sendOtp(phone: string): Promise<SendOtpResult> {
  void phone;
  await delay(700);
  return { ok: true };
}

export async function resendOtp(phone: string): Promise<SendOtpResult> {
  return sendOtp(phone);
}

export type VerifyOtpResult = { ok: true } | { ok: false; reason: "invalid" | "incomplete" };

/**
 * Chưa có backend để đối chiếu mã thật. Bất kỳ mã đủ 6 chữ số nào cũng được
 * coi là hợp lệ để có thể trình diễn trọn luồng giao diện — đây là giới hạn
 * đã biết của bản thiết kế UI-only, không phải cơ chế bảo mật.
 */
export async function verifyOtp(phone: string, code: string): Promise<VerifyOtpResult> {
  void phone;
  await delay(900);
  if (code.length < 6) return { ok: false, reason: "incomplete" };
  return { ok: true };
}

export type ExchangeMagicLinkResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "expired" | "used" };

/**
 * `hasFragmentToken` phải được đọc bởi trang gọi hàm này (chỉ trang mới nên
 * đọc `window.location.hash`), hàm này chỉ xử lý phần "trao đổi token".
 */
export async function exchangeMagicLinkToken(hasFragmentToken: boolean): Promise<ExchangeMagicLinkResult> {
  if (!hasFragmentToken) return { ok: false, reason: "invalid" };
  await delay(1000);
  return { ok: true };
}

export type AuthActionResult = { ok: true } | { ok: false; reason: "not_connected" };

/**
 * Luôn trả về "not_connected" một cách tường minh — tuyệt đối không tạo
 * phiên đăng nhập giả bằng localStorage hay bất kỳ cơ chế nào khác.
 */
export async function login(input: { phone: string; password: string }): Promise<AuthActionResult> {
  void input;
  await delay(800);
  return { ok: false, reason: "not_connected" };
}

export async function register(input: {
  name: string;
  phone: string;
  password: string;
}): Promise<AuthActionResult> {
  void input;
  await delay(800);
  return { ok: false, reason: "not_connected" };
}

export type RequestPasswordResetResult = { ok: true };

/**
 * Luôn trả về thành công bất kể số điện thoại có tồn tại hay không — đây là
 * hành vi bảo mật đúng đắn (tránh lộ thông tin tài khoản nào tồn tại), không
 * phải hạn chế của bản mô phỏng.
 */
export async function requestPasswordReset(phone: string): Promise<RequestPasswordResetResult> {
  void phone;
  await delay(800);
  return { ok: true };
}
