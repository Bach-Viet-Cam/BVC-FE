import { useAuth } from "@/shared/context/AuthContext";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-xl font-bold text-on-surface">Chào mừng, {user?.username}</h1>
    </div>
  );
}
