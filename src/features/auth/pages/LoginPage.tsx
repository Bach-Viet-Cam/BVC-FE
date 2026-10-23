import { GoogleLogin } from "@react-oauth/google";
import { Navigate } from "react-router-dom";
import logoImage from "@/assets/image/logo.png";
import { CreateAccountDialog } from "@/features/auth/components/CreateAccountDialog";
import { LoginHero } from "@/features/auth/components/LoginHero";
import { useGoogleButtonWidth } from "@/features/auth/hooks/useGoogleButtonWidth";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { useAuth } from "@/shared/context/AuthContext";
import { getRoleHome } from "@/shared/utils/roleHome";

export function LoginPage() {
  const { login, isLoading, error, setError, isCreateAccountOpen, confirmCreateAccount, cancelCreateAccount } =
    useLogin();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { containerRef, width: googleButtonWidth } = useGoogleButtonWidth();

  if (isAuthLoading) return <p className="p-6 text-center text-bvc-muted">Đang kiểm tra phiên đăng nhập...</p>;
  if (user) return <Navigate to={getRoleHome(user.role)} replace />;

  return (
    <div className="min-h-dvh bg-bvc-surface lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:bg-white">
      {/* Cột đăng nhập: trên mobile có ảnh gọn ở đầu */}
      <div className="flex min-h-dvh flex-col px-[16px] pt-[16px] pb-[24px] sm:px-[32px] lg:px-[56px] lg:py-[40px]">
        <LoginHero className="h-[220px] shrink-0 sm:h-[300px] md:h-[360px] lg:hidden" />

        <div className="flex flex-1 items-center justify-center py-[28px] lg:py-[40px]">
          <div className="flex w-full max-w-[420px] flex-col items-center gap-[32px] rounded-[28px] bg-white px-[24px] py-[36px] sm:px-[32px] lg:rounded-none lg:p-0">
            <img src={logoImage} alt="Bách Việt Cầm" className="w-full max-w-[280px] object-contain" />

            <div className="flex w-full flex-col gap-[12px]">
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
          </div>
        </div>

        <p className="m-0 text-center text-[12px] font-medium tracking-[0.02em] text-bvc-faint">
          © {new Date().getFullYear()} BÁCH VIỆT CẦM
        </p>
      </div>

      {/* Cột ảnh: chỉ hiện từ màn hình lớn, dính theo khi cuộn */}
      <div className="hidden p-[20px] lg:block">
        <LoginHero className="sticky top-[20px] h-[calc(100dvh-40px)]" />
      </div>

      <CreateAccountDialog
        open={isCreateAccountOpen}
        isLoading={isLoading}
        onConfirm={() => void confirmCreateAccount()}
        onCancel={cancelCreateAccount}
      />
    </div>
  );
}
