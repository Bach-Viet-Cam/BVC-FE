import bannerImage from "@/assets/image/Artboard 3.png";
import logoImage from "@/assets/image/logo.png";
import { PillLink } from "@/shared/components/bvc/PillLink";
import { useAuth } from "@/shared/context/AuthContext";
import { getRoleHome } from "@/shared/utils/roleHome";

interface StatusScreenProps {
  code: string;
  title: string;
  description: string;
}

// Màn báo lỗi toàn trang (404, 403) trên nền ảnh BVC: mã lỗi lớn, lời giải thích và lối quay về
export function StatusScreen({ code, title, description }: StatusScreenProps) {
  const { user } = useAuth();
  const homePath = user ? getRoleHome(user.role) : "/";

  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-bvc-ink px-6 py-12 text-center text-white">
      <img src={bannerImage} alt="" aria-hidden className="absolute inset-0 -z-10 size-full object-cover" />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-bvc-ink/85 via-bvc-ink/75 to-bvc-ink/95"
        aria-hidden
      />

      <img src={logoImage} alt="Bách Việt Cầm" className="mb-10 h-12 w-auto" />
      <p className="font-bvc-display text-[96px] leading-none font-semibold tracking-[-0.05em] text-white/90 md:text-[140px]">
        {code}
      </p>
      <h1 className="mt-4 font-bvc-display text-[28px] font-semibold tracking-[-0.03em] text-white md:text-[36px]">
        {title}
      </h1>
      <p className="mt-3 max-w-[480px] text-[16px] leading-relaxed text-white/80">{description}</p>
      <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
        <PillLink to={homePath} label="Về trang chủ" variant="light" />
        <PillLink to="/library" label="Xem thư viện" variant="glass" />
      </div>
    </main>
  );
}
