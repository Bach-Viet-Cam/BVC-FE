import type { ReactNode } from "react";
import { ResultBanner } from "@/features/practice/components/ResultBanner";

interface PracticeFrameProps {
  children: ReactNode;
}

// Khung dùng chung cho các màn luyện tập (trừ màn ghi âm và kết quả dùng StudentShell): cột 428px trên điện thoại, toàn màn hình từ md (laptop).
// Kèm banner báo có kết quả (MSG-43)
export function PracticeFrame({ children }: PracticeFrameProps) {
  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface md:bg-white">
      <div className="relative flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white md:max-w-none">
        <ResultBanner className="absolute inset-x-3.5 top-3 md:inset-x-auto md:top-24 md:right-8 md:w-96" />
        {children}
      </div>
    </div>
  );
}
