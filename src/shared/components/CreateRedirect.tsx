import { generatePath, Navigate, useLocation, useParams } from "react-router-dom";
import { CREATE_PARAM } from "@/shared/hooks/useCreateDialog";

interface CreateRedirectProps {
  // Trang chứa modal tạo mới, có thể có tham số (vd. /teacher/classes/:classId)
  to: string;
  // Tên modal, khớp với useCreateDialog(name) của trang đích
  name: string;
}

// Tạo mới giờ mở bằng modal: đường dẫn ".../new" cũ chuyển về trang danh sách và mở sẵn modal,
// giữ nguyên các giá trị điền sẵn trên URL (vd. ?classId=...&kind=...)
export function CreateRedirect({ to, name }: CreateRedirectProps) {
  const params = useParams();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  query.set(CREATE_PARAM, name);

  return <Navigate to={`${generatePath(to, params)}?${query.toString()}`} replace />;
}
