import { forwardRef } from "react";
import { Phone } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";

export const PhoneInput = forwardRef<HTMLInputElement, Omit<InputProps, "type" | "leadingIcon">>(
  (props, ref) => (
    <Input
      ref={ref}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder="09xx xxx xxx"
      leadingIcon={<Phone />}
      {...props}
    />
  ),
);
PhoneInput.displayName = "PhoneInput";
