import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CATALOG_CATEGORY_TYPE_LABELS,
  type CatalogCategoryItem,
  type CatalogCategoryType,
} from "@/features/platform/types/catalogCategoryTypes";
import {
  catalogCategorySchema,
  type CatalogCategoryFormValues,
} from "@/features/platform/utils/validateCatalogCategory";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { FormField } from "@/shared/components/bvc/FormField";
import { FormBody, FormFooter } from "@/shared/components/bvc/FormLayout";
import { INPUT_CLASSES } from "@/shared/components/bvc/fieldStyles";
import { useReportDirty } from "@/shared/hooks/useReportDirty";

interface CatalogCategoryFormProps {
  category: CatalogCategoryItem | null;
  onSubmit: (values: CatalogCategoryFormValues) => Promise<boolean>;
  onCancel: () => void;
  onSaved: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

function CatalogCategoryForm({ category, onSubmit, onCancel, onSaved, onDirtyChange }: CatalogCategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CatalogCategoryFormValues>({
    resolver: zodResolver(catalogCategorySchema),
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
      displayOrder: category?.displayOrder ?? 0,
    },
  });
  useReportDirty(isDirty, onDirtyChange);

  const submit = async (values: CatalogCategoryFormValues) => {
    if (await onSubmit(values)) onSaved();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col">
      <FormBody>
        <FormField label="Tên danh mục" htmlFor="catalog-category-name" required error={errors.name?.message}>
          <input
            id="catalog-category-name"
            aria-invalid={Boolean(errors.name)}
            className={INPUT_CLASSES}
            {...register("name")}
          />
        </FormField>

        <FormField label="Mô tả" htmlFor="catalog-category-description" error={errors.description?.message}>
          <input
            id="catalog-category-description"
            aria-invalid={Boolean(errors.description)}
            className={INPUT_CLASSES}
            {...register("description")}
          />
        </FormField>

        <FormField
          label="Thứ tự hiển thị"
          htmlFor="catalog-category-order"
          hint="Số nhỏ hiển thị trước trong bộ lọc thư viện và form bài hát."
          error={errors.displayOrder?.message}
        >
          <input
            id="catalog-category-order"
            type="number"
            min={0}
            max={9999}
            aria-invalid={Boolean(errors.displayOrder)}
            className={INPUT_CLASSES}
            {...register("displayOrder", { valueAsNumber: true })}
          />
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

interface CatalogCategoryFormDialogProps {
  isOpen: boolean;
  type: CatalogCategoryType;
  category: CatalogCategoryItem | null;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: CatalogCategoryFormValues) => Promise<boolean>;
}

export function CatalogCategoryFormDialog({
  isOpen,
  type,
  category,
  onOpenChange,
  onSubmit,
}: CatalogCategoryFormDialogProps) {
  const [isDirty, setIsDirty] = useState(false);
  const typeLabel = CATALOG_CATEGORY_TYPE_LABELS[type].toLowerCase();
  const close = () => {
    setIsDirty(false);
    onOpenChange(false);
  };

  return (
    <FormDialog
      open={isOpen}
      onClose={close}
      title={category ? `Sửa ${typeLabel}` : `Thêm ${typeLabel}`}
      description={`Tên không được trùng với ${typeLabel} khác.`}
      isDirty={isDirty}
    >
      {(requestClose) => (
        <CatalogCategoryForm
          key={category ? category.id : `new-${type}`}
          category={category}
          onSubmit={onSubmit}
          onCancel={requestClose}
          onSaved={close}
          onDirtyChange={setIsDirty}
        />
      )}
    </FormDialog>
  );
}
