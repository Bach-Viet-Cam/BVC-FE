import { StatusScreen } from "@/shared/components/bvc/StatusScreen";

export function ForbiddenPage() {
  return (
    <StatusScreen
      code="403"
      title="Không có quyền truy cập"
      description="Tài khoản của bạn không có quyền mở trang này."
    />
  );
}
