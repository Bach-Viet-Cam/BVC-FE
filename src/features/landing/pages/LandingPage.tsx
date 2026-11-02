import { MotionConfig } from "framer-motion";
import { LandingBenefits } from "@/features/landing/components/LandingBenefits";
import { LandingFeatures } from "@/features/landing/components/LandingFeatures";
import { LandingFooter } from "@/features/landing/components/LandingFooter";
import { LandingHero } from "@/features/landing/components/LandingHero";
import { LandingLibraryShowcase } from "@/features/landing/components/LandingLibraryShowcase";
import { LandingModules } from "@/features/landing/components/LandingModules";
import { LandingSteps } from "@/features/landing/components/LandingSteps";

// Trang giới thiệu công khai. Người dùng bật "giảm chuyển động" trong hệ điều hành thì tắt các hiệu ứng chạy.
export function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen scroll-smooth bg-white text-bvc-ink">
        <LandingHero />
        <LandingFeatures />
        <LandingSteps />
        <LandingBenefits />
        <LandingModules />
        <LandingLibraryShowcase />
        <LandingFooter />
      </main>
    </MotionConfig>
  );
}
