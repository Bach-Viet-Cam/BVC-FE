import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, GraduationCap, IdCard, Mail, ShieldCheck, User, UserPlus, Pencil } from "lucide-react";
import { Dialog, DialogClose, DialogDescription, DialogPopup, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { type UserItem } from "@/features/platform/types/userTypes";
import { userSchema, type UserFormValues } from "@/features/platform/utils/validateUser";
import { ROLES } from "@/shared/constants/roles";
import { cn } from "@/shared/utils/cn";

interface UserFormProps {
  user: UserItem | null;
  onSubmit: (values: UserFormValues) => Promise<boolean>;
  onClose: () => void;
}

const ROLE_OPTIONS = [
  {
    value: String(ROLES.STUDENT) as UserFormValues["role"],
    label: "Sinh viên",
    icon: BookOpen,
    desc: "Luyện tập nhạc cụ, nộp bài tập & theo dõi tiến độ",
  },
  {
    value: String(ROLES.TEACHER) as UserFormValues["role"],
    label: "Giảng viên",
    icon: GraduationCap,
    desc: "Tạo lớp, giao bài tập, chấm điểm & duyệt bản thu",
  },
  {
    value: String(ROLES.SYSTEM_ADMIN) as UserFormValues["role"],
    label: "Quản trị viên",
    icon: ShieldCheck,
    desc: "Quản trị người dùng, hệ thống & cấu hình nền tảng",
  },
];

function UserForm({ user, onSubmit, onClose }: UserFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: user?.email ?? "",
      username: user?.username ?? "",
      role: user ? (String(user.role) as UserFormValues["role"]) : "1",
      studentCode: user?.studentCode ?? "",
    },
  });

  const selectedRole = watch("role");
  const isEmailLocked = user !== null && user.lastLoginAt !== null;

  const submit = async (values: UserFormValues) => {
    if (await onSubmit(values)) onClose();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5 pt-2">
      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-semibold text-bvc-ink">
          Vai trò tài khoản <span className="text-bvc-accent-text">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {ROLE_OPTIONS.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedRole === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setValue("role", item.value, { shouldValidate: true })}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-[12px] border p-3 text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-bvc-ink bg-bvc-ink/5 shadow-xs"
                    : "border-bvc-border bg-white hover:border-bvc-border-strong hover:bg-bvc-surface/40"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div
                    className={cn(
                      "flex size-7 items-center justify-center rounded-[8px]",
                      isSelected ? "bg-bvc-ink text-white" : "bg-bvc-surface text-bvc-muted"
                    )}
                  >
                    <Icon size={14} />
                  </div>
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      isSelected ? "bg-bvc-ink" : "border border-bvc-border bg-transparent"
                    )}
                  />
                </div>
                <div className="mt-1 font-semibold text-[13.5px] text-bvc-ink">{item.label}</div>
                <div className="line-clamp-2 text-[11px] leading-tight text-bvc-muted">{item.desc}</div>
              </button>
            );
          })}
        </div>
        {errors.role && <p className="text-[12px] text-bvc-accent-text font-medium">{errors.role.message}</p>}
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-[13px] font-semibold text-bvc-ink" htmlFor="user-email">
            <Mail size={14} className="text-bvc-muted" />
            Email Google <span className="text-bvc-accent-text">*</span>
          </label>
          <Input
            id="user-email"
            type="email"
            disabled={isEmailLocked}
            placeholder="nguyenvana@gmail.com hoặc example@seed.bvc.test"
            className="rounded-[11px] border-bvc-border-strong text-[14px]"
            {...register("email")}
          />
          {isEmailLocked ? (
            <p className="text-[12px] text-bvc-muted">
              Email đã được bảo vệ vì người dùng đã từng đăng nhập vào hệ thống.
            </p>
          ) : (
            <p className="text-[12px] text-bvc-muted">
              Người dùng sẽ dùng đúng email này để đăng nhập Google OAuth vào hệ thống.
            </p>
          )}
          {errors.email && <p className="text-[12px] text-bvc-accent-text font-medium">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-[13px] font-semibold text-bvc-ink" htmlFor="user-username">
            <User size={14} className="text-bvc-muted" />
            Họ và tên <span className="text-bvc-accent-text">*</span>
          </label>
          <Input
            id="user-username"
            placeholder="Nguyễn Văn A"
            className="rounded-[11px] border-bvc-border-strong text-[14px]"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-[12px] text-bvc-accent-text font-medium">{errors.username.message}</p>
          )}
        </div>

        {selectedRole === String(ROLES.STUDENT) && (
          <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
            <label
              className="flex items-center gap-1.5 text-[13px] font-semibold text-bvc-ink"
              htmlFor="user-student-code"
            >
              <IdCard size={14} className="text-bvc-muted" />
              Mã sinh viên
            </label>
            <Input
              id="user-student-code"
              placeholder="VD: SE170081"
              className="font-mono rounded-[11px] border-bvc-border-strong text-[14px]"
              {...register("studentCode")}
            />
            {errors.studentCode && (
              <p className="text-[12px] text-bvc-accent-text font-medium">{errors.studentCode.message}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2.5 border-t border-bvc-border pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          className="rounded-[11px] border-bvc-border-strong font-medium text-bvc-ink"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          className="rounded-[11px] bg-bvc-ink font-semibold text-white hover:bg-black"
        >
          {user ? "Lưu thay đổi" : "Tạo người dùng"}
        </Button>
      </div>
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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-[540px] rounded-[18px] p-6 border-bvc-border">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-bvc-ink text-white">
            {user ? <Pencil size={18} /> : <UserPlus size={18} />}
          </div>
          <div>
            <DialogTitle className="text-[18px] font-bold text-bvc-ink">
              {user ? "Chỉnh sửa tài khoản" : "Thêm người dùng mới"}
            </DialogTitle>
            <DialogDescription className="text-[12.5px] text-bvc-muted mt-0.5">
              {user
                ? `Cập nhật thông tin tài khoản của ${user.username}`
                : "Tài khoản tạo mới ở trạng thái 'Chờ kích hoạt' cho đến khi đăng nhập Google lần đầu."}
            </DialogDescription>
          </div>
        </div>
        <DialogClose />
        <UserForm user={user} onSubmit={onSubmit} onClose={() => onOpenChange(false)} />
      </DialogPopup>
    </Dialog>
  );
}
