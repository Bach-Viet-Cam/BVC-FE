import { Bot } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { RoleShell } from "@/shared/components/bvc/RoleShell";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";

// M06 Trung tâm trợ giúp: BE chưa có API trợ lý hỗ trợ / câu hỏi thường gặp
export function HelpCenterPage() {
  return (
    <RoleShell title="Trợ lý hỗ trợ" subtitle="Hỏi đáp về cách dùng hệ thống và quy định môn học.">
      <EmptyState
        icon={<Bot className="size-8" strokeWidth={1.5} />}
        title="Trợ lý hỗ trợ chưa sẵn sàng"
        description="Tính năng hỏi đáp sẽ hiện ở đây khi hệ thống mở. Trong lúc chờ, bạn có thể xem thông báo mới từ giảng viên."
        actions={
          <Link to="/notifications" className={actionButtonClass("primary", "md", "hover:text-white")}>
            Xem thông báo
          </Link>
        }
      />
    </RoleShell>
  );
}
