import { type ReactNode, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type ApiFieldError,
  type ClassDetail,
  type ClassPayload,
  type Instrument,
  type Lecturer,
  type Semester,
} from "@/features/classes/types/classTypes";
import {
  buildClassDescription,
  CLASS_CODE_EXAMPLE,
  findInstrumentBySubject,
  parseClassCode,
} from "@/features/classes/utils/classCode";
import { formatIsoDate } from "@/features/classes/utils/classFormat";
import { LecturerPicker } from "@/features/classes/components/LecturerPicker";
import { applyFieldErrors } from "@/features/classes/utils/mapApiErrors";
import { resolveSemesterForHalf, toSemesterHalf, type SemesterTarget } from "@/features/classes/utils/semesterHalf";
import {
  classFormSchema,
  createClassFormSchema,
  type ClassFormValues,
} from "@/features/classes/utils/validateClassForm";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { FormField } from "@/shared/components/bvc/FormField";
import { FormBody, FormFooter } from "@/shared/components/bvc/FormLayout";
import { INPUT_CLASSES } from "@/shared/components/bvc/fieldStyles";
import { toast } from "@/shared/components/ui/toast";
import { useReportDirty } from "@/shared/hooks/useReportDirty";
import { cn } from "@/shared/utils/cn";

const FORM_FIELDS = ["name", "instrumentId", "cohort", "description"] as const;

function toFormValues(classDetail: ClassDetail | null, defaultSemesterName: string | null): ClassFormValues {
  return {
    name: classDetail?.name ?? "",
    instrumentId: classDetail?.instrument.id ?? "",
    cohort: classDetail?.cohort ?? defaultSemesterName ?? "",
    description: classDetail?.description ?? "",
  };
}

export interface ClassFormPrefill {
  // Changes whenever a different source class is picked.
  key: string;
  name: string;
  description: string | null;
  coLecturers: Lecturer[];
}

interface ClassFormProps {
  // null = tạo lớp mới
  classDetail: ClassDetail | null;
  instruments: Instrument[];
  semesters: Semester[];
  defaultSemesterName: string | null;
  isSaving: boolean;
  // Blocks submit without showing the saving label (e.g. while a copy source is loading).
  submitDisabled?: boolean;
  onCancel: () => void;
  onSubmit: (payload: Partial<ClassPayload>) => Promise<ApiFieldError[] | null>;
  onDirtyChange?: (isDirty: boolean) => void;
  // Create flow only: values copied from another class.
  prefill?: ClassFormPrefill | null;
  // Rendered right before the start/end date block.
  copySection?: ReactNode;
  // Reports the instrument derived from the class code.
  onInstrumentChange?: (instrumentId: string) => void;
  // Called before onSubmit; false stops the submit.
  beforeSubmit?: () => boolean;
}

