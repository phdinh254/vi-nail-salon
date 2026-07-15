"use client";

import { useEffect, useRef, useState } from "react";

export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const isCounting = seconds > 0;

  useEffect(() => {
    if (!isCounting) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // Chỉ tạo lại interval khi chuyển trạng thái đang đếm/dừng, không phải mỗi giây.
  }, [isCounting]);

  function reset(next: number) {
    setSeconds(next);
  }

  return { seconds, isActive: seconds > 0, reset };
}
