import {
  CalendarClock,
  CheckCircle2,
  DoorOpen,
  Sparkles,
  BadgeCheck,
  UserX,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { appointmentStatusLabel, type AppointmentStatus } from "@/types/appointment";

const statusConfig: Record<
  AppointmentStatus,
  { tone: "neutral" | "primary" | "success" | "warning" | "error" | "info"; icon: typeof CalendarClock }
> = {
  PENDING_CONFIRMATION: { tone: "warning", icon: CalendarClock },
  CONFIRMED: { tone: "info", icon: BadgeCheck },
  CHECKED_IN: { tone: "primary", icon: DoorOpen },
  IN_SERVICE: { tone: "primary", icon: Sparkles },
  COMPLETED: { tone: "success", icon: CheckCircle2 },
  NO_SHOW: { tone: "error", icon: UserX },
  CANCELLED: { tone: "neutral", icon: XCircle },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { tone, icon: Icon } = statusConfig[status];
  return (
    <Badge tone={tone}>
      <Icon className="size-3.5" aria-hidden="true" />
      {appointmentStatusLabel[status]}
    </Badge>
  );
}
