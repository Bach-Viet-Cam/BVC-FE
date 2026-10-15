import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogClose, DialogDescription, DialogPopup, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { USER_ROLE_OPTIONS } from "@/features/platform/constants/userConstants";
import { type UserItem } from "@/features/platform/types/userTypes";
import { userSchema, type UserFormValues } from "@/features/platform/utils/validateUser";

interface UserFormProps {
  user: UserItem | null;
  onSubmit: (values: UserFormValues) => Promise<boolean>;
  onClose: () => void;
}

function UserForm({ user, onSubmit, onClose }: UserFormProps) {
  const {
    register,
    handleSubmit,
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
  const isEmailLocked = user !== null && user.lastLoginAt !== null;

  const submit = async (values: UserFormValues) => {
    if (await onSubmit(values)) onClose();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-on-surface" htmlFor="user-email">
          Email *
        </label>
        <Input id="user-email" type="email" disabled={isEmailLocked} {...register("email")} />
        {isEmailLocked && (
          <p className="text-xs text-on-surface-variant">Không thể đổi email sau khi tài khoản đã đăng nhập.</p>
        )}
        {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-on-surface" htmlFor="user-username">
          Họ tên *
        </label>
        <Input id="user-username" {...register("username")} />
        {errors.username && <p className="text-xs text-error">{errors.username.message}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-on-surface" htmlFor="user-role">
          Vai trò *
        </label>
        <select
          id="user-role"
          className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-base text-on-surface focus:border-primary focus:outline-none"
          {...register("role")}
        >
          {USER_ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.role && <p className="text-xs text-error">{errors.role.message}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-on-surface" htmlFor="user-student-code">
          Mã sinh viên
        </label>
        <Input id="user-student-code" {...register("studentCode")} />
        {errors.studentCode && <p className="text-xs text-error">{errors.studentCode.message}</p>}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Lưu
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
      <DialogPopup>
        <DialogTitle>{user ? "Sửa người dùng" : "Thêm người dùng"}</DialogTitle>
        <DialogDescription>
          {user
            ? "Cập nhật thông tin tài khoản."
            : "Tài khoản mới ở trạng thái Chờ kích hoạt và được kích hoạt khi người dùng đăng nhập Google lần đầu bằng đúng email này."}
        </DialogDescription>
        <DialogClose />
        <UserForm user={user} onSubmit={onSubmit} onClose={() => onOpenChange(false)} />
      </DialogPopup>
    </Dialog>
  );
}
