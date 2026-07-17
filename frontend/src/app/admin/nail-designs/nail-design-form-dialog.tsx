"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { NAIL_DESIGN_STYLES, nailDesignStyleLabel, nailDesignColorLabel, type NailDesign, type NailDesignColor } from "@/types/nail-design";
import type { Service } from "@/types/service";

const colorOptions: NailDesignColor[] = ["NUDE", "RED", "PINK", "WHITE", "BLACK", "GOLD", "PASTEL"];

const nailDesignSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên mẫu nail."),
  style: z.enum(NAIL_DESIGN_STYLES),
  colors: z.array(z.enum(colorOptions as [NailDesignColor, ...NailDesignColor[]])).min(1, "Chọn ít nhất một màu."),
  serviceId: z.string(),
  description: z.string().trim().min(1, "Vui lòng nhập mô tả."),
  isNew: z.boolean(),
});

export type NailDesignFormValues = z.infer<typeof nailDesignSchema>;

const emptyValues: NailDesignFormValues = {
  name: "",
  style: "MINIMALIST",
  colors: [],
  serviceId: "",
  description: "",
  isNew: false,
};

export function NailDesignFormDialog({
  open,
  onClose,
  onSubmit,
  services,
  editing,
  isSubmitting,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NailDesignFormValues) => Promise<void>;
  services: Service[];
  editing: NailDesign | null;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<NailDesignFormValues>({
    resolver: zodResolver(nailDesignSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      editing
        ? {
            name: editing.name,
            style: editing.style,
            colors: editing.colors,
            serviceId: editing.serviceId,
            description: editing.description,
            isNew: editing.isNew,
          }
        : emptyValues,
    );
  }, [open, editing, reset]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Chỉnh sửa mẫu nail" : "Thêm mẫu nail mới"}
      description={editing?.name}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
        })}
      >
        <Field id="nd-name" label="Tên mẫu" required error={errors.name?.message}>
          <Input id="nd-name" invalid={Boolean(errors.name)} {...register("name")} />
        </Field>

        <Field id="nd-style" label="Phong cách" required error={errors.style?.message}>
          <Select id="nd-style" invalid={Boolean(errors.style)} {...register("style")}>
            {NAIL_DESIGN_STYLES.map((s) => (
              <option key={s} value={s}>
                {nailDesignStyleLabel[s]}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="nd-colors" label="Bảng màu" required error={errors.colors?.message}>
          <Controller
            control={control}
            name="colors"
            render={({ field }) => (
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {colorOptions.map((color) => (
                  <Checkbox
                    key={color}
                    id={`nd-color-${color}`}
                    label={nailDesignColorLabel[color]}
                    checked={field.value.includes(color)}
                    onChange={(e) => {
                      field.onChange(
                        e.target.checked
                          ? [...field.value, color]
                          : field.value.filter((c) => c !== color),
                      );
                    }}
                  />
                ))}
              </div>
            )}
          />
        </Field>

        <Field id="nd-service" label="Dịch vụ liên quan" hint="Không bắt buộc" error={errors.serviceId?.message}>
          <Select id="nd-service" {...register("serviceId")}>
            <option value="">Không liên kết dịch vụ</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="nd-description" label="Mô tả" required error={errors.description?.message}>
          <Textarea id="nd-description" invalid={Boolean(errors.description)} {...register("description")} />
        </Field>

        <Checkbox id="nd-isNew" label="Đánh dấu là mẫu mới" {...register("isNew")} />

        <Button type="submit" className="w-fit" isLoading={isSubmitting}>
          {editing ? "Lưu thay đổi" : "Thêm mẫu nail"}
        </Button>
      </form>
    </Dialog>
  );
}
