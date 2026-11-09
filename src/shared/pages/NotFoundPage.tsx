import { StatusScreen } from "@/shared/components/bvc/StatusScreen";

export function NotFoundPage() {
  return (
    <StatusScreen
      code="404"
      title="Không tìm thấy trang"
      description="Đường dẫn có thể đã thay đổi hoặc không còn tồn tại."
    />
  );
}
