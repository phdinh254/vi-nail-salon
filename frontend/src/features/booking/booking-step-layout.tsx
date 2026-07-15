import { Button } from "@/components/ui/button";
import { BookingSummary } from "@/features/booking/booking-summary";

export function BookingStepLayout({
  title,
  description,
  children,
  onBack,
  onContinue,
  continueLabel = "Tiếp tục",
  continueDisabled,
  hideSummary,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  hideSummary?: boolean;
}) {
  return (
    <div className="grid min-w-0 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        <h1 className="text-h2 font-serif font-semibold text-text">{title}</h1>
        {description ? <p className="mt-1.5 text-body-sm text-text-muted">{description}</p> : null}
        <div className="mt-6">{children}</div>

        <div className="mt-8 flex items-center justify-between gap-3">
          {onBack ? (
            <Button variant="secondary" onClick={onBack} type="button">
              Quay lại
            </Button>
          ) : (
            <span />
          )}
          {onContinue ? (
            <Button onClick={onContinue} disabled={continueDisabled} type="button">
              {continueLabel}
            </Button>
          ) : null}
        </div>
      </div>
      {!hideSummary ? (
        <div className="lg:sticky lg:top-24 lg:self-start">
          <BookingSummary />
        </div>
      ) : null}
    </div>
  );
}
