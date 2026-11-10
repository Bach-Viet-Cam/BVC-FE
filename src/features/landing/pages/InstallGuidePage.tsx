import { Link, useLocation, useNavigate } from "react-router-dom";
import { MotionConfig, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import bannerImage from "@/assets/image/Artboard 3.png";
import logoImage from "@/assets/image/logo.png";
import { InstallGuideSteps } from "@/features/landing/components/InstallGuideSteps";
import { PillLink } from "@/shared/components/bvc/PillLink";
import { usePageMeta } from "@/shared/hooks/usePageMeta";

export function InstallGuidePage() {
  usePageMeta({
    title: "Thêm vào màn hình",
    description: "Hướng dẫn cài Bách Việt Cầm lên iPhone, iPad và máy tính bằng Chrome hoặc Edge.",
  });
  const navigate = useNavigate();
  const location = useLocation();
  // Mở thẳng bằng đường dẫn thì không có trang trước để lùi về
  const goBack = () => (location.key === "default" ? navigate("/") : navigate(-1));

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen bg-bvc-soft text-bvc-ink">
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative isolate overflow-hidden bg-bvc-ink"
        >
          <motion.img
            src={bannerImage}
            alt=""
            aria-hidden
            initial={{ scale: 1.08 }}
            animate={{ scale: 1.18 }}
            transition={{ duration: 24, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0 -z-10 size-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-b from-bvc-ink/85 via-bvc-ink/70 to-bvc-ink/95"
          />
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 pt-6 pb-14 sm:px-6 lg:px-8 lg:pt-8 lg:pb-20">
            <motion.nav
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              aria-label="Điều hướng trang cài đặt"
              className="flex items-center justify-between gap-4"
            >
              <Link to="/" className="shrink-0 transition-opacity hover:opacity-80">
                <img src={logoImage} alt="Bách Việt Cầm" className="h-12 w-auto lg:h-14" />
              </Link>
              <PillLink onClick={goBack} label="Quay lại" variant="glass" size="md" icon={ArrowLeft} iconFirst />
            </motion.nav>
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              className="max-w-[760px] font-bvc-display text-[34px] leading-[1.1] font-semibold tracking-[-0.03em] text-balance text-white sm:text-[44px] lg:text-[56px]"
            >
              Cài Bách Việt Cầm lên <em className="text-bvc-accent-border italic">điện thoại và máy tính</em>
            </motion.h1>
          </div>
        </motion.header>

        <div className="mx-auto w-full max-w-[1248px] px-4 py-10 md:px-6 lg:py-14">
          <InstallGuideSteps />
        </div>
      </main>
    </MotionConfig>
  );
}
