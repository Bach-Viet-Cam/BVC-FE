import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Music2, Pencil } from "lucide-react";
import { Dialog, DialogClose, DialogDescription, DialogPopup, DialogTitle } from "@/shared/components/ui/dialog";
import { type InstrumentItem } from "@/features/platform/types/configTypes";
import { instrumentSchema, type InstrumentFormValues } from "@/features/platform/utils/validateInstrument";

interface InstrumentFormProps {
  instrument: InstrumentItem | null;
  onSubmit: (values: InstrumentFormValues) => Promise<boolean>;
  onClose: () => void;
}

function InstrumentForm({ instrument, onSubmit, onClose }: InstrumentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InstrumentFormValues>({
    resolver: zodResolver(instrumentSchema),
    defaultValues: {
      code: instrument?.code ?? "",
      name: instrument?.name ?? "",
      description: instrument?.description ?? "",
    },
  });

  const submit = async (values: InstrumentFormValues) => {
    if (await onSubmit(values)) onClose();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4.5 pt-1">
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-bold text-bvc-ink" htmlFor="instrument-code">
          Mã nhạc cụ (Slug) <span className="text-bvc-error">*</span>
        </label>
        <input
          id="instrument-code"
          placeholder="dan-bau, dan-tranh, sao-truc..."
          disabled={instrument !== null}
          {...register("code")}
          className="h-[40px] w-full rounded-[11px] border border-bvc-border-strong bg-white px-3.5 font-mono text-[13.5px] text-bvc-ink placeholder:font-sans placeholder:text-bvc-faint transition-colors focus:border-bvc-ink focus:outline-none disabled:cursor-not-allowed disabled:bg-bvc-surface disabled:text-bvc-muted"
        />
        {instrument ? (
          <p className="text-[12px] text-bvc-muted">Mã định danh kỹ thuật không thể thay đổi sau khi tạo.</p>
        ) : (
          <p className="text-[12px] text-bvc-muted">
            Chỉ gồm chữ cái viết thường và dấu gạch nối, ví dụ:{" "}
            <code className="font-mono text-bvc-ink">dan-nguyet</code>.
          </p>
        )}
        {errors.code && <p className="text-[12px] font-medium text-bvc-error">{errors.code.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-bold text-bvc-ink" htmlFor="instrument-name">
          Tên nhạc cụ hiển thị <span className="text-bvc-error">*</span>
        </label>
        <input
          id="instrument-name"
          placeholder="Đàn Bầu, Đàn Tranh, Sáo Trúc..."
          {...register("name")}
          className="h-[40px] w-full rounded-[11px] border border-bvc-border-strong bg-white px-3.5 text-[13.5px] text-bvc-ink placeholder:text-bvc-faint transition-colors focus:border-bvc-ink focus:outline-none"
        />
        {errors.name && <p className="text-[12px] font-medium text-bvc-error">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-bold text-bvc-ink" htmlFor="instrument-description">
          Mô tả ngắn
        </label>
        <input
          id="instrument-description"
          placeholder="Nhạc cụ dây gảy truyền thống Việt Nam..."
          {...register("description")}
          className="h-[40px] w-full rounded-[11px] border border-bvc-border-strong bg-white px-3.5 text-[13.5px] text-bvc-ink placeholder:text-bvc-faint transition-colors focus:border-bvc-ink focus:outline-none"
        />
        {errors.description && <p className="text-[12px] font-medium text-bvc-error">{errors.description.message}</p>}
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
          {isSubmitting ? "Đang lưu..." : "Lưu nhạc cụ"}
        </button>
      </div>
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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-[480px] rounded-[20px] border border-bvc-border bg-white p-6 shadow-none">
        <div className="flex items-center gap-3">
          <div className="flex size-[36px] items-center justify-center rounded-[10px] bg-bvc-surface text-bvc-ink">
            {instrument ? <Pencil size={18} /> : <Music2 size={18} />}
          </div>
          <div>
            <DialogTitle className="text-[17px] font-extrabold tracking-[-0.02em] text-bvc-ink">
              {instrument ? "Sửa thông tin nhạc cụ" : "Thêm nhạc cụ mới"}
            </DialogTitle>
            <DialogDescription className="text-[12.5px] text-bvc-muted">
              Nhạc cụ không xóa vĩnh viễn nhằm đảm bảo toàn vẹn dữ liệu bài tập và bài nộp.
            </DialogDescription>
          </div>
        </div>
        <DialogClose className="top-5 right-5 text-bvc-muted hover:text-bvc-ink" />
        <InstrumentForm instrument={instrument} onSubmit={onSubmit} onClose={() => onOpenChange(false)} />
      </DialogPopup>
    </Dialog>
  );
}
