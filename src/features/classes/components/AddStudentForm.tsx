import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButton } from "@/features/classes/components/ActionButton";
import { FooterActions } from "@/features/classes/components/FooterActions";
import { FormField, INPUT_CLASSES } from "@/features/classes/components/FormField";
import { type ApiFieldError } from "@/features/classes/types/classTypes";
import { applyFieldErrors } from "@/features/classes/utils/mapApiErrors";
import { type StudentFormValues, studentSchema } from "@/features/classes/utils/validateStudent";
import { cn } from "@/shared/utils/cn";

const FORM_FIELDS = ["studentCode", "fullName", "email"] as const;

interface AddStudentFormProps {
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (values: StudentFormValues) => Promise<ApiFieldError[] | null>;
}

export function AddStudentForm({ isSaving, onCancel, onSubmit }: AddStudentFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: { studentCode: "", fullName: "", email: "" },
  });

  const submit = handleSubmit(async (values) => {
    const fieldErrors = await onSubmit(values);
    if (fieldErrors) applyFieldErrors<StudentFormValues>(fieldErrors, FORM_FIELDS, setError);
  });

  return (
    <form onSubmit={submit} noValidate className="flex grow flex-col">
      <div className="flex grow flex-col gap-[18px] px-[18px] pb-[18px] pt-[6px] lg:m-[22px_32px] lg:max-w-[720px] lg:grow-0 lg:rounded-[20px] lg:border lg:border-bvc-border lg:p-[20px]">
        <FormField id="student-code" label="Mã sinh viên" isRequired error={errors.studentCode?.message}>
          <input
            id="student-code"
            {...register("studentCode")}
            maxLength={50}
            autoCapitalize="characters"
            aria-invalid={Boolean(errors.studentCode)}
            className={cn(INPUT_CLASSES, "font-bvc-mono")}
          />
        </FormField>
        <FormField id="student-name" label="Họ tên" isRequired error={errors.fullName?.message}>
          <input
            id="student-name"
            {...register("fullName")}
            maxLength={100}
            aria-invalid={Boolean(errors.fullName)}
            className={INPUT_CLASSES}
          />
        </FormField>
        <FormField id="student-email" label="Email" isRequired error={errors.email?.message}>
          <input
            id="student-email"
            type="email"
            inputMode="email"
            {...register("email")}
            maxLength={255}
            aria-invalid={Boolean(errors.email)}
            className={INPUT_CLASSES}
          />
        </FormField>
      </div>
      <FooterActions>
        <ActionButton size="lg" onClick={onCancel} disabled={isSaving}>
          Hủy
        </ActionButton>
        <ActionButton size="lg" variant="primary" type="submit" disabled={isSaving}>
          {isSaving ? "Đang thêm…" : "Thêm"}
        </ActionButton>
      </FooterActions>
    </form>
  );
}
