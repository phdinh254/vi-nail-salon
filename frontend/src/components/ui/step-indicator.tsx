import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

export function StepIndicator({
  steps,
  currentIndex,
}: {
  steps: string[];
  currentIndex: number;
}) {
  return (
    <nav aria-label="Tiến trình đặt lịch">
      <ol className="flex items-center gap-1 sm:gap-2">
        {steps.map((step, index) => {
          const state = index < currentIndex ? "done" : index === currentIndex ? "active" : "todo";
          return (
            <li key={step} className="flex flex-1 items-center gap-1 sm:gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-caption font-semibold sm:size-8",
                    state === "done" && "bg-primary text-primary-foreground",
                    state === "active" && "border-2 border-primary text-primary",
                    state === "todo" && "border border-border text-text-muted",
                  )}
                  aria-current={state === "active" ? "step" : undefined}
                >
                  {state === "done" ? <Check className="size-4" aria-hidden="true" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-caption font-medium sm:inline",
                    state === "todo" ? "text-text-muted" : "text-text",
                  )}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <span
                  className={cn("h-px flex-1", state === "done" ? "bg-primary" : "bg-border")}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
