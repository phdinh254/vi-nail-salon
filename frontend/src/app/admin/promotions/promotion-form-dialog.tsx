"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { Promotion } from "@/types/promotion";

const promotionSchema = z
  .object({
    title: z.string().trim().min(1, "Vui lòng nhập tiêu đề."),
    description: z.string().trim().min(1, "Vui lòng nhập mô tả."),
    discountLabel: z.string().trim().min(1, "Vui lòng nhập nhãn ưu đãi (VD: Giảm 20%)."),
    validFrom: z.string().min(1, "Vui lòng chọn ngày bắt đầu."),
    validTo: z.string().min(1, "Vui lòng chọn ngày kết thúc."),
    conditions: z.string(),
    isActive: z.boolean(),
  })
  .refine((v) => new Date(v.validTo) >= new Date(v.validFrom), {
    message: "Ngày kết thúc phải sau ngày bắt đầu.",
    path: ["validTo"],
  });

type PromotionFormInput = z.infer<typeof promotionSchema>;
export type PromotionFormValues = Omit<PromotionFormInput, "conditions"> & { conditions: string[] };

const emptyValues: PromotionFormInput = {
  title: "",
  description: "",
  discountLabel: "",
  validFrom: "",
  validTo: "",
  conditions: "",
  isActive: true,
};

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export function PromotionFormDialog({
  open,
  onClose,
  onSubmit,
  editing,
  isSubmitting,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PromotionFormValues) => Promise<void>;
  editing: Promotion | null;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PromotionFormInput>({
    resolver: zodResolver(promotionSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      editing
        ? {
            title: editing.title,
            description: editing.description,
            discountLabel: editing.discountLabel,
            validFrom: toDateInputValue(editing.validFrom),
            validTo: toDateInputValue(editing.validTo),
            conditions: editing.conditions.join("\n"),
            isActive: editing.isActive,
          }
        : emptyValues,
    );
  }, [open, editing, reset]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Chỉnh sửa ưu đãi" : "Tạo ưu đãi mới"}
      description={editing?.title}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit({
            ...values,
            // Date inputs only give "YYYY-MM-DD" — Prisma's DateTime column needs a full
            // ISO-8601 datetime, not a bare date.
            validFrom: new Date(`${values.validFrom}T00:00:00`).toISOString(),
            validTo: new Date(`${values.validTo}T23:59:59`).toISOString(),
            conditions: values.conditions
              .split("\n")
              .map((c) => c.trim())
              .filter(Boolean),
          });
        })}
      >
        <Field id="promo-title" label="Tiêu đề" required error={errors.title?.message}>
          <Input id="promo-title" invalid={Boolean(errors.title)} {...register("title")} />
        </Field>

        <Field id="promo-discount" label="Nhãn ưu đãi" required error={errors.discountLabel?.message}>
          <Input id="promo-discount" placeholder="VD: Giảm 20%" invalid={Boolean(errors.discountLabel)} {...register("discountLabel")} />
        </Field>

        <Field id="promo-description" label="Mô tả" required error={errors.description?.message}>
          <Textarea id="promo-description" invalid={Boolean(errors.description)} {...register("description")} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field id="promo-from" label="Bắt đầu" required error={errors.validFrom?.message}>
            <Input id="promo-from" type="date" invalid={Boolean(errors.validFrom)} {...register("validFrom")} />
          </Field>
          <Field id="promo-to" label="Kết thúc" required error={errors.validTo?.message}>
            <Input id="promo-to" type="date" invalid={Boolean(errors.validTo)} {...register("validTo")} />
          </Field>
        </div>

        <Field id="promo-conditions" label="Điều kiện áp dụng" hint="Mỗi dòng là một điều kiện">
          <Textarea id="promo-conditions" rows={3} {...register("conditions")} />
        </Field>

        <Checkbox id="promo-isActive" label="Kích hoạt ưu đãi ngay" {...register("isActive")} />

        <Button type="submit" className="w-fit" isLoading={isSubmitting}>
          {editing ? "Lưu thay đổi" : "Tạo ưu đãi"}
        </Button>
      </form>
    </Dialog>
  );
}
