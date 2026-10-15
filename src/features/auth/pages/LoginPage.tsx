import { GoogleLogin } from "@react-oauth/google";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginPage() {
  const { login, isLoading, error } = useLogin();

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

        {/* Form */}
        <LoginForm />

        {/* Divider + Google / FPT SSO */}
        <div className="flex flex-col gap-[12px]">
          <div className="flex items-center gap-[12px]">
            <span className="h-px flex-1 bg-bvc-border-strong" />
            <span className="text-[12.5px] text-bvc-faint">hoặc đăng nhập bằng Google (FPT)</span>
            <span className="h-px flex-1 bg-bvc-border-strong" />
          </div>

          <div className="flex w-full justify-center">
            <GoogleLogin
              onSuccess={({ credential }) => {
                if (credential) void login(credential);
              }}
              onError={() => undefined}
              useOneTap={false}
              width="380"
              size="large"
              text="continue_with"
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
          Hệ thống tự nhận vai trò từ tài khoản: sinh viên, giảng viên, quản trị hoặc đơn vị cho thuê nhạc cụ.
        </p>
      </div>
    </div>
  );
}
