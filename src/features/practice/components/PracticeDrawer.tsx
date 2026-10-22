import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface PracticeDrawerProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}

// Ngăn kéo phải 600px của bản laptop, phủ lên màn ghi âm. Cha cần `relative`.
export function PracticeDrawer({ title, subtitle, onClose, children }: PracticeDrawerProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <>
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 z-[70] cursor-pointer bg-bvc-ink/40"
      />
      <aside
        role="dialog"
        aria-label={title}
        className="absolute inset-y-0 right-0 z-[80] flex w-150 max-w-full flex-col bg-white shadow-[-12px_0_40px_rgba(18,63,51,0.12)]"
      >
        <header className="flex h-19 shrink-0 items-center gap-4 border-b border-bvc-border px-8">
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-bvc-md border border-bvc-border-strong bg-white text-bvc-ink"
          >
            <X size={20} strokeWidth={1.8} />
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate font-bvc-display text-xl leading-tight font-extrabold tracking-[-0.02em] text-bvc-ink">
              {title}
            </span>
            {subtitle && <span className="text-[13px] text-bvc-muted">{subtitle}</span>}
          </div>
        </header>
        {children}
      </aside>
    </>
  );
}
