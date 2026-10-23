import { useNavigate } from "react-router-dom";
import { usePracticeDemo } from "@/features/practice/context/PracticeDemoContext";
import { MSG } from "@/features/practice/constants/practiceConstants";
import { cn } from "@/shared/utils/cn";

interface ResultBannerProps {
  // Vị trí do khung chứa quyết định: absolute trong PracticeFrame, fixed trong StudentShell
  className?: string;
}

// MSG-43: báo có kết quả phân tích, bấm để sang màn kết quả
export function ResultBanner({ className }: ResultBannerProps) {
  const navigate = useNavigate();
  const { bannerVisible, dismissBanner, lastSubmitted } = usePracticeDemo();

  if (!bannerVisible || !lastSubmitted) return null;

  return (
    <button
      type="button"
      onClick={() => {
        dismissBanner();
        navigate(`/practice/submissions/${lastSubmitted.submissionId}`);
      }}
      className={cn(
        "z-50 cursor-pointer rounded-bvc-lg bg-bvc-ink px-4 py-3 text-[13.5px] font-semibold text-white",
        className
      )}
    >
      {MSG.analyzed}
    </button>
  );
}
