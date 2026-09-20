import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { loginSchema, type LoginFormValues } from "@/features/auth/utils/validateLogin";

export function LoginForm() {
  const { login, isLoading, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(login)} className="flex flex-col gap-4">
      <div>
        <input
          {...register("email")}
          type="email"
          placeholder="Email"
          className="w-full rounded border px-3 py-2"
        />
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <input
          {...register("password")}
          type="password"
          placeholder="Mật khẩu"
          className="w-full rounded border px-3 py-2"
        />
        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
      </div>

      {error && <p className="text-sm text-red-500">Đăng nhập thất bại</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Đang xử lý..." : "Đăng nhập"}
      </button>
    </form>
  );
}
