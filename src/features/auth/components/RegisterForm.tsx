import { useState } from "react";
import { useForm } from "react-hook-form";

interface RegisterFields {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function RegisterForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFields>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (_data: RegisterFields) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: connect to email/password register endpoint
    } catch {
      setError("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[13px]">
      <div className="flex flex-col gap-[6px]">
        <label className="text-[13.5px] font-semibold text-bvc-muted">Họ và tên</label>
        <input
          {...register("name", { required: "Vui lòng nhập họ tên" })}
          placeholder="Trần Minh Anh"
          className="h-[50px] w-full rounded-[15px] border border-bvc-border-strong bg-white px-[14px] text-[15px] text-bvc-ink placeholder:text-bvc-faint focus:border-bvc-accent focus:outline-none"
        />
        {errors.name && <p className="text-[12.5px] text-bvc-error">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-[6px]">
        <label className="text-[13.5px] font-semibold text-bvc-muted">Email trường</label>
        <input
          {...register("email", { required: "Vui lòng nhập email" })}
          type="email"
          placeholder="anhtm@fpt.edu.vn"
          className="h-[50px] w-full rounded-[15px] border border-bvc-border-strong bg-white px-[14px] text-[15px] text-bvc-ink placeholder:text-bvc-faint focus:border-bvc-accent focus:outline-none"
        />
        {errors.email && <p className="text-[12.5px] text-bvc-error">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-[6px]">
        <label className="text-[13.5px] font-semibold text-bvc-muted">Mật khẩu</label>
        <input
          {...register("password", { required: "Vui lòng nhập mật khẩu" })}
          type="password"
          placeholder="Ít nhất 8 ký tự"
          className="h-[50px] w-full rounded-[15px] border border-bvc-border-strong bg-white px-[14px] text-[15px] text-bvc-ink placeholder:text-bvc-faint focus:border-bvc-accent focus:outline-none"
        />
        {errors.password && <p className="text-[12.5px] text-bvc-error">{errors.password.message}</p>}
      </div>

      <div className="flex flex-col gap-[6px]">
        <label className="text-[13.5px] font-semibold text-bvc-muted">Xác nhận mật khẩu</label>
        <input
          {...register("confirmPassword", { required: "Vui lòng xác nhận mật khẩu" })}
          type="password"
          placeholder="Nhập lại mật khẩu"
          className="h-[50px] w-full rounded-[15px] border border-bvc-border-strong bg-white px-[14px] text-[15px] text-bvc-ink placeholder:text-bvc-faint focus:border-bvc-accent focus:outline-none"
        />
        {errors.confirmPassword && <p className="text-[12.5px] text-bvc-error">{errors.confirmPassword.message}</p>}
      </div>

      {error && (
        <p className="rounded-[12px] bg-bvc-accent-tint px-[12px] py-[9px] text-[13.5px] text-bvc-accent-text">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-[2px] min-h-[52px] cursor-pointer rounded-[16px] bg-bvc-ink text-[16px] font-bold text-white disabled:opacity-50"
      >
        {isLoading ? "Đang đăng ký..." : "Đăng ký"}
      </button>
    </form>
  );
}
