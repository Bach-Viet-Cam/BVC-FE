import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Step = "email" | "otp" | "reset";

export function ForgotPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");

  const stepLabels: Record<Step, string> = {
    email: "1 / 3 · Nhập email",
    otp: "2 / 3 · Nhập mã OTP",
    reset: "3 / 3 · Đặt lại mật khẩu",
  };

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white px-[24px]">

        {/* Header */}
        <div className="flex items-center gap-[8px] pb-[10px] pt-[26px]">
          <button
            type="button"
            aria-label="Quay lại"
            onClick={() => (step === "email" ? navigate(-1) : setStep(step === "otp" ? "email" : "otp"))}
            className="flex size-[44px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] text-bvc-ink"
          >
            <ChevronLeft size={21} strokeWidth={1.8} />
          </button>
          <div className="flex flex-col gap-[1px]">
            <div className="text-[18px] font-extrabold tracking-[-0.02em] text-bvc-ink">Quên mật khẩu</div>
            <div className="text-[12px] text-bvc-muted">{stepLabels[step]}</div>
          </div>
        </div>

        {/* Step progress bar */}
        <div className="flex gap-[6px] px-[0px] pb-[28px] pt-[4px]">
          {(["email", "otp", "reset"] as Step[]).map((s, i) => {
            const idx = ["email", "otp", "reset"].indexOf(step);
            const thisIdx = i;
            return (
              <span
                key={s}
                className="h-[4px] flex-1 rounded-full"
                style={{
                  backgroundColor:
                    thisIdx < idx
                      ? "var(--color-bvc-ink)"
                      : thisIdx === idx
                      ? "var(--color-bvc-accent)"
                      : "var(--color-bvc-border)",
                }}
              />
            );
          })}
        </div>

        {/* Step: Email */}
        {step === "email" && (
          <div className="flex flex-col gap-[20px]">
            <div className="flex flex-col gap-[6px]">
              <p className="text-[15px] leading-[1.55] text-bvc-muted">
                Nhập email trường của bạn. Chúng tôi sẽ gửi mã xác nhận 6 chữ số.
              </p>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13.5px] font-semibold text-bvc-muted">Email trường</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anhtm@fpt.edu.vn"
                className="h-[50px] w-full rounded-[15px] border border-bvc-border-strong bg-white px-[14px] text-[15px] text-bvc-ink placeholder:text-bvc-faint focus:border-bvc-accent focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setStep("otp")}
              className="mt-[4px] min-h-[52px] cursor-pointer rounded-[16px] bg-bvc-ink text-[16px] font-bold text-white"
            >
              Gửi mã xác nhận
            </button>
          </div>
        )}

        {/* Step: OTP */}
        {step === "otp" && (
          <div className="flex flex-col gap-[20px]">
            <p className="text-[15px] leading-[1.55] text-bvc-muted">
              Mã đã gửi đến <strong className="text-bvc-ink">{email || "email của bạn"}</strong>. Nhập 6 chữ số bên dưới.
            </p>
            <div className="flex justify-between gap-[8px]">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    const next = [...otp];
                    next[i] = val;
                    setOtp(next);
                    if (val && i < 5) {
                      const nextInput = document.querySelectorAll<HTMLInputElement>("[data-otp]")[i + 1];
                      nextInput?.focus();
                    }
                  }}
                  data-otp
                  className="h-[56px] w-full rounded-[14px] border border-bvc-border-strong bg-white text-center font-bvc-mono text-[22px] font-semibold text-bvc-ink focus:border-bvc-accent focus:outline-none"
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep("reset")}
              className="mt-[4px] min-h-[52px] cursor-pointer rounded-[16px] bg-bvc-ink text-[16px] font-bold text-white"
            >
              Xác nhận
            </button>
            <button type="button" className="cursor-pointer text-center text-[13.5px] font-semibold text-bvc-accent-text">
              Gửi lại mã
            </button>
          </div>
        )}

        {/* Step: Reset password */}
        {step === "reset" && (
          <div className="flex flex-col gap-[20px]">
            <p className="text-[15px] leading-[1.55] text-bvc-muted">
              Nhập mật khẩu mới cho tài khoản của bạn.
            </p>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13.5px] font-semibold text-bvc-muted">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ít nhất 8 ký tự"
                className="h-[50px] w-full rounded-[15px] border border-bvc-border-strong bg-white px-[14px] text-[15px] text-bvc-ink placeholder:text-bvc-faint focus:border-bvc-accent focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13.5px] font-semibold text-bvc-muted">Xác nhận mật khẩu</label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                className="h-[50px] w-full rounded-[15px] border border-bvc-border-strong bg-white px-[14px] text-[15px] text-bvc-ink placeholder:text-bvc-faint focus:border-bvc-accent focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-[4px] min-h-[52px] cursor-pointer rounded-[16px] bg-bvc-ink text-[16px] font-bold text-white"
            >
              Đặt lại mật khẩu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
