"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { BookingStepLayout } from "@/features/booking/booking-step-layout";
import { useBooking } from "@/features/booking/booking-context";
import { staffMembers } from "@/fixtures/staff";
import { cn } from "@/utils/cn";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export default function StaffStepPage() {
  const router = useRouter();
  const { state, update, selectedServices } = useBooking();

  useEffect(() => {
    if (selectedServices.length === 0) router.replace("/booking/services");
  }, [selectedServices.length, router]);

  const eligibleStaff = useMemo(
    () =>
      staffMembers.filter((member) =>
        selectedServices.every((service) => member.serviceIds.includes(service.id)),
      ),
    [selectedServices],
  );

  if (selectedServices.length === 0) return null;

  return (
    <BookingStepLayout
      title="Chọn nhân viên"
      description="Chọn nhân viên yêu thích hoặc để tiệm sắp xếp người phù hợp nhất."
      onBack={() => router.push("/booking/services")}
      onContinue={() => router.push("/booking/schedule")}
      continueDisabled={!state.staffId}
    >
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          aria-pressed={state.staffId === "ANY"}
          onClick={() => update("staffId", "ANY")}
          className={cn(
            "flex items-center gap-4 rounded-lg border p-4 text-left transition-colors duration-fast",
            state.staffId === "ANY" ? "border-primary bg-accent/15" : "border-border bg-surface hover:bg-bg-subtle",
          )}
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-accent/40 text-primary">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-body font-medium text-text">Bất kỳ nhân viên nào</span>
            <span className="text-caption text-text-muted">Tiệm sẽ sắp xếp người phù hợp và trống lịch nhất</span>
          </span>
        </button>

        {eligibleStaff.map((member) => (
          <button
            key={member.id}
            type="button"
            aria-pressed={state.staffId === member.id}
            onClick={() => update("staffId", member.id)}
            className={cn(
              "flex items-center gap-4 rounded-lg border p-4 text-left transition-colors duration-fast",
              state.staffId === member.id ? "border-primary bg-accent/15" : "border-border bg-surface hover:bg-bg-subtle",
            )}
          >
            <Avatar initials={initialsOf(member.name)} />
            <span>
              <span className="block text-body font-medium text-text">{member.name}</span>
              <span className="text-caption text-text-muted">
                {member.role} · {member.yearsExperience} năm kinh nghiệm
              </span>
            </span>
          </button>
        ))}
      </div>
    </BookingStepLayout>
  );
}
