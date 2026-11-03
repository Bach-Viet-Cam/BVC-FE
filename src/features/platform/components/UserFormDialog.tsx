import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, GraduationCap, ShieldCheck } from "lucide-react";
import { type UserItem } from "@/features/platform/types/userTypes";
import { userSchema, type UserFormValues } from "@/features/platform/utils/validateUser";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { FormField } from "@/shared/components/bvc/FormField";
import { FormBody, FormFooter } from "@/shared/components/bvc/FormLayout";
import { INPUT_CLASSES } from "@/shared/components/bvc/fieldStyles";
import { ROLES } from "@/shared/constants/roles";
import { useReportDirty } from "@/shared/hooks/useReportDirty";
import { cn } from "@/shared/utils/cn";

interface UserFormProps {
  user: UserItem | null;
  onSubmit: (values: UserFormValues) => Promise<boolean>;
  onCancel: () => void;
  onSaved: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

const ROLE_OPTIONS = [
  {
    value: String(ROLES.STUDENT) as UserFormValues["role"],
    label: "Sinh viên",
    icon: BookOpen,
    desc: "Luyện tập nhạc cụ, nộp bài tập và theo dõi tiến độ",
  },
  {
    value: String(ROLES.TEACHER) as UserFormValues["role"],
    label: "Giảng viên",
    icon: GraduationCap,
    desc: "Tạo lớp, giao bài tập, chấm điểm và duyệt bản thu",
  },
  {
    value: String(ROLES.SYSTEM_ADMIN) as UserFormValues["role"],
    label: "Quản trị viên",
    icon: ShieldCheck,
    desc: "Quản trị người dùng, hệ thống và cấu hình nền tảng",
  },
];

function UserForm({ user, onSubmit, onCancel, onSaved, onDirtyChange }: UserFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: user?.email ?? "",
      username: user?.username ?? "",
      role: user ? (String(user.role) as UserFormValues["role"]) : "1",
      studentCode: user?.studentCode ?? "",
    },
  });
  useReportDirty(isDirty, onDirtyChange);

  const selectedRole = useWatch({ control, name: "role" });
  const isEmailLocked = user !== null && user.lastLoginAt !== null;

  const submit = async (values: UserFormValues) => {
    if (await onSubmit(values)) onSaved();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col">
      <FormBody>
        <FormField label="Vai trò tài khoản" required error={errors.role?.message}>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {ROLE_OPTIONS.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedRole === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setValue("role", item.value, { shouldValidate: true, shouldDirty: true })}
                  className={cn(
                    "flex cursor-pointer flex-col items-start gap-1 rounded-[13px] border p-3 text-left transition-colors",
                    isSelected
                      ? "border-bvc-ink bg-bvc-soft"
                      : "border-bvc-border bg-white hover:border-bvc-border-strong hover:bg-bvc-soft"
                  )}
                >
                  <Icon size={16} className={isSelected ? "text-bvc-ink" : "text-bvc-muted"} aria-hidden />
                  <span className="mt-1 text-[13.5px] font-medium text-bvc-ink">{item.label}</span>
                  <span className="line-clamp-2 text-[11.5px] leading-snug text-bvc-muted">{item.desc}</span>
                </button>
              );
            })}
          </div>
        </FormField>

        <FormField
          label="Email Google"
          htmlFor="user-email"
          required
          hint={
            isEmailLocked
              ? "Email đã được bảo vệ vì người dùng đã từng đăng nhập vào hệ thống."
              : "Người dùng sẽ dùng đúng email này để đăng nhập Google vào hệ thống."
          }
          error={errors.email?.message}
        >
          <input
            id="user-email"
            type="email"
            disabled={isEmailLocked}
            placeholder="nguyenvana@gmail.com"
            aria-invalid={Boolean(errors.email)}
            className={INPUT_CLASSES}
            {...register("email")}
          />
        </FormField>

        <FormField label="Họ và tên" htmlFor="user-username" required error={errors.username?.message}>
          <input
            id="user-username"
            placeholder="Nguyễn Văn A"
            aria-invalid={Boolean(errors.username)}
            className={INPUT_CLASSES}
            {...register("username")}
          />
        </FormField>

        {selectedRole === String(ROLES.STUDENT) && (
          <FormField label="Mã sinh viên" htmlFor="user-student-code" error={errors.studentCode?.message}>
            <input
              id="user-student-code"
              placeholder="VD: SE170081"
              aria-invalid={Boolean(errors.studentCode)}
              className={cn(INPUT_CLASSES, "font-bvc-mono")}
              {...register("studentCode")}
            />
          </FormField>
        )}
      </FormBody>

      <FormFooter>
        <ActionButton variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </ActionButton>
        <ActionButton type="submit" isLoading={isSubmitting}>
          {user ? "Lưu thay đổi" : "Tạo người dùng"}
        </ActionButton>
      </FormFooter>
    </form>
  );
}

interface UserFormDialogProps {
  isOpen: boolean;
  user: UserItem | null;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: UserFormValues) => Promise<boolean>;
}

export function UserFormDialog({ isOpen, user, onOpenChange, onSubmit }: UserFormDialogProps) {
  const [isDirty, setIsDirty] = useState(false);
  const close = () => {
    setIsDirty(false);
    onOpenChange(false);
  };

  return (
    <FormDialog
      open={isOpen}
      onClose={close}
      title={user ? "Chỉnh sửa tài khoản" : "Thêm người dùng"}
      description={
        user
          ? `Cập nhật thông tin tài khoản của ${user.username}`
          : "Tài khoản mới ở trạng thái Chờ kích hoạt cho đến khi người dùng đăng nhập Google lần đầu."
      }
      isDirty={isDirty}
    >
      {(requestClose) => (
        <UserForm user={user} onSubmit={onSubmit} onCancel={requestClose} onSaved={close} onDirtyChange={setIsDirty} />
      )}
    </FormDialog>
  );
}
