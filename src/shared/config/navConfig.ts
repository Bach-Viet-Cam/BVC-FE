import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgeCheck,
  BookOpen,
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
  Trophy,
  Users,
} from "lucide-react";
import { ROLES } from "@/shared/constants/roles";

export interface NavItem {
  label: string;
  to: string;
  icon?: LucideIcon;
  // Các đường dẫn khác vẫn tính là đang ở mục này (vd. trang bài tập mở từ tab của lớp)
  activePrefixes?: string[];
}

export interface NavGroup {
  label: string;
  icon?: LucideIcon;
  children: NavItem[];
}

export type NavEntry = NavItem | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}

export function flattenNav(entries: NavEntry[]): NavItem[] {
  return entries.flatMap((entry) => (isNavGroup(entry) ? entry.children : [entry]));
}

// Menu duy nhất của giảng viên, TeacherShell render cho mọi trang có sidebar.
// Lộ trình, bài tập, tiến độ, đánh giá bài nộp nằm trong tab của trang chi tiết lớp.
export const TEACHER_NAV: NavEntry[] = [
  { label: "Trang chủ", to: "/teacher/home", icon: LayoutDashboard },
  {
    label: "Lớp học",
    to: "/teacher/classes",
    icon: GraduationCap,
    activePrefixes: ["/teacher/assignments", "/teacher/roadmap", "/teacher/progress", "/teacher/review"],
  },
  {
    label: "Thử thách",
    icon: Flame,
    children: [
      { label: "Quản lý thử thách", to: "/teacher/challenges", icon: ClipboardList },
      { label: "Bảng xếp hạng", to: "/leaderboard", icon: Trophy },
    ],
  },
  {
    label: "Thư viện học liệu",
    icon: BookOpen,
    children: [
      { label: "Thư viện của tôi", to: "/songs", icon: Music2 },
      // Thư viện công khai, xem bài hát và bản nhạc giống sinh viên
      { label: "Thư viện công khai", to: "/library", icon: LibraryBig },
      { label: "Phân loại nội dung", to: "/categories", icon: FolderTree },
      { label: "Nội dung đã xác minh", to: "/community/verified", icon: BadgeCheck },
    ],
  },
];

const ADMIN_NAV: NavEntry[] = [
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

export const NAV_BY_ROLE: Record<number, NavEntry[]> = {
  [ROLES.TEACHER]: TEACHER_NAV,
  [ROLES.SYSTEM_ADMIN]: ADMIN_NAV,
};
