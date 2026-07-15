import { Children, cloneElement, forwardRef, isValidElement } from "react";

type SlotProps = React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode };

export const Slot = forwardRef<HTMLElement, SlotProps>(({ children, ...props }, ref) => {
  const child = Children.only(children);
  if (!isValidElement(child)) return null;
  return cloneElement(
    child as React.ReactElement<Record<string, unknown>>,
    { ...props, ...(child.props as Record<string, unknown>), ref },
  );
});
Slot.displayName = "Slot";
