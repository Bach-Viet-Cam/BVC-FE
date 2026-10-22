import { GoogleLogin } from "@react-oauth/google";
import { Navigate } from "react-router-dom";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { useAuth } from "@/shared/context/AuthContext";
import { getRoleHome } from "@/shared/utils/roleHome";

export function LoginPage() {
  const { login, isLoading, error, setError } = useLogin();
  const { user, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) return <p className="p-6 text-center text-bvc-muted">Đang kiểm tra phiên đăng nhập...</p>;
  if (user) return <Navigate to={getRoleHome(user.role)} replace />;

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex min-h-dvh w-full max-w-[428px] flex-col justify-center gap-[22px] overflow-y-auto bg-white px-[24px] py-[24px]">
        {/* Logo + tagline */}
        <div className="flex flex-col gap-[14px]">
          <span className="flex size-[56px] items-center justify-center rounded-[20px] bg-bvc-accent text-white">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="7" cy="16.5" r="3" />
              <circle cx="17.5" cy="14" r="3" />
              <path d="M10 16.5V6l10.5-2.5V14" />
            </svg>
          </span>
          <div className="flex flex-col gap-[6px]">
            <h1 className="m-0 text-[32px] font-extrabold tracking-[-0.03em] text-bvc-ink">Bách Việt Cầm</h1>
            <p className="m-0 text-[15px] leading-[1.55] text-bvc-muted">
              Luyện tập, thu âm và nhận phản hồi cho các môn nhạc cụ truyền thống.
            </p>
          </div>
        </div>

        {/* Google / FPT SSO */}
        <div className="flex flex-col gap-[12px]">
          <p className="m-0 text-center text-[14px] text-bvc-muted">Đăng nhập bằng tài khoản Google đã được cấp quyền.</p>

          <div className="flex w-full justify-center">
            <GoogleLogin
              onSuccess={({ credential }) => {
                if (credential) void login(credential);
                else setError("Google không trả về thông tin đăng nhập. Vui lòng thử lại.");
              }}
              onError={() => setError("Không thể đăng nhập bằng Google. Vui lòng thử lại.")}
              useOneTap={false}
              width="380"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>
          {isLoading && <p className="text-center text-sm text-bvc-muted">Đang xử lý đăng nhập Google...</p>}
          {error && (
            <p className="rounded-[12px] bg-red-50 px-[12px] py-[8px] text-center text-[13px] text-bvc-error">
              {error}
            </p>
          )}
        </div>

        <p className="m-0 text-[12.5px] leading-[1.55] text-bvc-muted">
          Vai trò của bạn do quản trị viên cấp theo tài khoản trong hệ thống.
        </p>
      </div>
    </div>
  );
}
