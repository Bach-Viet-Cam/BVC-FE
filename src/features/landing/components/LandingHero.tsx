import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Music2, X } from "lucide-react";
import bannerImage from "@/assets/image/Artboard 3.png";
import logoImage from "@/assets/image/logo.png";
import { InstallAppButton } from "@/features/landing/components/InstallAppButton";
import { PillLink } from "@/shared/components/bvc/PillLink";
import { useLandingAccount } from "@/features/landing/hooks/useLandingAccount";
import { cn } from "@/shared/utils/cn";
import { LANDING_INSTRUMENTS, LANDING_NAV } from "@/features/landing/constants/landingContent";

const DESKTOP_NAV_LINK = "text-[15px] font-medium text-white/80 transition-colors hover:text-white";
const MOBILE_NAV_LINK = "font-bvc-display text-2xl font-semibold text-bvc-ink";

// Phần đầu trang: thanh điều hướng, tiêu đề, nút bắt đầu và dải tên nhạc cụ chạy ngang trên nền ảnh BVC
export function LandingHero() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoading: isAccountLoading, accountLabel, homePath } = useLandingAccount();

  // Mở menu mobile thì khóa cuộn trang phía sau
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative min-h-[760px] w-full overflow-hidden bg-bvc-ink lg:min-h-[860px]"
    >
      <motion.img
        src={bannerImage}
        alt=""
        aria-hidden
        initial={{ scale: 1.08 }}
        animate={{ scale: 1.18 }}
        transition={{ duration: 24, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bvc-ink/85 via-bvc-ink/70 to-bvc-ink/95" aria-hidden />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-6 pb-12 sm:px-6 lg:px-8 lg:pt-8">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          aria-label="Điều hướng trang giới thiệu"
          className="flex items-center justify-between gap-4"
        >
          <Link to="/" className="shrink-0 transition-opacity hover:opacity-80">
            <img src={logoImage} alt="Bách Việt Cầm" className="h-12 w-auto lg:h-14" />
          </Link>

          <ul className="hidden items-center gap-8 lg:flex">
            {LANDING_NAV.map((item) => (
              <li key={item.href}>
                {item.isRoute ? (
                  <Link to={item.href} className={DESKTOP_NAV_LINK}>
                    {item.label}
                  </Link>
                ) : (
                  <a href={item.href} className={DESKTOP_NAV_LINK}>
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <PillLink
              to={homePath}
              label={accountLabel}
              variant="glass"
              size="md"
              className={cn("hidden max-w-[260px] sm:inline-flex", isAccountLoading && "invisible")}
            />
            <button
              type="button"
              aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
              className="cursor-pointer rounded-full bg-white/15 p-2 text-white backdrop-blur-md lg:hidden"
            >
              {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </motion.nav>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[100] flex flex-col gap-8 bg-white px-6 py-8 lg:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-2xl bg-bvc-ink px-3 py-2">
                  <img src={logoImage} alt="Bách Việt Cầm" className="h-9 w-auto" />
                </span>
                <button
                  type="button"
                  aria-label="Đóng menu"
                  onClick={() => setIsMenuOpen(false)}
                  className="cursor-pointer rounded-full bg-bvc-ink/5 p-2 text-bvc-ink"
                >
                  <X className="size-6" />
                </button>
              </div>
              <ul className="flex flex-col gap-6">
                {LANDING_NAV.map((item, index) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * index, ease: "easeOut" }}
                  >
                    {item.isRoute ? (
                      <Link to={item.href} className={MOBILE_NAV_LINK}>
                        {item.label}
                      </Link>
                    ) : (
                      <a href={item.href} onClick={() => setIsMenuOpen(false)} className={MOBILE_NAV_LINK}>
                        {item.label}
                      </a>
                    )}
                  </motion.li>
                ))}
              </ul>
              <Link
                to={homePath}
                className={cn(
                  "mt-auto truncate rounded-full bg-bvc-ink px-6 py-4 text-center text-lg font-medium text-white hover:text-white",
                  isAccountLoading && "invisible"
                )}
              >
                {accountLabel}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-14 flex flex-col items-center lg:mt-24">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="mb-6 flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-center text-[14px] font-medium text-white backdrop-blur-sm sm:text-[15px]"
          >
            Nền tảng luyện nhạc cụ dân tộc cho sinh viên Đại Học FPT
          </motion.p>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-[920px] text-center text-balance font-bvc-display text-[38px] leading-[1.08] font-semibold tracking-[-0.035em] text-white sm:text-[52px] lg:text-[68px]"
          >
            Luyện đàn dân tộc với <em className="text-bvc-accent-border italic">phản hồi</em> sau mỗi lần thu
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
            className="mt-5 w-full max-w-[640px] text-center text-[17px] leading-relaxed text-white/85 lg:text-[19px]"
          >
            Chọn bài trong thư viện, thu âm ngay trên điện thoại hoặc máy tính, rồi nhận điểm cao độ, nhịp cùng nhận xét
            chi tiết để biết lần sau cần luyện gì.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
            className="mt-9 flex flex-col items-center gap-3 lg:mt-12"
          >
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <PillLink to={homePath} label="Bắt đầu luyện tập" variant="light" />
              <PillLink to="/library" label="Xem thư viện bài hát" variant="glass" />
            </div>
            <InstallAppButton />
          </motion.div>

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
            className="mt-20 flex w-full flex-col items-center gap-8 lg:mt-36"
          >
            <p className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-center text-[14px] font-medium text-white backdrop-blur-sm lg:text-[15px]">
              Bản nhạc và bản thu mẫu cho các nhạc cụ
            </p>
            <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
              <motion.ul
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 22, ease: "linear", repeat: Infinity }}
                className="flex w-fit items-center gap-12 sm:gap-16 lg:gap-20"
              >
                {[0, 1].map((copy) => (
                  <Fragment key={copy}>
                    {LANDING_INSTRUMENTS.map((instrument) => (
                      <li
                        key={`${copy}-${instrument}`}
                        aria-hidden={copy === 1}
                        className="flex items-center gap-2.5 font-bvc-display text-[22px] font-semibold whitespace-nowrap text-white/85 lg:text-[30px]"
                      >
                        <Music2 className="size-5 text-bvc-accent-border lg:size-6" aria-hidden />
                        {instrument}
                      </li>
                    ))}
                  </Fragment>
                ))}
              </motion.ul>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
