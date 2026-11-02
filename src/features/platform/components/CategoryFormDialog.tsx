import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type CategoryFormTarget, type ContentCategoryNode } from "@/features/platform/types/categoryTypes";
import { categorySchema, type CategoryFormValues } from "@/features/platform/utils/validateCategory";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { FormField } from "@/shared/components/bvc/FormField";
import { FormBody, FormFooter } from "@/shared/components/bvc/FormLayout";
import { INPUT_CLASSES } from "@/shared/components/bvc/fieldStyles";
import { useReportDirty } from "@/shared/hooks/useReportDirty";
import { cn } from "@/shared/utils/cn";

interface CategoryFormProps {
  target: CategoryFormTarget | null;
  defaultParentId: string;
  parentOptions: ContentCategoryNode[];
  onSubmit: (values: CategoryFormValues) => Promise<boolean>;
  onCancel: () => void;
  onSaved: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

function CategoryForm({
  target,
  defaultParentId,
  parentOptions,
  onSubmit,
  onCancel,
  onSaved,
  onDirtyChange,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: target?.name ?? "", parentId: target ? (target.parentId ?? "") : defaultParentId },
  });
  useReportDirty(isDirty, onDirtyChange);

  const submit = async (values: CategoryFormValues) => {
    if (await onSubmit(values)) onSaved();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col">
      <FormBody>
        <FormField label="Tên danh mục" htmlFor="category-name" required error={errors.name?.message}>
          <input
            id="category-name"
            placeholder="Ví dụ: Dân ca Nam Bộ, Bài tập nâng cao..."
            aria-invalid={Boolean(errors.name)}
            className={INPUT_CLASSES}
            {...register("name")}
          />
        </FormField>

        <FormField
          label="Thuộc danh mục cha"
          htmlFor="category-parent"
          hint={
            target
              ? "Không thể chuyển cấp danh mục đã tạo; chỉ có thể chỉnh sửa tên."
              : "Hệ thống hỗ trợ cấu trúc phân cấp tối đa 2 cấp."
          }
        >
          <select
            id="category-parent"
            disabled={target !== null}
            className={cn(INPUT_CLASSES, "cursor-pointer disabled:cursor-not-allowed")}
            {...register("parentId")}
          >
            <option value="">Danh mục gốc (Cấp 1)</option>
            {parentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </FormField>
      </FormBody>

      <FormFooter>
        <ActionButton variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </ActionButton>
        <ActionButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang lưu..." : "Lưu danh mục"}
        </ActionButton>
      </FormFooter>
    </form>
  );
}

interface CategoryFormDialogProps {
  isOpen: boolean;
  target: CategoryFormTarget | null;
  defaultParentId: string;
  parentOptions: ContentCategoryNode[];
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: CategoryFormValues) => Promise<boolean>;
}

export function CategoryFormDialog({
  isOpen,
  target,
  defaultParentId,
  parentOptions,
  onOpenChange,
  onSubmit,
}: CategoryFormDialogProps) {
  const [isDirty, setIsDirty] = useState(false);
  const close = () => {
    setIsDirty(false);
    onOpenChange(false);
  };

  return (
    <FormDialog
      open={isOpen}
      onClose={close}
      title={target ? "Sửa danh mục" : "Thêm danh mục"}
      description="Tên danh mục không được trùng với các danh mục cùng cấp."
      isDirty={isDirty}
    >
      {(requestClose) => (
        <CategoryForm
          key={target ? target.id : `new-${defaultParentId}`}
          target={target}
          defaultParentId={defaultParentId}
          parentOptions={parentOptions}
          onSubmit={onSubmit}
          onCancel={requestClose}
          onSaved={close}
          onDirtyChange={setIsDirty}
        />
      )}
    </FormDialog>
  );
}
