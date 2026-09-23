import { Link } from "react-router-dom";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg border p-8 shadow-sm">
        <div className="mb-6"><h1 className="text-2xl font-bold">Đăng nhập</h1></div>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-gray-600">
          Chưa có tài khoản? <Link to="/register" className="text-blue-600 hover:underline">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}
