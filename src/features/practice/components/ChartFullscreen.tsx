import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

export function ChartFullscreen({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return (
    <dialog ref={ref} onClose={onClose} className="m-0 h-dvh max-h-none w-screen max-w-none overflow-auto bg-white p-4 backdrop:bg-black/50 md:p-8" aria-label="Bi?u ?? to?n m?n h?nh">
      <div className="mx-auto flex h-full max-w-screen-2xl flex-col gap-4">
        <div className="flex justify-end"><button type="button" onClick={() => ref.current?.close()} className="rounded-full border border-bvc-border px-4 py-2 text-sm">Đóng</button></div>
        <div className="my-auto w-full">{children}</div>
      </div>
    </dialog>
  );
}
