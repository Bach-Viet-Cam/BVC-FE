import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import bannerImage from "@/assets/image/Artboard 3.png";
import { PillLink } from "@/shared/components/bvc/PillLink";
import { Accent, SectionBadge } from "@/shared/components/bvc/SectionIntro";
import { useLandingAccount } from "@/features/landing/hooks/useLandingAccount";
import { cn } from "@/shared/utils/cn";

interface FooterLink {
  label: string;
  href: string;
  isRoute?: boolean;
}

const STATIC_FOOTER_COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Tính năng",
    links: [
      { label: "Tính năng chính", href: "#features" },
      { label: "Lợi ích", href: "#benefits" },
      { label: "Thêm vào màn hình", href: "/install", isRoute: true },
    ],
  },
];

const LINK_CLASS = "text-[17px] text-bvc-ink/80 transition-colors hover:text-bvc-ink";

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.21, 0.45, 0.32, 0.9] as const } },
};

// Lời mời bắt đầu và chân trang trên nền ảnh BVC
export function LandingFooter() {
  const { isLoading: isAccountLoading, accountLabel, homePath } = useLandingAccount();
  const footerColumns = [
    {
      title: "Khám phá",
      links: [
        { label: "Thư viện bài hát", href: "/library", isRoute: true },
        ...(isAccountLoading ? [] : [{ label: accountLabel, href: homePath, isRoute: true }]),
      ],
    },
    ...STATIC_FOOTER_COLUMNS,
  ];

  return (
    <footer className="relative flex w-full flex-col items-center overflow-hidden">
      <div className="absolute inset-0" aria-hidden>
        <img src={bannerImage} alt="" className="size-full object-cover object-[center_75%]" />
        <div className="absolute inset-0 bg-white/20" />
        <div className="absolute inset-x-0 top-0 h-[75%] bg-gradient-to-b from-white via-white/90 to-transparent" />
      </div>

      <section className="relative z-10 flex w-full max-w-[1248px] flex-col items-center px-6 pt-28">
        <SectionBadge className="mb-8">Sẵn sàng luyện đàn</SectionBadge>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-4 max-w-[760px] text-center font-bvc-display text-[40px] leading-[1.08] font-semibold tracking-[-0.035em] text-bvc-ink md:text-[66px]"
        >
          Bắt đầu bài <Accent>đầu tiên</Accent> của bạn hôm nay
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center gap-4 sm:flex-row"
        >
          <PillLink
            to={homePath}
            label={accountLabel}
            className={cn("max-w-[300px]", isAccountLoading && "invisible")}
          />
          <PillLink to="/library" label="Xem thư viện" variant="light" />
        </motion.div>
      </section>

      <div className="relative z-10 flex w-full max-w-[1248px] flex-col px-6 pt-20 pb-8">
        <motion.nav
          aria-label="Liên kết chân trang"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="flex flex-col gap-12 rounded-[28px] border border-white/60 bg-white/55 p-8 backdrop-blur-xl md:p-10 lg:flex-row lg:gap-24"
        >
          <motion.div variants={itemVariants} className="flex max-w-[380px] flex-col gap-3">
            <p className="font-bvc-display text-[24px] font-semibold tracking-[-0.02em] text-bvc-ink">Bách Việt Cầm</p>
            <p className="text-[17px] leading-relaxed text-bvc-ink/80">
              Nền tảng luyện nhạc cụ dân tộc: thư viện bản nhạc, nhận xét bản thu với hỗ trợ từ AI, hòa tấu và lớp học
              có lộ trình.
            </p>
          </motion.div>
          <div className="grid gap-10 sm:grid-cols-2 lg:ml-auto lg:gap-16">
            {footerColumns.map((column) => (
              <motion.div key={column.title} variants={itemVariants} className="flex flex-col gap-4">
                <p className="font-bvc-display text-[20px] font-semibold text-bvc-ink">{column.title}</p>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.isRoute ? (
                        <Link to={link.href} className={LINK_CLASS}>
                          {link.label}
                        </Link>
                      ) : (
                        <a href={link.href} className={LINK_CLASS}>
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.nav>

        {/* <div className="overflow-hidden pt-10 select-none" aria-hidden>
          <motion.p
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.21, 0.45, 0.32, 0.9] }}
            className="text-center font-bvc-display text-[12.5vw] leading-none font-semibold tracking-[-0.05em] whitespace-nowrap text-white drop-shadow-[0_6px_30px_rgba(18,63,51,0.35)] xl:text-[164px]"
          >
            Bách Việt Cầm
          </motion.p>
        </div> */}

        <p className="mx-auto mt-8 w-fit rounded-full bg-bvc-ink/60 px-4 py-1.5 text-center text-[15px] font-medium text-white backdrop-blur-sm">
          © 2026 Bách Việt Cầm
        </p>
      </div>
    </footer>
  );
}
