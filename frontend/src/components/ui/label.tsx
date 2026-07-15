import { cn } from "@/utils/cn";

export function Label({
  className,
  required,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn("text-label text-text", className)} {...props}>
      {props.children}
      {required ? (
        <span className="ml-0.5 text-error" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}
