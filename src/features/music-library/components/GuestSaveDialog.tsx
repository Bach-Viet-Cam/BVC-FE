import { Link, useLocation } from "react-router-dom";
import { Dialog, DialogClose, DialogDescription, DialogTitle } from "@/shared/components/ui/dialog";
import { BvcDialogPopup } from "@/shared/components/bvc/BvcDialogPopup";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { LIBRARY_MESSAGES } from "@/features/music-library/constants/musicLibraryConstants";

interface GuestSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuestSaveDialog({ open, onOpenChange }: GuestSaveDialogProps) {
  const location = useLocation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BvcDialogPopup>
        <DialogTitle className="text-2xl font-extrabold tracking-[-0.02em] text-bvc-ink">
          {LIBRARY_MESSAGES.guestSaveTitle}
        </DialogTitle>
        <DialogDescription className="text-[15px] leading-relaxed text-bvc-muted">
          {LIBRARY_MESSAGES.guestSaveBody}
        </DialogDescription>
        <div className="mt-2 flex flex-col gap-2">
          <Link
            to="/login"
            state={{ from: `${location.pathname}${location.search}` }}
            className={actionButtonClass("primary", "lg", "w-full hover:text-white")}
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-white text-[13px] font-extrabold text-bvc-ink">
              G
            </span>
            Đăng nhập bằng Google
          </Link>
          <DialogClose className={actionButtonClass("secondary", "lg", "w-full")}>Để sau</DialogClose>
        </div>
      </BvcDialogPopup>
    </Dialog>
  );
}
