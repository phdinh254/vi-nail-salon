"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, WifiOff, ShieldAlert, TimerOff, Ban } from "lucide-react";
import { OtpInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";
import { BookingStepLayout } from "@/features/booking/booking-step-layout";
import { useBooking } from "@/features/booking/booking-context";
import { useCountdown } from "@/hooks/use-countdown";
import { resendOtp, sendOtp, verifyOtp } from "@/services/auth.service";
import { useAuth } from "@/stores/auth-store";
import { maskPhoneNumber } from "@/utils/format";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;
const MAX_ATTEMPTS = 5;

type DemoOverride = "invalid" | "expired" | "too-many-attempts" | "network-error" | null;

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, update, selectedServices } = useBooking();
  const { setBookingToken } = useAuth();

  const [sendState, setSendState] = useState<"sending" | "sent">("sending");
  const [otp, setOtp] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [verifyState, setVerifyState] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [incomplete, setIncomplete] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const { seconds, isActive, reset } = useCountdown(RESEND_SECONDS);
  const expiry = useCountdown(300);

  // Chỉ dùng để xem trước giao diện lỗi khi review thiết kế — không thuộc luồng thật.
  const demoOverride = searchParams.get("demoState") as DemoOverride;

  useEffect(() => {
    if (selectedServices.length === 0) router.replace("/booking/services");
    else if (!state.customerPhone) router.replace("/booking/customer-info");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đọc trạng thái mạng thật của trình duyệt khi mount
    setIsOnline(navigator.onLine);
    function goOnline() {
      setIsOnline(true);
    }
    function goOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    sendOtp(state.customerPhone).then(() => {
      if (!cancelled) setSendState("sent");
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (selectedServices.length === 0 || !state.customerPhone) return null;

  const expired = demoOverride === "expired" || expiry.seconds <= 0;
  const tooManyAttempts = demoOverride === "too-many-attempts" || attempts >= MAX_ATTEMPTS;

  function handleResend() {
    setOtp("");
    setAttempts(0);
    setVerifyState("idle");
    setIncomplete(false);
    setSendState("sending");
    resendOtp(state.customerPhone).then(() => setSendState("sent"));
    reset(RESEND_SECONDS);
    expiry.reset(300);
  }

  async function handleVerify() {
    if (!isOnline || demoOverride === "network-error") {
      setVerifyState("error");
      return;
    }
    if (otp.length < OTP_LENGTH) {
      setIncomplete(true);
      return;
    }
    setIncomplete(false);
    setAttempts((a) => a + 1);
    setVerifyState("verifying");

    if (demoOverride === "invalid") {
      // Chỉ để xem trước giao diện lỗi cho QA — không đi qua lớp service thật.
      await new Promise((resolve) => setTimeout(resolve, 900));
      setVerifyState("error");
      return;
    }

    const result = await verifyOtp(state.customerPhone, otp);
    if (!result.ok) {
      setIncomplete(result.reason === "incomplete");
      setVerifyState(result.reason === "incomplete" ? "idle" : "error");
      return;
    }
    setVerifyState("success");
    update("otpVerified", true);
    setBookingToken(result.bookingSessionToken);
    setTimeout(() => router.push("/booking/review"), 700);
  }

  return (
    <BookingStepLayout
      title="Xác minh số điện thoại"
      description={`Mã xác minh gồm ${OTP_LENGTH} chữ số đã được gửi tới ${maskPhoneNumber(state.customerPhone)}.`}
      onBack={() => router.push("/booking/customer-info")}
      hideSummary
    >
      <div className="mx-auto max-w-sm">
        {sendState === "sending" ? (
          <p className="text-body-sm text-text-muted">Đang gửi mã xác minh...</p>
        ) : null}

        {sendState === "sent" && !tooManyAttempts && !(!isOnline || demoOverride === "network-error") ? (
          <>
            {verifyState === "success" ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
                <p className="text-body font-semibold text-text">Xác minh thành công</p>
                <p className="text-body-sm text-text-muted">Đang chuyển đến bước kiểm tra thông tin...</p>
              </div>
            ) : (
              <>
                <OtpInput
                  length={OTP_LENGTH}
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
                    setIncomplete(false);
                    if (verifyState === "error") setVerifyState("idle");
                  }}
                  disabled={verifyState === "verifying"}
                  invalid={incomplete || (verifyState === "error" && demoOverride === "invalid")}
                />

                {incomplete ? (
                  <p role="alert" className="mt-2 text-caption text-error">
                    Vui lòng nhập đủ {OTP_LENGTH} chữ số.
                  </p>
                ) : null}
                {verifyState === "error" && demoOverride === "invalid" ? (
                  <p role="alert" className="mt-2 flex items-center gap-1.5 text-caption text-error">
                    <ShieldAlert className="size-3.5" aria-hidden="true" />
                    Mã xác minh không đúng. Vui lòng thử lại.
                  </p>
                ) : null}
                {expired ? (
                  <p role="alert" className="mt-2 flex items-center gap-1.5 text-caption text-error">
                    <TimerOff className="size-3.5" aria-hidden="true" />
                    Mã xác minh đã hết hạn. Vui lòng gửi lại mã mới.
                  </p>
                ) : null}

                <Button
                  className="mt-5 w-full"
                  onClick={handleVerify}
                  isLoading={verifyState === "verifying"}
                  disabled={expired}
                >
                  Xác minh
                </Button>

                <div className="mt-4 flex items-center justify-between text-body-sm">
                  <button
                    type="button"
                    onClick={() => router.push("/booking/customer-info")}
                    className="text-text-muted hover:text-primary"
                  >
                    Sửa số điện thoại
                  </button>
                  {isActive ? (
                    <span className="text-text-muted">Gửi lại mã sau {seconds}s</span>
                  ) : (
                    <button type="button" onClick={handleResend} className="font-medium text-primary hover:underline">
                      Gửi lại mã
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        ) : null}

        {tooManyAttempts ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-error/30 bg-error-bg p-6 text-center">
            <Ban className="size-10 text-error" aria-hidden="true" />
            <p className="text-body font-semibold text-text">Vượt quá số lần thử cho phép</p>
            <p className="text-body-sm text-text-muted">
              Vui lòng gửi lại mã mới hoặc liên hệ tiệm để được hỗ trợ.
            </p>
            <Button variant="secondary" onClick={handleResend}>
              Gửi lại mã mới
            </Button>
          </div>
        ) : null}

        {!isOnline || demoOverride === "network-error" ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-error/30 bg-error-bg p-6 text-center">
            <WifiOff className="size-10 text-error" aria-hidden="true" />
            <p className="text-body font-semibold text-text">Mất kết nối mạng</p>
            <p className="text-body-sm text-text-muted">Vui lòng kiểm tra kết nối và thử lại.</p>
            <Button variant="secondary" onClick={() => setIsOnline(navigator.onLine)}>
              Thử lại
            </Button>
          </div>
        ) : null}
      </div>
    </BookingStepLayout>
  );
}

export default function VerifyOtpStepPage() {
  return (
    <Suspense>
      <VerifyOtpContent />
    </Suspense>
  );
}
