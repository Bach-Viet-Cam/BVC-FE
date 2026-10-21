import { ROLES } from "@/shared/constants/roles";

export interface NavItem {
  label: string;
  to: string;
}

// Menu duy nhất của giảng viên, TeacherShell render cho mọi trang có sidebar
export const TEACHER_NAV: NavItem[] = [
  { label: "Trang chủ GV", to: "/teacher/home" },
  { label: "Lớp học", to: "/teacher/classes" },
  { label: "Lộ trình học tập", to: "/teacher/roadmap" },
  { label: "Bài tập", to: "/teacher/assignments" },
  { label: "Tiến độ sinh viên", to: "/teacher/progress" },
  { label: "Duyệt bài nộp", to: "/teacher/review" },
  { label: "Đánh giá sinh viên", to: "/teacher/student-review" },
  { label: "Thư viện bài hát", to: "/songs" },
  { label: "Phân loại nội dung", to: "/categories" },
  { label: "Nội dung đã xác minh", to: "/community/verified" },
  { label: "Thông báo", to: "/notifications" },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Tổng quan", to: "/admin" },
  { label: "Người dùng", to: "/admin/users" },
  { label: "Cấu hình hệ thống", to: "/admin/config" },
  { label: "Phân loại nội dung", to: "/admin/categories" },
  { label: "Giám sát hệ thống", to: "/admin/monitoring" },
  { label: "Quản lý thông báo", to: "/admin/notifications" },
  { label: "Nội dung đã xác minh", to: "/community/verified" },
];

export interface StudentTab extends NavItem {
  icon: "home" | "practice" | "library" | "assignments";
}

export const STUDENT_TABS: StudentTab[] = [
  { label: "Hôm nay", to: "/home", icon: "home" },
  { label: "Luyện tập", to: "/practice/ly-ngua-o", icon: "practice" },
  { label: "Thư viện", to: "/library", icon: "library" },
  { label: "Bài tập", to: "/assignments", icon: "assignments" },
];

export const NAV_BY_ROLE: Record<number, NavItem[]> = {
  [ROLES.TEACHER]: TEACHER_NAV,
  [ROLES.SYSTEM_ADMIN]: ADMIN_NAV,
};
