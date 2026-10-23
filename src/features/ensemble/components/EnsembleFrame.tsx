import type { ReactNode } from "react";

// Khung ứng dụng hòa tấu: toàn màn hình h-dvh, chống tràn, nền studio tương phản nhẹ
export function EnsembleFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh w-full justify-center overflow-hidden bg-bvc-surface/60">
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f4f7f5]">
        {children}
      </div>
    </div>
  );
}

