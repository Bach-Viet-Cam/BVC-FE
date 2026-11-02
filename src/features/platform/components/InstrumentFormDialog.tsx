import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type InstrumentItem } from "@/features/platform/types/configTypes";
import { instrumentSchema, type InstrumentFormValues } from "@/features/platform/utils/validateInstrument";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { FormField } from "@/shared/components/bvc/FormField";
import { FormBody, FormFooter } from "@/shared/components/bvc/FormLayout";
import { INPUT_CLASSES } from "@/shared/components/bvc/fieldStyles";
import { useReportDirty } from "@/shared/hooks/useReportDirty";
import { cn } from "@/shared/utils/cn";

interface InstrumentFormProps {
  instrument: InstrumentItem | null;
  onSubmit: (values: InstrumentFormValues) => Promise<boolean>;
  onCancel: () => void;
  onSaved: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

function InstrumentForm({ instrument, onSubmit, onCancel, onSaved, onDirtyChange }: InstrumentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<InstrumentFormValues>({
    resolver: zodResolver(instrumentSchema),
    defaultValues: {
      code: instrument?.code ?? "",
      name: instrument?.name ?? "",
      description: instrument?.description ?? "",
    },
  });
  useReportDirty(isDirty, onDirtyChange);

  const submit = async (values: InstrumentFormValues) => {
    if (await onSubmit({ ...values, code: values.code.trim().toUpperCase() })) onSaved();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col">
      <FormBody>
        <FormField
          label="Mã nhạc cụ (mã viết tắt)"
          htmlFor="instrument-code"
          required
          hint={
            instrument
              ? "Mã định danh kỹ thuật không thể thay đổi sau khi tạo."
              : "Mã viết tắt ngắn gọn dạng chữ in hoa, ví dụ: DTR, DBA, DNH, DSA."
          }
          error={errors.code?.message}
        >
          <input
            id="instrument-code"
            placeholder="DTR, DBA, DNH, DSA..."
            disabled={instrument !== null}
            aria-invalid={Boolean(errors.code)}
            className={cn(INPUT_CLASSES, "font-bvc-mono")}
            {...register("code")}
          />
        </FormField>

        <FormField label="Tên nhạc cụ hiển thị" htmlFor="instrument-name" required error={errors.name?.message}>
          <input
            id="instrument-name"
            placeholder="Đàn bầu, Đàn tranh, Sáo trúc..."
            aria-invalid={Boolean(errors.name)}
            className={INPUT_CLASSES}
            {...register("name")}
          />
        </FormField>

        <FormField label="Mô tả ngắn" htmlFor="instrument-description" error={errors.description?.message}>
          <input
            id="instrument-description"
            placeholder="Nhạc cụ dây gảy truyền thống Việt Nam..."
            aria-invalid={Boolean(errors.description)}
            className={INPUT_CLASSES}
            {...register("description")}
          />
        </FormField>
      </FormBody>

      <FormFooter>
        <ActionButton variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </ActionButton>
        <ActionButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang lưu..." : "Lưu nhạc cụ"}
        </ActionButton>
      </FormFooter>
    </form>
  );
}

interface InstrumentFormDialogProps {
  isOpen: boolean;
  instrument: InstrumentItem | null;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: InstrumentFormValues) => Promise<boolean>;
}

export function InstrumentFormDialog({ isOpen, instrument, onOpenChange, onSubmit }: InstrumentFormDialogProps) {
  const [isDirty, setIsDirty] = useState(false);
  const close = () => {
    setIsDirty(false);
    onOpenChange(false);
  };

  return (
    <FormDialog
      open={isOpen}
      onClose={close}
      title={instrument ? "Sửa thông tin nhạc cụ" : "Thêm nhạc cụ"}
      description="Nhạc cụ không xóa vĩnh viễn để giữ toàn vẹn dữ liệu bài tập và bài nộp."
      isDirty={isDirty}
    >
      {(requestClose) => (
        <InstrumentForm
          instrument={instrument}
          onSubmit={onSubmit}
          onCancel={requestClose}
          onSaved={close}
          onDirtyChange={setIsDirty}
        />
      )}
    </FormDialog>
  );
}
