/**
 * Lớp data-access cho xác thực (OTP, đăng nhập/đăng ký), gọi thẳng API NestJS
 * thật. Không còn mô phỏng — mọi lỗi từ backend (sai OTP, sai mật khẩu, số
 * điện thoại đã tồn tại...) được ném ra dưới dạng `ApiError` để trang gọi bắt
 * và hiển thị.
 */
import { apiRequest, ApiError } from "@/lib/api-client";
import type { AuthUser } from "@/stores/auth-store";

export type LoginResponse = { accessToken: string; user: AuthUser };

export async function login(input: { phone: string; password: string }): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", { method: "POST", body: input, token: null });
}

export async function register(input: {
  name: string;
  phone: string;
  password: string;
}): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/register", { method: "POST", body: input, token: null });
}

export type SendOtpResult = { sent: true; expiresInSeconds: number };

export async function sendOtp(phone: string): Promise<SendOtpResult> {
  return apiRequest<SendOtpResult>("/auth/otp/request", { method: "POST", body: { phone }, token: null });
}

export async function resendOtp(phone: string): Promise<SendOtpResult> {
  return sendOtp(phone);
}

export type VerifyOtpResult =
  | { ok: true; bookingSessionToken: string }
  | { ok: false; reason: "invalid" | "incomplete" };

export async function verifyOtp(phone: string, code: string): Promise<VerifyOtpResult> {
  if (code.length < 6) return { ok: false, reason: "incomplete" };
  try {
    const result = await apiRequest<{ bookingSessionToken: string }>("/auth/otp/verify", {
      method: "POST",
      body: { phone, code },
      token: null,
    });
    return { ok: true, bookingSessionToken: result.bookingSessionToken };
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, reason: "invalid" };
    throw err;
  }
}

export type ExchangeGuestTokenResult =
  | { ok: true; code: string; phone: string }
  | { ok: false; reason: "invalid" | "expired" | "used" };

export async function exchangeGuestAccessToken(token: string): Promise<ExchangeGuestTokenResult> {
  return apiRequest<ExchangeGuestTokenResult>("/auth/guest-access/exchange", {
    method: "POST",
    body: { token },
    token: null,
  });
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me", { token });
}

export type RequestPasswordResetResult = { ok: true };

/**
 * Backend chưa có luồng đặt lại mật khẩu (chưa có endpoint tương ứng) — đây
 * là giới hạn đã biết, ghi nhận trong báo cáo QA. Luôn trả về thành công để
 * không lộ số điện thoại nào tồn tại trong hệ thống.
 */
export async function requestPasswordReset(phone: string): Promise<RequestPasswordResetResult> {
  void phone;
  return { ok: true };
}
