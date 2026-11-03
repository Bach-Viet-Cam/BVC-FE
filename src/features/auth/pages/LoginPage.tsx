import { GoogleLogin } from "@react-oauth/google";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LibraryBig } from "lucide-react";
import bannerImage from "@/assets/image/Artboard 3.png";
import logoImage from "@/assets/image/logo.png";
import { CreateAccountDialog } from "@/features/auth/components/CreateAccountDialog";
import { useGoogleButtonWidth } from "@/features/auth/hooks/useGoogleButtonWidth";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { PillLink } from "@/shared/components/bvc/PillLink";
import { Eyebrow } from "@/shared/components/bvc/SectionIntro";
import { useAuth } from "@/shared/context/AuthContext";
import { getRoleHome } from "@/shared/utils/roleHome";

// Đăng nhập trên nền ảnh BVC như trang giới thiệu: thẻ trắng ở giữa, nút Google, lối sang thư viện cho khách
export function LoginPage() {
  const { login, isLoading, error, setError, isCreateAccountOpen, confirmCreateAccount, cancelCreateAccount } =
    useLogin();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { containerRef, width: googleButtonWidth } = useGoogleButtonWidth();

  if (isAuthLoading) return <p className="p-6 text-center text-bvc-muted">Đang kiểm tra phiên đăng nhập...</p>;
  if (user) return <Navigate to={getRoleHome(user.role)} replace />;

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-bvc-ink text-white">
      <motion.img
        src={bannerImage}
        alt=""
        aria-hidden
        initial={{ scale: 1.08 }}
        animate={{ scale: 1.16 }}
        transition={{ duration: 24, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-bvc-ink/80 via-bvc-ink/65 to-bvc-ink/90"
        aria-hidden
      />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 pt-6 sm:px-6 lg:px-8">
        <Link to="/"className="shrink-0 transition-opacity hover:opacity-80">
          <img src={logoImage} alt="Bách Việt Cầm" className="h-11 w-auto lg:h-12" />
        </Link>
        <PillLink to="/"label="Tìm hiểu thêm" variant="glass" size="md" className="hidden sm:inline-flex" />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex w-full max-w-[440px] flex-col gap-7 rounded-[32px] bg-white px-6 py-9 text-bvc-ink shadow-2xl sm:px-9"
        >
          <div className="flex flex-col items-start gap-3">
            <Eyebrow>Chào mừng bạn</Eyebrow>
            <h1 className="font-bvc-display text-[30px] leading-[1.1] font-semibold tracking-[-0.03em] text-balance text-bvc-ink sm:text-[34px]">
              Đăng nhập để luyện đàn mỗi ngày
            </h1>
            <p className="text-[15px] leading-relaxed text-bvc-muted">
              Dùng tài khoản Google của bạn. Email chưa có trong hệ thống sẽ được hỏi tạo tài khoản sinh viên.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <div ref={containerRef} className="flex w-full justify-center">
              <GoogleLogin
                onSuccess={({ credential }) => {
                  if (credential) void login(credential);
                  else setError("Google không trả về thông tin đăng nhập. Vui lòng thử lại.");
                }}
                onError={() => setError("Không thể đăng nhập bằng Google. Vui lòng thử lại.")}
                useOneTap={false}
                width={String(googleButtonWidth)}
                size="large"
                text="signin_with"
                shape="pill"
                logo_alignment="center"
              />
            </div>
            {isLoading && <p className="m-0 text-center text-sm text-bvc-muted">Đang xử lý đăng nhập Google...</p>}
            {error && (
              <p className="m-0 rounded-[14px] bg-red-50 px-[14px] py-[10px] text-center text-[13px] text-bvc-error">
                {error}
              </p>
            )}
          </div>

          <Link
            to="/library"
            className="flex items-center gap-3 rounded-bvc-xl border border-bvc-border bg-bvc-soft p-4 text-bvc-ink transition-colors hover:bg-bvc-surface hover:text-bvc-ink"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-bvc-accent">
              <LibraryBig className="size-5" aria-hidden />
            </span>
            <span className="flex flex-col">
              <span className="text-[14.5px] font-semibold">Xem thư viện bài hát</span>
              <span className="text-[13px] text-bvc-muted">Không cần đăng nhập</span>
            </span>
          </Link>
        </motion.div>
      </main>

      <p className="m-0 pb-6 text-center text-[12px] font-medium tracking-[0.04em] text-white/60">
        © {new Date().getFullYear()} BÁCH VIỆT CẦM
      </p>

      <CreateAccountDialog
        open={isCreateAccountOpen}
        isLoading={isLoading}
        onConfirm={() => void confirmCreateAccount()}
        onCancel={cancelCreateAccount}
      />
    </div>
  );
}
