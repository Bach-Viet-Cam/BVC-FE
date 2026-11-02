import { StatusScreen } from "@/shared/components/bvc/StatusScreen";

export function ForbiddenPage() {
  return (
    <StatusScreen
      code="403"
      title="Không có quyền truy cập"
      description="Tài khoản của bạn không được mở trang này. Nếu cần quyền, hãy liên hệ giảng viên hoặc quản trị viên."
    />
  );
}
