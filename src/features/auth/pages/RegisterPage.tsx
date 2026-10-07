import { Link } from "react-router-dom";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export function RegisterPage() {
  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col justify-center gap-[26px] overflow-hidden bg-white px-[24px]">
        <div className="flex flex-col gap-[14px]">
          <span className="flex size-[56px] items-center justify-center rounded-[20px] bg-bvc-accent text-white">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="16.5" r="3" />
              <circle cx="17.5" cy="14" r="3" />
              <path d="M10 16.5V6l10.5-2.5V14" />
            </svg>
          </span>
          <div className="flex flex-col gap-[6px]">
            <h1 className="m-0 text-[28px] font-extrabold tracking-[-0.03em] text-bvc-ink">
              Tạo tài khoản
            </h1>
            <p className="m-0 text-[15px] leading-[1.55] text-bvc-muted">
              Đăng ký để bắt đầu luyện tập nhạc cụ truyền thống.
            </p>
          </div>
        </div>

        <RegisterForm />

        <p className="text-center text-[13.5px] text-bvc-muted">
          Đã có tài khoản?{" "}
          <Link to="/login" className="font-semibold text-bvc-accent-text">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
