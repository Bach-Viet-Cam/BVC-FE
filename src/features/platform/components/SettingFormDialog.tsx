import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sliders } from "lucide-react";
import { Dialog, DialogClose, DialogDescription, DialogPopup, DialogTitle } from "@/shared/components/ui/dialog";
import { CONFIG_GROUP_LABELS } from "@/features/platform/constants/configConstants";
import { type SystemConfigItem } from "@/features/platform/types/configTypes";
import { toFormValue } from "@/features/platform/utils/configValue";
import { settingSchema, type SettingFormValues } from "@/features/platform/utils/validateSetting";

interface SettingFormProps {
  config: SystemConfigItem;
  onSubmit: (config: SystemConfigItem, text: string) => Promise<string | null>;
  onClose: () => void;
}

function SettingForm({ config, onSubmit, onClose }: SettingFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingFormValues>({
    resolver: zodResolver(settingSchema),
    defaultValues: { value: toFormValue(config) },
  });

  const submit = async (values: SettingFormValues) => {
    const message = await onSubmit(config, values.value);
    if (message) {
      setServerError(message);
      return;
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4.5 pt-1">
      <div className="flex flex-col gap-2 rounded-[14px] border border-bvc-border bg-bvc-surface/50 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[12px] font-semibold text-bvc-ink">{config.key}</span>
          <span className="rounded-[7px] border border-bvc-border bg-white px-2 py-0.5 text-[11px] font-bold text-bvc-muted">
            {CONFIG_GROUP_LABELS[config.group]}
          </span>
        </div>
        <div>
          <p className="text-[13.5px] font-bold text-bvc-ink">{config.label}</p>
          {config.description && (
            <p className="mt-0.5 text-[12px] leading-relaxed text-bvc-muted">{config.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-bold text-bvc-ink" htmlFor="setting-value">
          Giá trị mới <span className="text-bvc-error">*</span>
        </label>
        {config.valueType === "BOOLEAN" ? (
          <select
            id="setting-value"
            className="h-[40px] w-full cursor-pointer rounded-[11px] border border-bvc-border-strong bg-white px-3.5 text-[13.5px] text-bvc-ink transition-colors focus:border-bvc-ink focus:outline-none"
            {...register("value")}
          >
            <option value="true">Bật (Hoạt động)</option>
            <option value="false">Tắt (Không kích hoạt)</option>
          </select>
        ) : (
          <input
            id="setting-value"
            inputMode={config.valueType === "NUMBER" ? "decimal" : "text"}
            {...register("value")}
            className="h-[40px] w-full rounded-[11px] border border-bvc-border-strong bg-white px-3.5 font-mono text-[13.5px] text-bvc-ink placeholder:font-sans placeholder:text-bvc-faint transition-colors focus:border-bvc-ink focus:outline-none"
          />
        )}
        {config.valueType === "JSON" && (
          <p className="text-[12px] text-bvc-muted">
            Nhập các giá trị cách nhau bằng dấu phẩy, ví dụ:{" "}
            <code className="font-mono text-bvc-ink">mp3, wav, m4a</code>.
          </p>
        )}
        {errors.value && <p className="text-[12px] font-medium text-bvc-error">{errors.value.message}</p>}
        {serverError && <p className="text-[12px] font-medium text-bvc-error">{serverError}</p>}
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
          {isSubmitting ? "Đang lưu..." : "Cập nhật tham số"}
        </button>
      </div>
    </form>
  );
}

interface SettingFormDialogProps {
  config: SystemConfigItem | null;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (config: SystemConfigItem, text: string) => Promise<string | null>;
}

export function SettingFormDialog({ config, onOpenChange, onSubmit }: SettingFormDialogProps) {
  return (
    <Dialog open={config !== null} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-[480px] rounded-[20px] border border-bvc-border bg-white p-6 shadow-none">
        <div className="flex items-center gap-3">
          <div className="flex size-[36px] items-center justify-center rounded-[10px] bg-bvc-surface text-bvc-ink">
            <Sliders size={18} />
          </div>
          <div>
            <DialogTitle className="text-[17px] font-extrabold tracking-[-0.02em] text-bvc-ink">
              Cập nhật tham số hệ thống
            </DialogTitle>
            <DialogDescription className="text-[12.5px] text-bvc-muted">
              Giá trị mới sẽ áp dụng cho tất cả nghiệp vụ phát sinh sau thời điểm lưu.
            </DialogDescription>
          </div>
        </div>
        <DialogClose className="top-5 right-5 text-bvc-muted hover:text-bvc-ink" />
        {config && (
          <SettingForm key={config.id} config={config} onSubmit={onSubmit} onClose={() => onOpenChange(false)} />
        )}
      </DialogPopup>
    </Dialog>
  );
}
