import { GoogleLogin } from "@react-oauth/google";
import { useLogin } from "@/features/auth/hooks/useLogin";

export function LoginForm() {
  const { login, isLoading, error } = useLogin();

  return (
    <div className="flex flex-col gap-4">
      <GoogleLogin
        onSuccess={({ credential }) => {
          if (credential) void login(credential);
        }}
        onError={() => undefined}
        useOneTap={false}
      />
      {isLoading && <p className="text-sm text-gray-600">Đang xác thực với Google...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
