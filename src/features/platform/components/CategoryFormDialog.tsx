import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderPlus, Pencil } from "lucide-react";
import { Dialog, DialogClose, DialogDescription, DialogPopup, DialogTitle } from "@/shared/components/ui/dialog";
import { type CategoryFormTarget, type ContentCategoryNode } from "@/features/platform/types/categoryTypes";
import { categorySchema, type CategoryFormValues } from "@/features/platform/utils/validateCategory";

interface CategoryFormProps {
  target: CategoryFormTarget | null;
  defaultParentId: string;
  parentOptions: ContentCategoryNode[];
  onSubmit: (values: CategoryFormValues) => Promise<boolean>;
  onClose: () => void;
}

function CategoryForm({ target, defaultParentId, parentOptions, onSubmit, onClose }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: target?.name ?? "", parentId: target ? (target.parentId ?? "") : defaultParentId },
  });

  const submit = async (values: CategoryFormValues) => {
    if (await onSubmit(values)) onClose();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4.5 pt-1">
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-bold text-bvc-ink" htmlFor="category-name">
          Tên danh mục <span className="text-bvc-error">*</span>
        </label>
        <input
          id="category-name"
          placeholder="Ví dụ: Dân ca Nam Bộ, Bài tập nâng cao..."
          {...register("name")}
          className="h-[40px] w-full rounded-[11px] border border-bvc-border-strong bg-white px-3.5 text-[13.5px] text-bvc-ink placeholder:text-bvc-faint transition-colors focus:border-bvc-ink focus:outline-none"
        />
        {errors.name && <p className="text-[12px] font-medium text-bvc-error">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-bold text-bvc-ink" htmlFor="category-parent">
          Thuộc danh mục cha
        </label>
        <div className="relative">
          <select
            id="category-parent"
            disabled={target !== null}
            {...register("parentId")}
            className="h-[40px] w-full cursor-pointer rounded-[11px] border border-bvc-border-strong bg-white px-3.5 text-[13.5px] text-bvc-ink transition-colors focus:border-bvc-ink focus:outline-none disabled:cursor-not-allowed disabled:bg-bvc-surface disabled:text-bvc-muted"
          >
            <option value=""> Danh mục gốc (Cấp 1) </option>
            {parentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        {target ? (
          <p className="text-[12px] text-bvc-muted">Không thể chuyển cấp danh mục đã tạo; chỉ có thể chỉnh sửa tên.</p>
        ) : (
          <p className="text-[12px] text-bvc-muted">Hệ thống hỗ trợ cấu trúc phân cấp tối đa 2 cấp.</p>
        )}
      </div>

      <div className="mt-2 flex items-center justify-end gap-2.5 border-t border-bvc-line pt-4">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[40px] cursor-pointer rounded-[12px] border border-bvc-border-strong bg-white px-4 text-[13.5px] font-semibold text-bvc-ink transition-colors hover:border-bvc-ink hover:bg-bvc-surface/40"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-[40px] cursor-pointer rounded-[12px] bg-bvc-ink px-5 text-[13.5px] font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Đang lưu..." : "Lưu danh mục"}
        </button>
      </div>
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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-[480px] rounded-[20px] border border-bvc-border bg-white p-6 shadow-none">
        <div className="flex items-center gap-3">
          <div className="flex size-[36px] items-center justify-center rounded-[10px] bg-bvc-surface text-bvc-ink">
            {target ? <Pencil size={18} /> : <FolderPlus size={18} />}
          </div>
          <div>
            <DialogTitle className="text-[17px] font-extrabold tracking-[-0.02em] text-bvc-ink">
              {target ? "Sửa danh mục" : "Thêm danh mục mới"}
            </DialogTitle>
            <DialogDescription className="text-[12.5px] text-bvc-muted">
              Tên danh mục không được trùng với các danh mục cùng cấp.
            </DialogDescription>
          </div>
        </div>
        <DialogClose className="top-5 right-5 text-bvc-muted hover:text-bvc-ink" />
        <CategoryForm
          key={target ? target.id : `new-${defaultParentId}-${isOpen}`}
          target={target}
          defaultParentId={defaultParentId}
          parentOptions={parentOptions}
          onSubmit={onSubmit}
          onClose={() => onOpenChange(false)}
        />
      </DialogPopup>
    </Dialog>
  );
}
