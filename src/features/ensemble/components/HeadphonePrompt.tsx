import { Headphones, Speaker } from "lucide-react";
import { HeadphonePlugAnimation } from "@/features/ensemble/components/HeadphonePlugAnimation";
import { type ListeningMode } from "@/features/ensemble/types/ensembleTypes";
import { Dialog, DialogClose, DialogDescription, DialogPopup, DialogTitle } from "@/shared/components/ui/dialog";

interface HeadphonePromptProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onChoose: (mode: ListeningMode) => void;
}

export function HeadphonePrompt({ isOpen, onOpenChange, onChoose }: HeadphonePromptProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-[460px] items-center gap-4 rounded-[22px] border-bvc-border p-6 text-center">
        <DialogClose />
        <HeadphonePlugAnimation className="mt-2" />
        <DialogTitle className="font-bvc-display text-[20px] font-extrabold text-bvc-ink">
          Chưa thấy tai nghe
        </DialogTitle>
        <DialogDescription className="text-[13.5px] leading-relaxed text-bvc-muted">
          Hãy cắm hoặc kết nối tai nghe để các bè ảo chỉ phát vào tai bạn, micro sẽ chỉ thu tiếng đàn của bạn. Màn hình
          tự nhận khi tai nghe được kết nối. Bạn vẫn có thể thu bằng loa ngoài: hệ thống bật khử vọng, nhưng bản thu có
          thể lẫn một phần tiếng bè.
        </DialogDescription>
        <div className="flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={() => onChoose("headphones")}
            className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[15px] bg-bvc-ink text-[15px] font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.99]"
          >
            <Headphones size={18} />
            Tôi đã đeo tai nghe
          </button>
          <button
            type="button"
            onClick={() => onChoose("speaker")}
            className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[15px] border border-bvc-border-strong bg-white text-[14.5px] font-semibold text-bvc-ink transition-colors hover:bg-bvc-surface active:scale-[0.99]"
          >
            <Speaker size={18} />
            Thu bằng loa ngoài
          </button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
