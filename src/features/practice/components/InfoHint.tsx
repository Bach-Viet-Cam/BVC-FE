import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";

interface InfoHintProps {
  label: string;
  children: ReactNode;
}

// Nút "i" trong vòng tròn, bấm để hiện lời giải thích. z cao hơn ngăn kéo (z-80) của màn ghi âm
export function InfoHint({ label, children }: InfoHintProps) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={label}
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-bvc-muted"
      >
        <Info size={18} strokeWidth={1.8} />
      </PopoverTrigger>
      <PopoverContent positionerClassName="z-[90]" className="text-[13px] leading-normal text-bvc-ink">
        {children}
      </PopoverContent>
    </Popover>
  );
}
