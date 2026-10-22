import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { Asterisk, ChevronLeft, Music, Users } from "lucide-react";
import { ListState } from "@/features/classes/components/ListState";
import { useClassDetail } from "@/features/classes/hooks/useClassDetail";
import { useInstruments } from "@/features/classes/hooks/useInstruments";
import { useSaveClass } from "@/features/classes/hooks/useSaveClass";
import { useSemesters } from "@/features/classes/hooks/useSemesters";
import {
  type ApiFieldError,
  type ClassDetail,
  type ClassPayload,
  type Instrument,
  type Semester,
} from "@/features/classes/types/classTypes";
import { formatIsoDate } from "@/features/classes/utils/classFormat";
import { applyFieldErrors } from "@/features/classes/utils/mapApiErrors";
import { classFormSchema, type ClassFormValues } from "@/features/classes/utils/validateClassForm";
import { toast } from "@/shared/components/ui/toast";
import { cn } from "@/shared/utils/cn";

const FORM_FIELDS = ["name", "instrumentId", "cohort", "description"] as const;
const FINISHED_CLASS_MESSAGE = "Không thể sửa lớp vì lớp đã kết thúc.";

const INPUT_CLASSES =
  "h-[46px] w-full rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:border-bvc-ink focus:outline-none aria-[invalid=true]:border-bvc-error read-only:bg-bvc-soft disabled:bg-bvc-soft disabled:text-bvc-muted";

interface FieldProps {
  id: string;
  label: string;
  isRequired?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ id, label, isRequired = false, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label htmlFor={id} className="flex items-center gap-[4px] text-[13px] font-semibold text-bvc-muted">
        {label}
        {isRequired && (
          <>
            <Asterisk size={12} strokeWidth={3} aria-hidden className="text-bvc-error" />
            <span className="sr-only">(bắt buộc)</span>
          </>
        )}
      </label>
      {children}
      {error ? (
        <span id={`${id}-error`} role="alert" className="text-[12px] text-bvc-error">
          {error}
        </span>
      ) : (
        hint && <span className="text-[12px] text-bvc-muted">{hint}</span>
      )}
    </div>
  );
}

function toFormValues(classDetail: ClassDetail | null, defaultSemesterName: string | null): ClassFormValues {
  return {
    name: classDetail?.name ?? "",
    instrumentId: classDetail?.instrument.id ?? "",
    cohort: classDetail?.cohort ?? defaultSemesterName ?? "",
    description: classDetail?.description ?? "",
  };
}

interface ClassDesktopFormProps {
  classDetail: ClassDetail | null;
  instruments: Instrument[];
  semesters: Semester[];
  defaultSemesterName: string | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (payload: Partial<ClassPayload>) => Promise<ApiFieldError[] | null>;
}

