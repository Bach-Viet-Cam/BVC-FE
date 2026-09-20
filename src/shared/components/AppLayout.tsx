import { Outlet } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { AppSidebar } from "@/shared/components/AppSidebar";
import { Button } from "@/shared/components/ui/button";

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-dvh">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end gap-3 border-b border-outline-variant/30 bg-surface-container-lowest px-6 py-3">
          <span className="text-sm text-on-surface-variant">{user?.username}</span>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="size-4" />
            Đăng xuất
          </Button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
