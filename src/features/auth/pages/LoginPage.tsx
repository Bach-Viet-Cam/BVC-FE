import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col justify-center gap-[26px] overflow-hidden bg-white px-[24px]">

        {/* Logo + tagline */}
        <div className="flex flex-col gap-[14px]">
          <span className="flex size-[56px] items-center justify-center rounded-[20px] bg-bvc-accent text-white">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="16.5" r="3" />
              <circle cx="17.5" cy="14" r="3" />
              <path d="M10 16.5V6l10.5-2.5V14" />
            </svg>
          </span>
          <div className="flex flex-col gap-[6px]">
            <h1 className="m-0 text-[32px] font-extrabold tracking-[-0.03em] text-bvc-ink">
              Bách Việt Cầm
            </h1>
            <p className="m-0 text-[15px] leading-[1.55] text-bvc-muted">
              Luyện tập, thu âm và nhận phản hồi cho các môn nhạc cụ truyền thống.
            </p>
          </div>
        </div>

        {/* Form */}
        <LoginForm />

        {/* Divider + FPT SSO */}
        <div className="flex flex-col gap-[11px]">
          <div className="flex items-center gap-[12px]">
            <span className="h-px flex-1 bg-bvc-border-strong" />
            <span className="text-[12.5px] text-bvc-faint">hoặc</span>
            <span className="h-px flex-1 bg-bvc-border-strong" />
          </div>
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="min-h-[52px] cursor-pointer rounded-[16px] border border-bvc-border-strong bg-white text-[15px] font-semibold text-bvc-ink"
          >
            Đăng nhập bằng tài khoản FPT
          </button>
        </div>

        <p className="m-0 text-[12.5px] leading-[1.55] text-bvc-muted">
          Hệ thống tự nhận vai trò từ tài khoản: sinh viên, giảng viên, quản trị hoặc đơn vị cho thuê nhạc cụ.
        </p>
      </div>
    </div>
  );
}
