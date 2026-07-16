"use client";

import { useState } from "react";
import { Bell, BellOff, CalendarCheck, Tag, Settings } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { markNotificationRead } from "@/services/notification.service";
import type { NotificationItem } from "@/types/notification";
import { formatDateVN, formatTimeVN } from "@/utils/format";

const typeIcon = { APPOINTMENT: CalendarCheck, PROMOTION: Tag, SYSTEM: Settings };

export function NotificationsClient({ initialItems }: { initialItems: NotificationItem[] }) {
  const [items, setItems] = useState(initialItems);

  if (items.length === 0) {
    return <EmptyState icon={BellOff} title="Không có thông báo nào" />;
  }

  function handleOpen(item: NotificationItem) {
    if (item.isRead) return;
    setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
    markNotificationRead(item.id).catch(() => {
      // Đánh dấu đã đọc chỉ là tiện ích UI — bỏ qua lỗi mạng, không làm gián đoạn người dùng.
    });
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => {
        const Icon = typeIcon[item.type];
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => handleOpen(item)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors duration-fast",
                item.isRead ? "border-border bg-surface" : "border-primary/30 bg-accent/10",
              )}
            >
              <Icon className="mt-0.5 size-4.5 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-body-sm font-medium text-text">{item.title}</p>
                  {!item.isRead ? <Badge tone="primary">Mới</Badge> : null}
                </div>
                <p className="mt-0.5 text-caption text-text-muted">{item.description}</p>
                <p className="mt-1 text-caption text-text-muted">
                  {formatDateVN(new Date(item.createdAt))} · {formatTimeVN(new Date(item.createdAt))}
                </p>
              </div>
              {!item.isRead ? <Bell className="size-4 shrink-0 text-primary" aria-hidden="true" /> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
