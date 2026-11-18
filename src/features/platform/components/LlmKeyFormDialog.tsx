import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  LLM_PROVIDER_LABELS,
  type LlmKeyCreateInput,
  type LlmKeyItem,
  type LlmKeyUpdateInput,
  type LlmProvider,
} from "@/features/platform/types/llmKeyTypes";
import { validateLlmKey, type LlmKeyFormValues } from "@/features/platform/utils/validateLlmKey";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { FormField } from "@/shared/components/bvc/FormField";
import { FormBody, FormFooter } from "@/shared/components/bvc/FormLayout";
import { INPUT_CLASSES } from "@/shared/components/bvc/fieldStyles";
import { Switch } from "@/shared/components/ui/switch";
import { useReportDirty } from "@/shared/hooks/useReportDirty";
import { cn } from "@/shared/utils/cn";

interface LlmKeyFormProps {
  target: LlmKeyItem | null;
  // Trả về null khi lưu xong, hoặc thông báo lỗi (vd. 409 trùng tên/key)
  onSubmit: (
    target: LlmKeyItem | null,
    body: { name: string; key: string; provider: LlmProvider; enabled: boolean }
  ) => Promise<string | null>;
  onCancel: () => void;
  onSaved: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

function LlmKeyForm({ target, onSubmit, onCancel, onSaved, onDirtyChange }: LlmKeyFormProps) {
  const mode = target ? "edit" : "create";
  const [enabled, setEnabled] = useState(target ? target.status === "active" : true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<LlmKeyFormValues & { provider: LlmProvider }>({
    // Ô key luôn rỗng khi mở form, kể cả khi sửa
    defaultValues: { name: target?.name ?? "", key: "", provider: target?.provider ?? "gemini" },
    resolver: (values) => {
      const fieldErrors = validateLlmKey(values, mode);
      return {
        values: Object.keys(fieldErrors).length ? {} : values,
        errors: Object.fromEntries(
          Object.entries(fieldErrors).map(([field, message]) => [field, { type: "validate", message }])
        ),
      };
    },
  });
  useReportDirty(isDirty || enabled !== (target ? target.status === "active" : true), onDirtyChange);

  const submit = async (values: LlmKeyFormValues & { provider: LlmProvider }) => {
    setSaveError(null);
    const message = await onSubmit(target, { name: values.name.trim(), key: values.key.trim(), provider: values.provider, enabled });
    // Xóa key khỏi state form dù thành công hay thất bại
    setValue("key", "");
    if (message) setSaveError(message);
    else onSaved();
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col">
      <FormBody>
        <FormField label="Tên" htmlFor="llm-key-name" required error={errors.name?.message}>
          <input
            id="llm-key-name"
            maxLength={100}
            placeholder="Ví dụ: Key Gemini dự phòng"
            aria-invalid={Boolean(errors.name)}
            className={INPUT_CLASSES}
            {...register("name")}
          />
        </FormField>
        <FormField
          label="Nhà cung cấp"
          htmlFor="llm-key-provider"
          required={!target}
          hint={target ? "Không thể đổi nhà cung cấp của key đã lưu" : "Key chỉ được dùng cho nhà cung cấp này"}
        >
          <select
            id="llm-key-provider"
            disabled={Boolean(target)}
            className={cn(INPUT_CLASSES, "cursor-pointer")}
            {...register("provider")}
          >
            {(Object.keys(LLM_PROVIDER_LABELS) as LlmProvider[]).map((provider) => (
              <option key={provider} value={provider}>
                {LLM_PROVIDER_LABELS[provider]}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label="Khóa API"
          htmlFor="llm-key-value"
          required={!target}
          hint="Chỉ nhập khi thêm mới hoặc thay key"
          error={errors.key?.message}
        >
          <input
            id="llm-key-value"
            type="password"
            autoComplete="off"
            data-lpignore="true"
            spellCheck={false}
            aria-invalid={Boolean(errors.key)}
            className={INPUT_CLASSES}
            {...register("key")}
          />
        </FormField>
        {target && (
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="llm-key-enabled" className="text-sm font-medium text-bvc-ink">
              Bật key này
            </label>
            <Switch id="llm-key-enabled" checked={enabled} onCheckedChange={setEnabled} />
          </div>
        )}
        {saveError && (
          <p role="alert" className="text-sm text-bvc-accent-text">
            {saveError}
          </p>
        )}
      </FormBody>
      <FormFooter>
        <ActionButton variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </ActionButton>
        <ActionButton type="submit" isLoading={isSubmitting}>
          Lưu API key
        </ActionButton>
      </FormFooter>
    </form>
  );
}

interface LlmKeyFormDialogProps {
  isOpen: boolean;
  target: LlmKeyItem | null;
  onOpenChange: (isOpen: boolean) => void;
  onCreate: (body: LlmKeyCreateInput) => Promise<string | null>;
  onUpdate: (id: string, body: LlmKeyUpdateInput) => Promise<string | null>;
}

export function LlmKeyFormDialog({ isOpen, target, onOpenChange, onCreate, onUpdate }: LlmKeyFormDialogProps) {
  const [isDirty, setIsDirty] = useState(false);
  const close = () => {
    setIsDirty(false);
    onOpenChange(false);
  };
  const submit: LlmKeyFormProps["onSubmit"] = (item, { name, key, provider, enabled }) => {
    if (!item) return onCreate({ name, key, provider });
    const body: LlmKeyUpdateInput = { name };
    // Chỉ gửi status khi người dùng đổi công tắc, để đổi tên không làm mất trạng thái "invalid".
    if (enabled !== (item.status === "active")) body.status = enabled ? "active" : "disabled";
    if (key) body.key = key; // để trống = giữ key cũ, không gửi trường key
    return onUpdate(item.id, body);
  };

  return (
    <FormDialog
      open={isOpen}
      onClose={close}
      title={target ? "Sửa API key" : "Thêm API key"}
      description="Key được lưu mã hóa và không bao giờ hiển thị lại sau khi lưu."
      isDirty={isDirty}
    >
      {(requestClose) => (
        <LlmKeyForm
          key={target ? target.id : "new"}
          target={target}
          onSubmit={submit}
          onCancel={requestClose}
          onSaved={close}
          onDirtyChange={setIsDirty}
        />
      )}
    </FormDialog>
  );
}
