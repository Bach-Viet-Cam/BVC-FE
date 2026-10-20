import { Link, useLocation } from "react-router-dom";
import { Dialog, DialogClose, DialogDescription, DialogTitle } from "@/shared/components/ui/dialog";
import { BvcDialogPopup } from "@/shared/components/bvc/BvcDialogPopup";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { LIBRARY_MESSAGES } from "@/features/music-library/constants/musicLibraryConstants";

interface GuestSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  // Trang mở sau khi đăng nhập; mặc định quay lại trang đang xem
  redirectTo?: string;
}

// Khách bấm việc cần tài khoản (lưu, luyện tập...) thì mời đăng nhập thay vì chuyển trang ngay
export function GuestSaveDialog({
  open,
  onOpenChange,
  title = LIBRARY_MESSAGES.guestSaveTitle,
  description = LIBRARY_MESSAGES.guestSaveBody,
  redirectTo,
}: GuestSaveDialogProps) {
  const location = useLocation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BvcDialogPopup>
        <DialogTitle className="text-2xl font-extrabold tracking-[-0.02em] text-bvc-ink">{title}</DialogTitle>
        <DialogDescription className="text-[15px] leading-relaxed text-bvc-muted">{description}</DialogDescription>
        <div className="mt-2 flex flex-col gap-2">
          <Link
            to="/login"
            state={{ from: redirectTo ?? `${location.pathname}${location.search}` }}
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
