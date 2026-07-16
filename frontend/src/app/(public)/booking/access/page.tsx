"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LinkIcon, TimerOff, Ban, AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { exchangeGuestAccessToken } from "@/services/auth.service";

type ExchangeState = "verifying" | "success" | "expired" | "used" | "invalid";

// Trang này KHÔNG được log, hiển thị hay lưu token dưới bất kỳ hình thức nào.
// Token chỉ tồn tại trong URL fragment (#...) và không bao giờ được đọc vào state hiển thị.
function BookingAccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ExchangeState>("verifying");
  const demoOverride = searchParams.get("demoState") as ExchangeState | null;

  useEffect(() => {
    let cancelled = false;

    function run() {
      if (demoOverride) {
        const timer = setTimeout(() => setState(demoOverride), 1000);
        return () => clearTimeout(timer);
      }

      // Token chỉ tồn tại trong URL fragment (#...), không bao giờ đọc vào state hiển thị.
      const rawToken = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
      if (!rawToken) {
        setState("invalid");
        return;
      }

      exchangeGuestAccessToken(rawToken).then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setState(result.reason);
          return;
        }
        // Xóa fragment khỏi URL ngay khi trao đổi hoàn tất, trước khi chuyển hướng.
        window.history.replaceState(null, "", window.location.pathname);
        setState("success");
        setTimeout(() => {
          if (!cancelled) router.push("/guest-booking");
        }, 600);
      });
    }
    const cleanup = run();

    return () => {
      cancelled = true;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-14 text-center">
      {state === "verifying" ? (
        <>
          <Loader2 className="size-10 animate-spin text-primary" aria-hidden="true" />
          <p className="mt-4 text-body font-semibold text-text">Đang xác minh liên kết...</p>
          <p className="mt-1 text-body-sm text-text-muted">Vui lòng không đóng trang này.</p>
        </>
      ) : null}

      {state === "success" ? (
        <>
          <LinkIcon className="size-10 text-success" aria-hidden="true" />
          <p className="mt-4 text-body font-semibold text-text">Xác minh thành công</p>
          <p className="mt-1 text-body-sm text-text-muted">Đang chuyển đến trang quản lý lịch hẹn của bạn...</p>
        </>
      ) : null}

      {state === "expired" ? (
        <>
          <TimerOff className="size-10 text-error" aria-hidden="true" />
          <p className="mt-4 text-body font-semibold text-text">Liên kết đã hết hạn</p>
          <p className="mt-1 max-w-sm text-body-sm text-text-muted">
            Liên kết truy cập chỉ có hiệu lực trong thời gian giới hạn. Vui lòng yêu cầu gửi lại liên kết mới.
          </p>
          <Button asChild className="mt-5">
            <a href="/guest-booking">Yêu cầu gửi lại liên kết</a>
          </Button>
        </>
      ) : null}

      {state === "used" ? (
        <>
          <Ban className="size-10 text-error" aria-hidden="true" />
          <p className="mt-4 text-body font-semibold text-text">Liên kết đã được sử dụng</p>
          <p className="mt-1 max-w-sm text-body-sm text-text-muted">
            Liên kết này chỉ dùng được một lần. Vui lòng yêu cầu gửi lại liên kết mới nếu vẫn cần truy cập.
          </p>
          <Button asChild className="mt-5">
            <a href="/guest-booking">Yêu cầu gửi lại liên kết</a>
          </Button>
        </>
      ) : null}

      {state === "invalid" ? (
        <>
          <AlertCircle className="size-10 text-error" aria-hidden="true" />
          <p className="mt-4 text-body font-semibold text-text">Liên kết không hợp lệ</p>
          <p className="mt-1 max-w-sm text-body-sm text-text-muted">
            Liên kết bạn truy cập không đúng định dạng hoặc đã bị thay đổi. Vui lòng yêu cầu gửi lại liên kết mới.
          </p>
          <Button asChild className="mt-5">
            <a href="/guest-booking">Yêu cầu gửi lại liên kết</a>
          </Button>
        </>
      ) : null}
    </Container>
  );
}

export default function BookingAccessPage() {
  return (
    <Suspense>
      <BookingAccessContent />
    </Suspense>
  );
}
