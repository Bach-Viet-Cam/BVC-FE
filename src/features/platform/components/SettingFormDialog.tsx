import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { CONFIG_GROUP_LABELS } from "@/features/platform/constants/configConstants";
import { type SystemConfigItem } from "@/features/platform/types/configTypes";
import { DateInput } from "@/shared/components/ui/date-input";
import {
  parseSemesters,
  SEMESTERS_CONFIG_KEY,
  toFormValue,
  type SemesterValue,
} from "@/features/platform/utils/configValue";
import { settingSchema, type SettingFormValues } from "@/features/platform/utils/validateSetting";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { FormField } from "@/shared/components/bvc/FormField";
import { FormBody, FormFooter } from "@/shared/components/bvc/FormLayout";
import { INPUT_CLASSES } from "@/shared/components/bvc/fieldStyles";
import { useReportDirty } from "@/shared/hooks/useReportDirty";
import { cn } from "@/shared/utils/cn";

interface SettingFormProps {
  config: SystemConfigItem;
  onSubmit: (config: SystemConfigItem, text: string) => Promise<string | null>;
  onCancel: () => void;
  onSaved: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

interface FormFooterActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

function SettingFooter({ isSubmitting, onCancel }: FormFooterActionsProps) {
  return (
    <FormFooter>
      <ActionButton variant="secondary" onClick={onCancel} disabled={isSubmitting}>
        Hủy
      </ActionButton>
      <ActionButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang lưu..." : "Cập nhật tham số"}
      </ActionButton>
    </FormFooter>
  );
}

function SettingForm({ config, onSubmit, onCancel, onSaved, onDirtyChange }: SettingFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingFormValues>({
    resolver: zodResolver(settingSchema),
    defaultValues: { value: toFormValue(config) },
  });
  useReportDirty(isDirty, onDirtyChange);

  const submit = async (values: SettingFormValues) => {
    const message = await onSubmit(config, values.value);
    if (message) {
      setServerError(message);
      return;
    }
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col">
      <FormBody>
        <div className="flex flex-col gap-2 rounded-[13px] bg-bvc-surface p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bvc-mono text-[12px] font-medium text-bvc-ink">{config.key}</span>
            <span className="rounded-full border border-bvc-border bg-white px-2 py-0.5 text-[11px] font-medium text-bvc-muted">
              {CONFIG_GROUP_LABELS[config.group]}
            </span>
          </div>
          <p className="text-[13.5px] font-medium text-bvc-ink">{config.label}</p>
          {config.description && <p className="text-[12px] leading-relaxed text-bvc-muted">{config.description}</p>}
        </div>

        <FormField
          label="Giá trị mới"
          htmlFor="setting-value"
          required
          hint={
            config.valueType === "JSON" ? "Nhập các giá trị cách nhau bằng dấu phẩy, ví dụ: mp3, wav, m4a." : undefined
          }
          error={errors.value?.message ?? serverError ?? undefined}
        >
          {config.valueType === "BOOLEAN" ? (
            <select id="setting-value" className={cn(INPUT_CLASSES, "cursor-pointer")} {...register("value")}>
              <option value="true">Bật (Hoạt động)</option>
              <option value="false">Tắt (Không kích hoạt)</option>
            </select>
          ) : (
            <input
              id="setting-value"
              inputMode={config.valueType === "NUMBER" ? "decimal" : "text"}
              aria-invalid={Boolean(errors.value)}
              className={cn(INPUT_CLASSES, "font-bvc-mono")}
              {...register("value")}
            />
          )}
        </FormField>
      </FormBody>
      <SettingFooter isSubmitting={isSubmitting} onCancel={onCancel} />
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
    if (!row.startDate || !row.endDate)
      return `${position}: vui lòng nhập ngày bắt đầu và kết thúc hợp lệ (dd/MM/yyyy)`;
    if (row.startDate > row.endDate) return `${position}: ngày bắt đầu phải trước hoặc bằng ngày kết thúc`;
  }
  return null;
}

function initialSemesters(config: SystemConfigItem): SemesterValue[] {
  const current = parseSemesters(config.value);
  return current.length > 0 ? current : [{ ...EMPTY_SEMESTER }];
}

function SemesterForm({ config, onSubmit, onCancel, onSaved, onDirtyChange }: SettingFormProps) {
  const [initialRows] = useState(() => initialSemesters(config));
  const [rows, setRows] = useState<SemesterValue[]>(initialRows);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useReportDirty(JSON.stringify(rows) !== JSON.stringify(initialRows), onDirtyChange);

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
    onSaved();
  };

