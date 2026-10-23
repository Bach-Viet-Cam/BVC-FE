import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButton } from "@/features/classes/components/ActionButton";
import { FooterActions } from "@/features/classes/components/FooterActions";
import { FormField, INPUT_CLASSES } from "@/features/classes/components/FormField";
import { type ApiFieldError, type MemberLookup } from "@/features/classes/types/classTypes";
import { applyFieldErrors } from "@/features/classes/utils/mapApiErrors";
import { type StudentFormValues, studentSchema } from "@/features/classes/utils/validateStudent";
import { cn } from "@/shared/utils/cn";

const FORM_FIELDS = ["studentCode", "fullName", "email"] as const;

const ALREADY_IN_CLASS_MESSAGE = "Sinh viên đã có trong lớp.";

interface AddStudentFormProps {
  isSaving: boolean;
  isChecking: boolean;
  onCancel: () => void;
  // Returns the lookup result, or field errors to show under the email input (null = already toasted).
  onLookup: (email: string) => Promise<MemberLookup | ApiFieldError[] | null>;
  onSubmit: (values: StudentFormValues) => Promise<ApiFieldError[] | null>;
}

// Two steps: check the email first, then show Mã sinh viên + Họ tên. Fields an existing student
// account already has are prefilled and locked; a non-student account cannot be added.
export function AddStudentForm({ isSaving, isChecking, onCancel, onLookup, onSubmit }: AddStudentFormProps) {
  const [lookup, setLookup] = useState<MemberLookup | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: { studentCode: "", fullName: "", email: "" },
  });

  const canAdd = lookup?.status === "NEW" || lookup?.status === "STUDENT";
  const isNameLocked = lookup?.status === "STUDENT" && Boolean(lookup.fullName);
  const isCodeLocked = lookup?.status === "STUDENT" && Boolean(lookup.studentCode);

  const resetLookup = () => {
    if (!lookup) return;
    setLookup(null);
    setValue("fullName", "");
    setValue("studentCode", "");
  };

  const checkEmail = async () => {
    if (!(await trigger("email"))) return;
    const result = await onLookup(getValues("email").trim());
    if (!result) return;
    if (Array.isArray(result)) {
      applyFieldErrors<StudentFormValues>(result, FORM_FIELDS, setError);
      return;
    }
    if (result.status === "ALREADY_IN_CLASS") setError("email", { type: "server", message: ALREADY_IN_CLASS_MESSAGE });
    setValue("fullName", result.fullName ?? "");
    setValue("studentCode", result.studentCode ?? "");
    setLookup(result);
  };

  const submit = handleSubmit(async (values) => {
    const fieldErrors = await onSubmit(values);
    if (fieldErrors) applyFieldErrors<StudentFormValues>(fieldErrors, FORM_FIELDS, setError);
  });

  const emailField = register("email", { onChange: resetLookup });

  return (
    <form
      onSubmit={(event) => {
        if (canAdd) return void submit(event);
        event.preventDefault();
        void checkEmail();
      }}
      noValidate
      className="flex grow flex-col"
    >
      <div className="flex grow flex-col gap-[18px] px-[18px] pb-[18px] pt-[6px] lg:m-[22px_32px] lg:max-w-[720px] lg:grow-0 lg:rounded-[20px] lg:border lg:border-bvc-border lg:p-[20px]">
        <FormField id="student-email" label="Email" isRequired error={errors.email?.message}>
          <div className="flex gap-[8px]">
            <input
              id="student-email"
              type="email"
              inputMode="email"
              {...emailField}
              maxLength={255}
              aria-invalid={Boolean(errors.email)}
              className={INPUT_CLASSES}
            />
            <ActionButton
              variant="primary"
              className="h-[46px] shrink-0 px-[16px]"
              onClick={() => void checkEmail()}
              disabled={isChecking || isSaving || lookup !== null}
            >
              {isChecking ? "Đang kiểm tra…" : "Tiếp tục"}
            </ActionButton>
          </div>
        </FormField>
        {lookup?.status === "NOT_STUDENT" && (
          <div
            role="alert"
            className="rounded-[13px] border border-bvc-error px-[13px] py-[11px] text-[13.5px] text-bvc-error"
          >
            Đây không phải tài khoản sinh viên.
          </div>
        )}
        {canAdd && (
          <>
            <FormField
              id="student-code"
              label="Mã sinh viên"
              isRequired
              hint={isCodeLocked ? "Lấy từ tài khoản sinh viên đã có." : undefined}
              error={errors.studentCode?.message}
            >
              <input
                id="student-code"
                {...register("studentCode")}
                maxLength={50}
                autoCapitalize="characters"
                readOnly={isCodeLocked}
                aria-invalid={Boolean(errors.studentCode)}
                className={cn(INPUT_CLASSES, "font-bvc-mono", isCodeLocked && "text-bvc-muted")}
              />
            </FormField>
            <FormField
              id="student-name"
              label="Họ tên"
              isRequired
              hint={isNameLocked ? "Lấy từ tài khoản sinh viên đã có." : undefined}
              error={errors.fullName?.message}
            >
              <input
                id="student-name"
                {...register("fullName")}
                maxLength={100}
                readOnly={isNameLocked}
                aria-invalid={Boolean(errors.fullName)}
                className={cn(INPUT_CLASSES, isNameLocked && "text-bvc-muted")}
              />
            </FormField>
          </>
        )}
      </div>
      <FooterActions>
        <ActionButton size="lg" onClick={onCancel} disabled={isSaving}>
          Hủy
        </ActionButton>
        <ActionButton size="lg" variant="primary" type="submit" disabled={isSaving || !canAdd}>
          {isSaving ? "Đang thêm…" : "Thêm"}
        </ActionButton>
      </FooterActions>
    </form>
  );
}
