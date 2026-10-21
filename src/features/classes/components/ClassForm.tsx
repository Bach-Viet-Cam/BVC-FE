import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButton } from "@/features/classes/components/ActionButton";
import { FooterActions } from "@/features/classes/components/FooterActions";
import { FormField, INPUT_CLASSES } from "@/features/classes/components/FormField";
import {
  type ApiFieldError,
  type ClassDetail,
  type ClassPayload,
  type Instrument,
} from "@/features/classes/types/classTypes";
import {
  CLASS_STATUS_LABELS,
  calculateEndDate,
  formatIsoDate,
  maskDateInput,
  parseVietnameseDate,
} from "@/features/classes/utils/classFormat";
import { applyFieldErrors } from "@/features/classes/utils/mapApiErrors";
import { buildClassFormSchema, type ClassFormValues } from "@/features/classes/utils/validateClassForm";
import { cn } from "@/shared/utils/cn";

const FORM_FIELDS = ["name", "cohort", "instrumentId", "description", "startDate"] as const;

interface ClassFormProps {
  classDetail: ClassDetail | null;
  instruments: Instrument[];
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (payload: Partial<ClassPayload>) => Promise<ApiFieldError[] | null>;
}

function toFormValues(classDetail: ClassDetail | null): ClassFormValues {
  return {
    name: classDetail?.name ?? "",
    cohort: classDetail?.cohort ?? "",
    instrumentId: classDetail?.instrument.id ?? "",
    description: classDetail?.description ?? "",
    startDate: classDetail ? formatIsoDate(classDetail.startDate) : "",
  };
}

export function ClassForm({ classDetail, instruments, isSaving, onCancel, onSubmit }: ClassFormProps) {
  const isCreate = classDetail === null;
  // GBR-36: instrument and start date are locked once the class has started.
  const isLocked = classDetail?.hasStarted ?? false;
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(buildClassFormSchema(isCreate)),
    defaultValues: toFormValues(classDetail),
  });
  const endDate = formatIsoDate(calculateEndDate(parseVietnameseDate(useWatch({ control, name: "startDate" })) ?? ""));
  const startDateField = register("startDate");
  const instrumentOptions =
    classDetail && !instruments.some((item) => item.id === classDetail.instrument.id)
      ? [...instruments, { ...classDetail.instrument, isActive: false }]
      : instruments;

  const submit = handleSubmit(async (values) => {
    const payload: Partial<ClassPayload> = {
      name: values.name,
      cohort: values.cohort,
      description: values.description || null,
      ...(isLocked
        ? {}
        : { instrumentId: values.instrumentId, startDate: parseVietnameseDate(values.startDate) ?? "" }),
    };
    const fieldErrors = await onSubmit(payload);
    if (fieldErrors) applyFieldErrors<ClassFormValues>(fieldErrors, FORM_FIELDS, setError);
  });

  return (
    <form onSubmit={submit} noValidate className="flex grow flex-col">
      <div className="flex grow flex-col gap-[16px] px-[18px] pb-[18px] pt-[6px] md:grid md:grid-cols-2 md:content-start md:gap-x-[18px]">
        <h2 className="m-0 text-[16px] font-extrabold md:col-span-2">Thông tin lớp</h2>
        <div className="md:col-span-2">
          <FormField
            id="class-name"
            label="Tên lớp"
            isRequired
            hint="1–100 ký tự · không trùng tên trong cùng khóa"
            error={errors.name?.message}
          >
            <input
              id="class-name"
              {...register("name")}
              maxLength={100}
              aria-invalid={Boolean(errors.name)}
              className={INPUT_CLASSES}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-[12px] md:col-span-2">
          <FormField id="class-cohort" label="Khóa" isRequired hint="Tối đa 50 ký tự" error={errors.cohort?.message}>
            <input
              id="class-cohort"
              {...register("cohort")}
              maxLength={50}
              placeholder="FA26"
              aria-invalid={Boolean(errors.cohort)}
              className={INPUT_CLASSES}
            />
          </FormField>
          <FormField
            id="class-instrument"
            label="Nhạc cụ"
            isRequired
            hint="Khóa sau khi lớp bắt đầu"
            error={errors.instrumentId?.message}
          >
            {isLocked ? (
              // Not registered: the locked value stays in defaultValues and is never sent.
              <input
                id="class-instrument"
                value={classDetail?.instrument.name ?? ""}
                readOnly
                className={INPUT_CLASSES}
              />
            ) : (
              <select
                id="class-instrument"
                {...register("instrumentId")}
                aria-invalid={Boolean(errors.instrumentId)}
                className={INPUT_CLASSES}
              >
                <option value="">Chọn nhạc cụ</option>
                {instrumentOptions.map((instrument) => (
                  <option key={instrument.id} value={instrument.id}>
                    {instrument.name}
                  </option>
                ))}
              </select>
            )}
          </FormField>
        </div>
        <FormField id="class-status" label="Trạng thái" hint="Chỉ đọc: Hoạt động / Đã kết thúc">
          <input
            id="class-status"
            value={CLASS_STATUS_LABELS[classDetail?.status ?? "ACTIVE"]}
            readOnly
            className={INPUT_CLASSES}
          />
        </FormField>
        <div className="md:col-span-2">
          <FormField id="class-description" label="Mô tả" hint="Tối đa 500 ký tự" error={errors.description?.message}>
            <textarea
              id="class-description"
              {...register("description")}
              rows={3}
              maxLength={500}
              aria-invalid={Boolean(errors.description)}
              className={cn(INPUT_CLASSES, "h-auto resize-none py-[11px] leading-[1.5]")}
            />
          </FormField>
        </div>
        <h2 className="m-0 mt-[8px] text-[16px] font-extrabold md:col-span-2">Thời gian</h2>
        <FormField
          id="class-start-date"
          label="Ngày bắt đầu"
          isRequired
          hint={isLocked ? "Khóa sau khi lớp bắt đầu" : "Không được ở quá khứ khi tạo lớp"}
          error={errors.startDate?.message}
        >
          <input
            id="class-start-date"
            {...startDateField}
            onChange={(event) => {
              event.target.value = maskDateInput(event.target.value);
              void startDateField.onChange(event);
            }}
            inputMode="numeric"
            placeholder="dd/mm/yyyy"
            maxLength={10}
            readOnly={isLocked}
            aria-invalid={Boolean(errors.startDate)}
            className={cn(INPUT_CLASSES, "font-bvc-mono")}
          />
        </FormField>
        <FormField id="class-end-date" label="Ngày kết thúc" hint="Tự tính = ngày bắt đầu + 6 tuần">
          <input
            id="class-end-date"
            value={endDate}
            placeholder="dd/mm/yyyy"
            readOnly
            className={cn(INPUT_CLASSES, "font-bvc-mono")}
          />
        </FormField>
        <div className="rounded-[14px] border border-bvc-border bg-bvc-soft px-[14px] py-[12px] text-[13px] leading-[1.5] text-bvc-muted md:col-span-2">
          Sau khi lớp bắt đầu, ngày bắt đầu và nhạc cụ bị khóa. Toàn bộ sinh viên trong lớp học cùng nhạc cụ này.
        </div>
      </div>
      <FooterActions>
        <ActionButton size="lg" onClick={onCancel} disabled={isSaving}>
          Hủy
        </ActionButton>
        <ActionButton size="lg" variant="primary" type="submit" disabled={isSaving}>
          {isSaving ? "Đang lưu…" : "Lưu"}
        </ActionButton>
      </FooterActions>
    </form>
  );
}