  return (
    <form onSubmit={submit} className="flex flex-col">
      <FormBody>
        <div className="rounded-[13px] bg-bvc-surface p-3.5">
          <p className="text-[13.5px] font-medium text-bvc-ink">{config.label}</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-bvc-muted">
            Mỗi dòng là một học kỳ. Tên không được trùng, ngày bắt đầu không sau ngày kết thúc.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="hidden grid-cols-[1.2fr_1fr_1fr_46px] gap-2 px-1 text-[12px] font-medium text-bvc-muted sm:grid">
            <span>Tên học kỳ</span>
            <span>Bắt đầu</span>
            <span>Kết thúc</span>
            <span />
          </div>
          {rows.map((row, index) => (
            <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-[1.2fr_1fr_1fr_46px]">
              <input
                aria-label={`Tên học kỳ ${index + 1}`}
                placeholder="VD: FA26"
                value={row.name}
                onChange={(event) => updateRow(index, { name: event.target.value })}
                className={INPUT_CLASSES}
              />
              <DateInput
                label={`Ngày bắt đầu học kỳ ${index + 1}`}
                value={row.startDate}
                onChange={(isoDate) => updateRow(index, { startDate: isoDate })}
                className={INPUT_CLASSES}
              />
              <DateInput
                label={`Ngày kết thúc học kỳ ${index + 1}`}
                value={row.endDate}
                onChange={(isoDate) => updateRow(index, { endDate: isoDate })}
                className={INPUT_CLASSES}
              />
              <button
                type="button"
                aria-label={`Xóa học kỳ ${index + 1}`}
                onClick={() => setRows((previous) => previous.filter((_, position) => position !== index))}
                className="flex h-[46px] cursor-pointer items-center justify-center rounded-full border border-bvc-border-strong text-bvc-muted transition-colors hover:border-bvc-error hover:text-bvc-error"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <ActionButton variant="dashed" onClick={() => setRows((previous) => [...previous, { ...EMPTY_SEMESTER }])}>
            <Plus size={15} /> Thêm học kỳ
          </ActionButton>
          {error && (
            <p role="alert" className="text-[12.5px] font-medium text-bvc-error">
              {error}
            </p>
          )}
        </div>
      </FormBody>
      <SettingFooter isSubmitting={isSubmitting} onCancel={onCancel} />
    </form>
  );
}

interface SettingFormDialogProps {
  config: SystemConfigItem | null;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (config: SystemConfigItem, text: string) => Promise<string | null>;
}

export function SettingFormDialog({ config, onOpenChange, onSubmit }: SettingFormDialogProps) {
  const [isDirty, setIsDirty] = useState(false);
  const isSemesters = config?.key === SEMESTERS_CONFIG_KEY;
  const close = () => {
    setIsDirty(false);
    onOpenChange(false);
  };

  return (
    <FormDialog
      open={config !== null}
      onClose={close}
      title="Cập nhật tham số hệ thống"
      description="Giá trị mới áp dụng cho mọi nghiệp vụ phát sinh sau thời điểm lưu."
      size={isSemesters ? "lg" : "md"}
      isDirty={isDirty}
    >
      {(requestClose) => {
        if (!config) return null;
        const formProps = { config, onSubmit, onCancel: requestClose, onSaved: close, onDirtyChange: setIsDirty };
        return isSemesters ? (
          <SemesterForm key={config.id} {...formProps} />
        ) : (
          <SettingForm key={config.id} {...formProps} />
        );
      }}
    </FormDialog>
  );
}
