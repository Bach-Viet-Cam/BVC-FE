import { Outlet } from "react-router-dom";

export function MobileLayout() {
  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        <Outlet />
      </div>
    </div>
  );
}
