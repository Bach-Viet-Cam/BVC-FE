import { Toast as BaseToast } from "@base-ui/react/toast";
import { XIcon } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export const toastManager = BaseToast.createToastManager();

interface ToastOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  type?: "success" | "error" | "info";
}

export const toast = {
  success(title: React.ReactNode, description?: React.ReactNode) {
    return toastManager.add({ title, description, type: "success" });
  },
  error(title: React.ReactNode, description?: React.ReactNode) {
    return toastManager.add({ title, description, type: "error" });
  },
  info(title: React.ReactNode, description?: React.ReactNode) {
    return toastManager.add({ title, description, type: "info" });
  },
  custom(options: ToastOptions) {
    return toastManager.add(options);
  },
  close: (id?: string) => toastManager.close(id),
};

export function Toaster() {
  return (
    <BaseToast.Provider toastManager={toastManager}>
      <BaseToast.Portal>
        <BaseToast.Viewport className="fixed bottom-4 right-4 z-[100] flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2 outline-none">
          <ToastList />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}

function ToastList() {
  const { toasts } = BaseToast.useToastManager();
  return (
    <>
      {toasts.map((toastItem) => (
        <BaseToast.Root
          key={toastItem.id}
          toast={toastItem}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-4 shadow-level-2",
            "transition-all duration-200",
            "data-starting-style:translate-y-2 data-starting-style:opacity-0",
            "data-ending-style:translate-y-2 data-ending-style:opacity-0",
            "data-limited:opacity-0",
            toastItem.type === "success" && "border-primary/30 bg-surface-container-lowest",
            toastItem.type === "error" && "border-error/30 bg-error-container/20",
            (!toastItem.type || toastItem.type === "info") && "border-outline-variant/40 bg-surface-container-lowest"
          )}
        >
          <span
            className={cn(
              "mt-0.5 size-2 shrink-0 rounded-full",
              toastItem.type === "success" && "bg-primary",
              toastItem.type === "error" && "bg-error",
              (!toastItem.type || toastItem.type === "info") && "bg-secondary"
            )}
          />
          <div className="flex flex-1 flex-col gap-0.5">
            <BaseToast.Title className="text-sm font-semibold text-on-surface" />
            <BaseToast.Description className="text-sm text-on-surface-variant" />
          </div>
          <BaseToast.Close
            aria-label="Đóng thông báo"
            className="rounded p-0.5 text-on-surface-variant transition-colors hover:bg-primary/5 hover:text-primary"
          >
            <XIcon className="size-4" />
          </BaseToast.Close>
        </BaseToast.Root>
      ))}
    </>
  );
}
