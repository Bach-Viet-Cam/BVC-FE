import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "@/features/auth/hooks/useLogin";

interface LoginFields {
  email: string;
  password: string;
}

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFields>();
  const [showPassword, setShowPassword] = useState(false);
  const { loginWithEmail, isLoading, error } = useLogin();

  const onSubmit = async (data: LoginFields) => {
    await loginWithEmail(data.email, data.password);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[13px]">
      <div className="flex flex-col gap-[6px]">
        <label htmlFor="email" className="text-[13.5px] font-semibold text-bvc-muted">
          Email trường
        </label>
        <input
          {...register("email", { required: "Vui lòng nhập email" })}
          id="email"
          type="email"
          placeholder="anhtm@fpt.edu.vn"
          className="h-[50px] w-full rounded-[15px] border border-bvc-border-strong bg-white px-[14px] text-[15px] text-bvc-ink placeholder:text-bvc-faint focus:border-bvc-accent focus:outline-none"
        />
        {errors.email && (
          <p className="text-[12.5px] text-bvc-error">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-[6px]">
        <label htmlFor="password" className="text-[13.5px] font-semibold text-bvc-muted">
          Mật khẩu
        </label>
        <div className="relative flex">
          <input
            {...register("password", { required: "Vui lòng nhập mật khẩu" })}
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="h-[50px] w-full rounded-[15px] border border-bvc-border-strong bg-white pl-[14px] pr-[48px] text-[15px] text-bvc-ink placeholder:text-bvc-faint focus:border-bvc-accent focus:outline-none"
          />
          <button
            type="button"
            aria-label="Hiện mật khẩu"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-[5px] top-[5px] flex size-[40px] cursor-pointer items-center justify-center rounded-[12px] border-none bg-transparent text-bvc-muted"
          >
            {showPassword ? <EyeOff size={19} strokeWidth={1.6} /> : <Eye size={19} strokeWidth={1.6} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-[12.5px] text-bvc-error">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-[8px] text-[13.5px] text-bvc-muted">
          <input type="checkbox" defaultChecked className="size-[16px] accent-[#F4622E]" />
          Ghi nhớ thiết bị
        </label>
        <Link to="/forgot" className="text-[13.5px] font-semibold text-bvc-accent-text">
          Quên mật khẩu?
        </Link>
      </div>

      {error && (
        <p className="rounded-[12px] bg-red-50 px-[12px] py-[9px] text-[13.5px] text-bvc-error">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-[2px] min-h-[52px] cursor-pointer rounded-[16px] bg-bvc-ink text-[16px] font-bold text-white disabled:opacity-50"
      >
        {isLoading ? "Đang xử lý..." : "Đăng nhập"}
      </button>
    </form>
  );
}
