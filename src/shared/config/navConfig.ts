import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgeCheck,
  Bell,
  ClipboardCheck,
  ClipboardList,
  Flame,
  FolderTree,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  Megaphone,
  Music2,
  Route,
  Settings2,
  SlidersHorizontal,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { ROLES } from "@/shared/constants/roles";

export interface NavItem {
  label: string;
  to: string;
  icon?: LucideIcon;
}

// Menu duy nhất của giảng viên, TeacherShell render cho mọi trang có sidebar
export const TEACHER_NAV: NavItem[] = [
  { label: "Trang chủ GV", to: "/teacher/home", icon: LayoutDashboard },
  { label: "Lớp học", to: "/teacher/classes", icon: GraduationCap },
  { label: "Lộ trình học tập", to: "/teacher/roadmap", icon: Route },
  { label: "Bài tập", to: "/teacher/assignments", icon: ClipboardList },
  { label: "Quản lý thử thách", to: "/teacher/challenges", icon: Flame },
  { label: "Tiến độ sinh viên", to: "/teacher/progress", icon: TrendingUp },
  { label: "Duyệt bài nộp", to: "/teacher/review", icon: ClipboardCheck },
  { label: "Đánh giá sinh viên", to: "/teacher/student-review", icon: UserCheck },
  { label: "Thư viện bài hát", to: "/songs", icon: Music2 },
  // Thư viện công khai, xem bài hát và bản nhạc giống sinh viên
  { label: "Thư viện công khai", to: "/library", icon: LibraryBig },
  { label: "Phân loại nội dung", to: "/categories", icon: FolderTree },
  { label: "Nội dung đã xác minh", to: "/community/verified", icon: BadgeCheck },
  { label: "Bảng xếp hạng", to: "/leaderboard", icon: Trophy },
  { label: "Thông báo", to: "/notifications", icon: Bell },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Tổng quan", to: "/admin", icon: LayoutDashboard },
  { label: "Người dùng", to: "/admin/users", icon: Users },
  { label: "Cấu hình hệ thống", to: "/admin/config", icon: Settings2 },
  { label: "Phân loại nội dung", to: "/admin/categories", icon: FolderTree },
  { label: "Lộ trình học tập", to: "/admin/roadmaps", icon: Route },
  { label: "Cấu hình chấm điểm", to: "/admin/grading-settings", icon: SlidersHorizontal },
  { label: "Giám sát hệ thống", to: "/admin/monitoring", icon: Activity },
  { label: "Quản lý thông báo", to: "/admin/notifications", icon: Megaphone },
  { label: "Nội dung đã xác minh", to: "/community/verified", icon: BadgeCheck },
  { label: "Bảng xếp hạng", to: "/leaderboard", icon: Trophy },
];

export const NAV_BY_ROLE: Record<number, NavItem[]> = {
  [ROLES.TEACHER]: TEACHER_NAV,
  [ROLES.SYSTEM_ADMIN]: ADMIN_NAV,
};