function ClassDesktopForm({
  classDetail,
  instruments,
  semesters,
  defaultSemesterName,
  isSaving,
  onCancel,
  onSubmit,
}: ClassDesktopFormProps) {
  const isCreate = classDetail === null;
  // GBR-36: subject (instrument) and semester are locked once the class has started.
  const isLocked = classDetail?.hasStarted ?? false;
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: toFormValues(classDetail, defaultSemesterName),
  });
  const instrumentOptions =
    classDetail && !instruments.some((item) => item.id === classDetail.instrument.id)
      ? [...instruments, { ...classDetail.instrument, isActive: false }]
      : instruments;
  // A class created before semesters were configured keeps its own cohort and dates.
  const semesterOptions =
    classDetail && !semesters.some((item) => item.name === classDetail.cohort)
      ? [...semesters, { name: classDetail.cohort, startDate: classDetail.startDate, endDate: classDetail.endDate }]
      : semesters;
  const selectedCohort = useWatch({ control, name: "cohort" });
  const selectedSemester = semesterOptions.find((item) => item.name === selectedCohort);

  const submit = handleSubmit(async (values) => {
    const payload: Partial<ClassPayload> = {
      name: values.name,
      description: values.description || null,
      ...(isLocked ? {} : { instrumentId: values.instrumentId, cohort: values.cohort }),
    };
    const fieldErrors = await onSubmit(payload);
    if (!fieldErrors) return;
    const unmatched = applyFieldErrors<ClassFormValues>(fieldErrors, FORM_FIELDS, setError);
    unmatched.forEach((fieldError) => toast.error(fieldError.message));
  });

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center gap-4 border-b border-bvc-border-strong px-[32px] py-5">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Quay lại"
          className="flex size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong bg-white"
        >
          <ChevronLeft size={18} strokeWidth={2} className="text-bvc-ink" />
        </button>
        <div className="flex flex-col gap-[3px]">
          <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-bvc-muted">Lớp học</span>
          <span className="text-[24px] font-extrabold tracking-[-0.025em] text-bvc-ink">
            {isCreate ? "Tạo lớp học" : "Sửa lớp học"}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-[10px]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] border border-bvc-border-strong bg-white px-[18px] text-[14px] font-semibold text-bvc-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Đang lưu…" : isCreate ? "Tạo lớp" : "Lưu"}
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-[22px_32px]">
          <div className="flex flex-col gap-[20px] rounded-[20px] border border-bvc-border bg-white p-[20px]">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-bvc-ink">Thông tin lớp học</span>
              <span className="flex items-center gap-[4px] text-[12px] text-bvc-muted">
                <Asterisk size={12} strokeWidth={3} aria-hidden className="text-bvc-error" />
                Trường bắt buộc
              </span>
            </div>

            <Field
              id="class-name"
              label="Mã lớp"
              isRequired
              hint="Tối đa 100 ký tự, không trùng trong cùng học kỳ"
              error={errors.name?.message}
            >
              <input
                id="class-name"
                type="text"
                {...register("name")}
                maxLength={100}
                placeholder="TRD301"
                aria-invalid={Boolean(errors.name)}
                className={INPUT_CLASSES}
              />
            </Field>

            <Field
              id="class-instrument"
              label="Tên môn học"
              isRequired
              hint={isLocked ? "Đã khóa vì lớp đã bắt đầu" : undefined}
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
                  <option value="">Chọn môn học</option>
                  {instrumentOptions.map((instrument) => (
                    <option key={instrument.id} value={instrument.id}>
                      {instrument.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>

            <Field
              id="class-cohort"
              label="Học kỳ"
              isRequired
              hint={
                isLocked
                  ? "Đã khóa vì lớp đã bắt đầu"
                  : semesters.length === 0
                    ? "Chưa có học kỳ nào. Liên hệ quản trị viên để cấu hình."
                    : "Ngày bắt đầu và kết thúc lấy theo học kỳ"
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
            </Field>

            <Field id="class-description" label="Mô tả" hint="Tối đa 500 ký tự" error={errors.description?.message}>
              <textarea
                id="class-description"
                {...register("description")}
                maxLength={500}
                placeholder="Mô tả nội dung lớp học..."
                aria-invalid={Boolean(errors.description)}
                className={cn(INPUT_CLASSES, "h-auto min-h-[72px] resize-none py-3")}
              />
            </Field>

            <div className="grid grid-cols-2 gap-[14px]">
              <Field id="class-start-date" label="Ngày bắt đầu" isRequired hint="Theo học kỳ đã chọn">
                <input
                  id="class-start-date"
                  value={selectedSemester ? formatIsoDate(selectedSemester.startDate) : ""}
                  placeholder="dd/mm/yyyy"
                  readOnly
                  className={INPUT_CLASSES}
                />
              </Field>
              <Field id="class-end-date" label="Ngày kết thúc" hint="Theo học kỳ đã chọn">
                <input
                  id="class-end-date"
                  value={selectedSemester ? formatIsoDate(selectedSemester.endDate) : ""}
                  placeholder="dd/mm/yyyy"
                  readOnly
                  className={INPUT_CLASSES}
                />
              </Field>
            </div>
          </div>
        </div>

        <aside className="flex w-[380px] shrink-0 flex-col gap-[20px] overflow-y-auto border-l border-bvc-border-strong bg-bvc-surface p-[22px_20px]">
          <div className="flex flex-col gap-[10px] rounded-[20px] border border-bvc-border bg-white p-[18px]">
            <span className="flex items-center gap-[8px] text-[15px] font-bold text-bvc-ink">
              <Users size={16} className="text-bvc-muted" />
              Danh sách sinh viên
            </span>
            <span className="text-[13px] leading-[1.5] text-bvc-muted">
              Sau khi tạo lớp, bạn có thể thêm từng sinh viên hoặc nhập danh sách từ file .xlsx / .csv trong trang chi
              tiết lớp.
            </span>
          </div>

          <div className="flex flex-col gap-[10px] rounded-[20px] border border-bvc-border bg-white p-[18px]">
            <span className="text-[14px] font-bold text-bvc-ink">Lưu ý</span>
            <ul className="flex flex-col gap-[8px]">
              <li className="flex items-start gap-[8px] text-[13px] text-bvc-muted">
                <Music size={14} className="mt-[2px] shrink-0 text-bvc-muted" />
                Môn học và học kỳ bị khóa sau khi lớp bắt đầu
              </li>
              <li className="flex items-start gap-[8px] text-[13px] text-bvc-muted">
                <Music size={14} className="mt-[2px] shrink-0 text-bvc-muted" />
                Sinh viên có thể được thêm/xóa sau
              </li>
              <li className="flex items-start gap-[8px] text-[13px] text-bvc-muted">
                <Music size={14} className="mt-[2px] shrink-0 text-bvc-muted" />
                Ngày bắt đầu và kết thúc của lớp lấy theo học kỳ do quản trị viên cấu hình
              </li>
            </ul>
          </div>
        </aside>
      </main>
    </form>
  );
}

export function ClassFormPage() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const isCreate = !classId;
  const { classDetail, isLoading: isClassLoading, error: classError, reload } = useClassDetail(classId);
  const { instruments, isLoading: isInstrumentLoading, error: instrumentError } = useInstruments();
  const { semesters, defaultSemesterName, isLoading: isSemesterLoading, error: semesterError } = useSemesters();
  const { saveClass, isSaving } = useSaveClass(classId);
  const backPath = classId ? `/teacher/classes/${classId}` : "/teacher/classes";

  const handleSubmit = async (payload: Partial<ClassPayload>) => {
    const result = await saveClass(payload);
    if ("classDetail" in result) {
      toast.success(result.message);
      navigate(`/teacher/classes/${result.classDetail.id}`, { replace: true });
      return null;
    }
    if (result.error.fieldErrors.length === 0) toast.error(result.error.message);
    return result.error.fieldErrors;
  };

  const isLoading = isInstrumentLoading || isSemesterLoading || (!isCreate && isClassLoading);
  const loadError = instrumentError ?? semesterError ?? (isCreate ? null : classError);
  const isFinished = classDetail?.isReadOnly ?? false;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      {isLoading || loadError || isFinished ? (
        <div className="p-[32px]">
          <ListState
            isLoading={isLoading}
            error={loadError}
            isEmpty={isFinished}
            emptyMessage={FINISHED_CLASS_MESSAGE}
            onRetry={reload}
          >
            {null}
          </ListState>
        </div>
      ) : (
        <ClassDesktopForm
          key={classDetail?.id ?? "new"}
          classDetail={isCreate ? null : (classDetail ?? null)}
          instruments={instruments}
          semesters={semesters}
          defaultSemesterName={defaultSemesterName}
          isSaving={isSaving}
          onCancel={() => navigate(backPath)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
