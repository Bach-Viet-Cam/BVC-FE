import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePracticeDemo } from "@/features/practice/context/PracticeDemoContext";
import { MSG } from "@/features/practice/constants/practiceConstants";

interface PracticeFrameProps {
  children: ReactNode;
}

// Khung mobile dùng chung cho mọi màn luyện tập, kèm banner báo có kết quả (MSG-43)
export function PracticeFrame({ children }: PracticeFrameProps) {
  const navigate = useNavigate();
  const { songId } = useParams();
  const { bannerVisible, dismissBanner } = usePracticeDemo();

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="relative flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        {bannerVisible && (
          <button
            type="button"
            onClick={() => {
              dismissBanner();
              navigate(`/practice/${songId}/results`);
            }}
            className="absolute inset-x-3.5 top-3 z-50 cursor-pointer rounded-bvc-lg bg-bvc-ink px-4 py-3 text-[13.5px] font-semibold text-white"
          >
            {MSG.analyzed}
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