// Form lớp học dùng cho modal tạo lớp và trang sửa lớp
export function ClassForm({
  classDetail,
  instruments,
  semesters,
  defaultSemesterName,
  isSaving,
  submitDisabled = false,
  onCancel,
  onSubmit,
  onDirtyChange,
  prefill = null,
  copySection,
  onInstrumentChange,
  beforeSubmit,
}: ClassFormProps) {
  const isCreate = classDetail === null;
  // GBR-36: subject (instrument) and semester are locked once the class has started.
  const isLocked = classDetail?.hasStarted ?? false;
  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitted, isDirty },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(isCreate ? createClassFormSchema : classFormSchema),
    defaultValues: toFormValues(classDetail, defaultSemesterName),
  });
  const [coLecturers, setCoLecturers] = useState<Lecturer[]>([]);
  const [coLecturerError, setCoLecturerError] = useState<string | undefined>();
  useReportDirty(isDirty || coLecturers.length > 0, onDirtyChange);
  const instrumentOptions =
    classDetail && !instruments.some((item) => item.id === classDetail.instrument.id)
      ? [...instruments, { ...classDetail.instrument, code: "", isActive: false }]
      : instruments;
  // A class created before semesters were configured keeps its own cohort and dates.
  const semesterOptions =
    classDetail && !semesters.some((item) => item.name === classDetail.cohort)
      ? [...semesters, { name: classDetail.cohort, startDate: classDetail.startDate, endDate: classDetail.endDate }]
      : semesters;
  const selectedCohort = useWatch({ control, name: "cohort" });
  const selectedSemester = semesterOptions.find((item) => item.name === selectedCohort);

  // Create flow: the subject comes from the instrument code in the class code (DNH103.M2.H1 -> DNH).
  const enteredName = useWatch({ control, name: "name" });
  const parsedCode = isCreate ? parseClassCode(enteredName) : null;
  const matchedInstrument = parsedCode ? findInstrumentBySubject(instruments, parsedCode.subject) : null;
  const autoDescription =
    matchedInstrument && parsedCode && selectedCohort
      ? buildClassDescription(matchedInstrument.name, parsedCode)
      : null;
  const lastAutoDescription = useRef("");

  // Create flow: the half in the class code picks the semester entry (FA26-H1, FA26-H2, ...).
  // During FA26-H2, H2 keeps FA26-H2 and H1 jumps to SP27-H1; during FA26-H1, H2 moves to FA26-H2.
  const codeHalf = isCreate ? toSemesterHalf(parsedCode?.half) : null;
  const semesterTarget: SemesterTarget | null = codeHalf ? resolveSemesterForHalf(semesters, codeHalf) : null;
  const targetCohort = semesterTarget?.kind === "found" ? semesterTarget.semester.name : "";
  // Apply only when the target changes, so a semester picked by hand is kept until the code's half changes.
  const targetKey = semesterTarget ? `${semesterTarget.kind}:${targetCohort}` : null;
  const lastAppliedTarget = useRef<string | null>(null);

  // Create flow: applying or removing a copied class. Declared before the effects below so they see the reset.
  const appliedPrefillKey = useRef<string | null>(null);
  const prefillKey = prefill?.key ?? null;
  // Co-lecturers are plain state: adjust them while rendering when the prefill changes.
  const [seenPrefillKey, setSeenPrefillKey] = useState<string | null>(null);
  if (isCreate && prefillKey !== seenPrefillKey) {
    setSeenPrefillKey(prefillKey);
    setCoLecturers(prefill?.coLecturers ?? []);
    setCoLecturerError(undefined);
  }
  useEffect(() => {
    if (!isCreate || prefillKey === appliedPrefillKey.current) return;
    appliedPrefillKey.current = prefillKey;
    if (prefill) {
      // The instrument and semester effects only re-run when their inputs change, so derive both from the
      // copied code here instead of relying on them.
      const code = parseClassCode(prefill.name);
      const instrument = code ? findInstrumentBySubject(instruments, code.subject) : null;
      const half = toSemesterHalf(code?.half);
      const target = half ? resolveSemesterForHalf(semesters, half) : null;
      reset(
        {
          name: prefill.name,
          instrumentId: instrument?.id ?? "",
          cohort: target?.kind === "found" ? target.semester.name : (defaultSemesterName ?? ""),
          description: prefill.description ?? "",
        },
        { keepDefaultValues: true }
      );
      // A non-empty copied description never equals "", so the generated one will not replace it.
      lastAutoDescription.current = "";
    } else {
      reset(toFormValues(null, defaultSemesterName), { keepDefaultValues: true });
      lastAutoDescription.current = "";
    }
    lastAppliedTarget.current = null;
  }, [isCreate, prefillKey, prefill, defaultSemesterName, instruments, semesters, reset]);

  useEffect(() => {
    const previous = lastAppliedTarget.current;
    lastAppliedTarget.current = targetKey;
    if (targetKey === null || targetKey === previous) return;
    setValue("cohort", targetCohort, { shouldDirty: true, shouldValidate: isSubmitted });
  }, [targetKey, targetCohort, isSubmitted, setValue]);

  const matchedInstrumentId = matchedInstrument?.id ?? "";
  useEffect(() => {
    onInstrumentChange?.(matchedInstrumentId);
  }, [matchedInstrumentId, onInstrumentChange]);

  useEffect(() => {
    if (!isCreate) return;
    setValue("instrumentId", matchedInstrument?.id ?? "", { shouldValidate: isSubmitted });
  }, [isCreate, matchedInstrument?.id, isSubmitted, setValue]);

  useEffect(() => {
    if (!autoDescription) return;
    // Only overwrite a description the user has not typed themselves.
    const current = getValues("description");
    if (current === "" || current === lastAutoDescription.current) {
      setValue("description", autoDescription, { shouldValidate: isSubmitted });
    }
    lastAutoDescription.current = autoDescription;
  }, [autoDescription, isSubmitted, getValues, setValue]);

  const semesterHint =
    semesterTarget?.kind === "missing"
      ? `Mã H${semesterTarget.half} cần half ${semesterTarget.half} tiếp theo, nhưng quản trị viên chưa cấu hình. Liên hệ quản trị viên.`
      : semesterTarget && selectedCohort === targetCohort
        ? "Tự động theo half trong mã lớp. Ngày bắt đầu và kết thúc lấy theo học kỳ"
        : "Ngày bắt đầu và kết thúc lấy theo học kỳ";

  const instrumentHint = isLocked
    ? "Đã khóa vì lớp đã bắt đầu"
    : isCreate
      ? parsedCode && !matchedInstrument
        ? `Không có nhạc cụ nào có mã khớp với môn ${parsedCode.subject}. Nếu lệch loại đàn, hãy sửa mã môn.`
        : "Tự động theo mã môn trong mã lớp. Nếu lệch loại đàn, hãy sửa mã môn."
      : undefined;

  // Class codes are upper case; convert while typing and keep the caret where it was.
  const nameField = register("name");
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const { selectionStart, selectionEnd } = input;
    input.value = input.value.toUpperCase();
    input.setSelectionRange(selectionStart, selectionEnd);
    void nameField.onChange(event);
  };

  const submit = handleSubmit(async (values) => {
    const payload: Partial<ClassPayload> = {
      name: values.name,
      description: values.description || null,
      ...(isLocked ? {} : { instrumentId: values.instrumentId, cohort: values.cohort }),
      ...(isCreate ? { coLecturerIds: coLecturers.map((lecturer) => lecturer.id) } : {}),
    };
    if (beforeSubmit && !beforeSubmit()) return;
    setCoLecturerError(undefined);
    const fieldErrors = await onSubmit(payload);
    if (!fieldErrors) return;
    const coLecturerFieldError = fieldErrors.find((fieldError) => fieldError.field === "coLecturerIds");
    setCoLecturerError(coLecturerFieldError?.message);
    const unmatched = applyFieldErrors<ClassFormValues>(
      fieldErrors.filter((fieldError) => fieldError !== coLecturerFieldError),
      FORM_FIELDS,
      setError
    );
    unmatched.forEach((fieldError) => toast.error(fieldError.message));
  });

  return (
    <form onSubmit={submit} noValidate className="flex grow flex-col">
      <FormBody>
        <FormField
          htmlFor="class-name"
          label="Mã lớp"
          required
          hint={
            isCreate
              ? `Dạng Môn.Slot.Half, ví dụ ${CLASS_CODE_EXAMPLE} (M1, M2, M3 = slot 1, 2, 3; E1, E2, E3 = slot 4, 5, 6; H1 = half 1)`
              : "Tối đa 100 ký tự, không trùng trong cùng học kỳ"
          }
          error={errors.name?.message}
        >
          <input
            id="class-name"
            type="text"
            {...nameField}
            onChange={handleNameChange}
            maxLength={100}
            placeholder={isCreate ? CLASS_CODE_EXAMPLE : "TRD301"}
            aria-invalid={Boolean(errors.name)}
            className={INPUT_CLASSES}
          />
        </FormField>

        <FormField
          htmlFor="class-instrument"
          label="Tên môn học"
          required
          hint={instrumentHint}
          error={errors.instrumentId?.message}
        >
          {isCreate ? (
            <>
              <input type="hidden" {...register("instrumentId")} />
              <input
                id="class-instrument"
                value={matchedInstrument?.name ?? ""}
                placeholder="Tự động theo mã lớp"
                readOnly
                aria-invalid={Boolean(errors.instrumentId)}
                className={INPUT_CLASSES}
              />
            </>
          ) : isLocked ? (
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
              <option value="">Chọn môn học</option>
              {instrumentOptions.map((instrument) => (
                <option key={instrument.id} value={instrument.id}>
                  {instrument.name}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField
          htmlFor="class-cohort"
          label="Học kỳ"
          required
          hint={
            isLocked
              ? "Đã khóa vì lớp đã bắt đầu"
              : semesters.length === 0
                ? "Chưa có học kỳ nào. Liên hệ quản trị viên để cấu hình."
                : semesterHint
          }
          error={errors.cohort?.message}
        >
          {isLocked ? (
            <input id="class-cohort" value={classDetail?.cohort ?? ""} readOnly className={INPUT_CLASSES} />
          ) : (
            <select
              id="class-cohort"
              {...register("cohort")}
              aria-invalid={Boolean(errors.cohort)}
              className={INPUT_CLASSES}
            >
              <option value="">Chọn học kỳ</option>
              {semesterOptions.map((semester) => (
                <option key={semester.name} value={semester.name}>
                  {semester.name}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField
          htmlFor="class-description"
          label="Mô tả"
          hint="Tối đa 500 ký tự"
          error={errors.description?.message}
        >
          <textarea
            id="class-description"
            {...register("description")}
            maxLength={500}
            placeholder="Mô tả nội dung lớp học..."
            aria-invalid={Boolean(errors.description)}
            className={cn(INPUT_CLASSES, "h-auto min-h-[72px] resize-none py-3")}
          />
        </FormField>

        {isCreate && (
          <FormField
            htmlFor="class-co-lecturers"
            label="Giảng viên cùng dạy"
            hint="Nhập email để tìm giảng viên. Có thể bỏ trống và thêm sau trong trang chi tiết lớp."
            error={coLecturerError}
          >
            <LecturerPicker
              id="class-co-lecturers"
              label="Giảng viên cùng dạy"
              value={coLecturers}
              onChange={(lecturers) => {
                setCoLecturers(lecturers);
                setCoLecturerError(undefined);
              }}
              disabled={isSaving}
            />
          </FormField>
        )}

        {copySection}

        <div className="grid gap-[14px] sm:grid-cols-2">
          <FormField htmlFor="class-start-date" label="Ngày bắt đầu" hint="Theo học kỳ đã chọn">
            <input
              id="class-start-date"
              value={selectedSemester ? formatIsoDate(selectedSemester.startDate) : ""}
              placeholder="dd/mm/yyyy"
              readOnly
              className={INPUT_CLASSES}
            />
          </FormField>
          <FormField htmlFor="class-end-date" label="Ngày kết thúc" hint="Theo học kỳ đã chọn">
            <input
              id="class-end-date"
              value={selectedSemester ? formatIsoDate(selectedSemester.endDate) : ""}
              placeholder="dd/mm/yyyy"
              readOnly
              className={INPUT_CLASSES}
            />
          </FormField>
        </div>
      </FormBody>
      <FormFooter>
        <ActionButton variant="secondary" onClick={onCancel} disabled={isSaving}>
          Hủy
        </ActionButton>
        <ActionButton type="submit" disabled={isSaving || submitDisabled}>
          {isSaving ? "Đang lưu…" : isCreate ? "Tạo lớp" : "Lưu"}
        </ActionButton>
      </FormFooter>
    </form>
  );
}
