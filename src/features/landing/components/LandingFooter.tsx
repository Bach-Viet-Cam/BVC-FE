import { motion } from "framer-motion";
import { Mail, MapPin, MessageSquareText, Phone, type LucideIcon } from "lucide-react";
import bannerImage from "@/assets/image/Artboard 3.png";
import { PillLink } from "@/shared/components/bvc/PillLink";
import { Accent, SectionBadge } from "@/shared/components/bvc/SectionIntro";
import { useLandingAccount } from "@/features/landing/hooks/useLandingAccount";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_DISPLAY,
  FEEDBACK_FORM_URL,
} from "@/shared/constants/contact";
import { cn } from "@/shared/utils/cn";

interface ContactItem {
  caption: string;
  value: string;
  icon: LucideIcon;
  href?: string;
  isExternal?: boolean;
}

const CONTACT_ITEMS: ContactItem[] = [
  { caption: "Email", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, icon: Mail },
  { caption: "Điện thoại", value: CONTACT_PHONE_DISPLAY, href: `tel:${CONTACT_PHONE}`, icon: Phone },
  { caption: "Địa chỉ", value: CONTACT_ADDRESS, icon: MapPin },
  { caption: "Góp ý", value: "Gửi góp ý", href: FEEDBACK_FORM_URL, isExternal: true, icon: MessageSquareText },
];

const VALUE_CLASS = "text-[17px] font-medium [overflow-wrap:anywhere] text-bvc-ink";

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.21, 0.45, 0.32, 0.9] as const } },
};

// Lời mời bắt đầu và chân trang trên nền ảnh BVC
export function LandingFooter() {
  const { isLoading: isAccountLoading, accountLabel, homePath } = useLandingAccount();
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
        <motion.address
          aria-labelledby="footer-contact-heading"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="flex flex-col gap-8 rounded-[28px] border border-white/60 bg-white/55 p-8 not-italic backdrop-blur-xl md:p-10"
        >
          <motion.p
            id="footer-contact-heading"
            variants={itemVariants}
            className="font-bvc-display text-[24px] font-semibold tracking-[-0.02em] text-bvc-ink"
          >
            Liên hệ
          </motion.p>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[repeat(4,auto)] lg:justify-between lg:gap-10">
            {CONTACT_ITEMS.map((item) => (
              <motion.li key={item.caption} variants={itemVariants} className="flex min-w-0 items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-[13px] bg-white/80 text-bvc-accent">
                  <item.icon className="size-[18px]" strokeWidth={1.9} aria-hidden />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[13.5px] text-bvc-ink/60">{item.caption}</span>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.isExternal ? "_blank" : undefined}
                      rel={item.isExternal ? "noopener noreferrer" : undefined}
                      className={cn(VALUE_CLASS, "underline-offset-4 hover:text-bvc-accent hover:underline")}
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className={VALUE_CLASS}>{item.value}</span>
                  )}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.address>

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
