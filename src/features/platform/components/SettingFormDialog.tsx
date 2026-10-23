import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Sliders, Trash2 } from "lucide-react";
import { Dialog, DialogClose, DialogDescription, DialogPopup, DialogTitle } from "@/shared/components/ui/dialog";
import { CONFIG_GROUP_LABELS } from "@/features/platform/constants/configConstants";
import { type SystemConfigItem } from "@/features/platform/types/configTypes";
import { DateInput } from "@/shared/components/ui/date-input";
import { parseSemesters, SEMESTERS_CONFIG_KEY, toFormValue, type SemesterValue } from "@/features/platform/utils/configValue";
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
            Nhập các giá trị cách nhau bằng dấu phẩy, ví dụ: <code className="font-mono text-bvc-ink">mp3, wav, m4a</code>.
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

const EMPTY_SEMESTER: SemesterValue = { name: "", startDate: "", endDate: "" };
const SEMESTER_NAME_MAX = 50;

function validateSemesters(rows: SemesterValue[]): string | null {
  if (rows.length === 0) return "Vui lòng thêm ít nhất một học kỳ";
  const seen = new Set<string>();
  for (const [index, row] of rows.entries()) {
    const position = `Học kỳ ${index + 1}`;
    const name = row.name.trim();
    if (!name) return `${position}: tên không được để trống`;
    if (name.length > SEMESTER_NAME_MAX) return `${position}: tên không được vượt quá ${SEMESTER_NAME_MAX} ký tự`;
    if (seen.has(name.toLowerCase())) return `${position}: tên "${name}" bị trùng`;
    seen.add(name.toLowerCase());
    if (!row.startDate || !row.endDate) return `${position}: vui lòng nhập ngày bắt đầu và kết thúc hợp lệ (dd/MM/yyyy)`;
    if (row.startDate > row.endDate) return `${position}: ngày bắt đầu phải trước hoặc bằng ngày kết thúc`;
  }
  return null;
}

function SemesterForm({ config, onSubmit, onClose }: SettingFormProps) {
  const [rows, setRows] = useState<SemesterValue[]>(() => {
    const current = parseSemesters(config.value);
    return current.length > 0 ? current : [{ ...EMPTY_SEMESTER }];
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateRow = (index: number, patch: Partial<SemesterValue>) =>
    setRows((previous) => previous.map((row, position) => (position === index ? { ...row, ...patch } : row)));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = validateSemesters(rows);
    if (message) {
      setError(message);
      return;
    }
    setIsSubmitting(true);
    const cleaned = rows.map((row) => ({ ...row, name: row.name.trim() }));
    const serverMessage = await onSubmit(config, JSON.stringify(cleaned));
    setIsSubmitting(false);
    if (serverMessage) {
      setError(serverMessage);
      return;
    }
    onClose();
  };

  const inputClass =
    "h-[40px] w-full rounded-[11px] border border-bvc-border-strong bg-white px-3 text-[13.5px] text-bvc-ink focus:border-bvc-ink focus:outline-none";

  return (
    <form onSubmit={submit} className="flex flex-col gap-4.5 pt-1">
      <div className="rounded-[14px] border border-bvc-border bg-bvc-surface/50 p-3.5">
        <p className="text-[13.5px] font-bold text-bvc-ink">{config.label}</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-bvc-muted">
          Mỗi dòng là một học kỳ. Tên không được trùng, ngày bắt đầu không sau ngày kết thúc.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="hidden grid-cols-[1.2fr_1fr_1fr_40px] gap-2 px-1 text-[12px] font-bold text-bvc-muted sm:grid">
          <span>Tên học kỳ</span>
          <span>Bắt đầu</span>
          <span>Kết thúc</span>
          <span />
        </div>
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-[1.2fr_1fr_1fr_40px]">
            <input
              aria-label={`Tên học kỳ ${index + 1}`}
              placeholder="VD: FA26"
              value={row.name}
              onChange={(event) => updateRow(index, { name: event.target.value })}
              className={inputClass}
            />
            <DateInput
              label={`Ngày bắt đầu học kỳ ${index + 1}`}
              value={row.startDate}
              onChange={(isoDate) => updateRow(index, { startDate: isoDate })}
              className={inputClass}
            />
            <DateInput
              label={`Ngày kết thúc học kỳ ${index + 1}`}
              value={row.endDate}
              onChange={(isoDate) => updateRow(index, { endDate: isoDate })}
              className={inputClass}
            />
            <button
              type="button"
              aria-label={`Xóa học kỳ ${index + 1}`}
              onClick={() => setRows((previous) => previous.filter((_, position) => position !== index))}
              className="flex h-[40px] cursor-pointer items-center justify-center rounded-[11px] border border-bvc-border-strong text-bvc-muted transition-colors hover:border-bvc-error hover:text-bvc-error"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setRows((previous) => [...previous, { ...EMPTY_SEMESTER }])}
          className="flex min-h-[40px] cursor-pointer items-center justify-center gap-1.5 rounded-[11px] border border-dashed border-bvc-border-strong text-[13px] font-semibold text-bvc-ink transition-colors hover:border-bvc-ink hover:bg-bvc-surface/40"
        >
          <Plus size={15} /> Thêm học kỳ
        </button>
        {error && <p className="text-[12px] font-medium text-bvc-error">{error}</p>}
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
      <DialogPopup className={`${config?.key === SEMESTERS_CONFIG_KEY ? "max-w-[640px]" : "max-w-[480px]"} rounded-[20px] border border-bvc-border bg-white p-6 shadow-none`}>
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
        {config &&
          (config.key === SEMESTERS_CONFIG_KEY ? (
            <SemesterForm key={config.id} config={config} onSubmit={onSubmit} onClose={() => onOpenChange(false)} />
          ) : (
            <SettingForm key={config.id} config={config} onSubmit={onSubmit} onClose={() => onOpenChange(false)} />
          ))}
      </DialogPopup>
    </Dialog>
  );
}
