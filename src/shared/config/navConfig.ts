import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgeCheck,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  Flame,
  FolderTree,
  GraduationCap,
  History,
  House,
  LayoutDashboard,
  LibraryBig,
  Megaphone,
  Music2,
  NotebookPen,
  Settings2,
  Trophy,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";
import { ROLES } from "@/shared/constants/roles";

export interface NavItem {
  label: string;
  to: string;
  icon?: LucideIcon;
  // Các đường dẫn khác vẫn tính là đang ở mục này
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
export const TEACHER_NAV: NavEntry[] = [
  { label: "Trang chủ", to: "/teacher/home", icon: LayoutDashboard },
  {
    label: "Lớp học",
    icon: GraduationCap,
    children: [
      { label: "Danh sách lớp", to: "/teacher/classes", icon: Users },
      { label: "Bài tập", to: "/teacher/assignments", icon: NotebookPen },
      { label: "Duyệt bài nộp", to: "/teacher/review", icon: ClipboardCheck },
      { label: "Đánh giá sinh viên", to: "/teacher/student-review", icon: UserCheck },
    ],
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
  { label: "Câu hỏi thường gặp", to: "/help", icon: BookOpen },
];

const ADMIN_NAV: NavEntry[] = [
  { label: "Tổng quan", to: "/admin", icon: LayoutDashboard },
  { label: "Người dùng", to: "/admin/users", icon: Users },
  { label: "Cấu hình hệ thống", to: "/admin/config", icon: Settings2 },
  { label: "Cấu hình nhạc cụ", to: "/admin/instruments", icon: Music2, activePrefixes: ["/admin/roadmaps"] },
  { label: "Phân loại nội dung", to: "/admin/categories", icon: FolderTree },
  { label: "Giám sát hệ thống", to: "/admin/monitoring", icon: Activity },
  { label: "Đánh giá phản hồi AI", to: "/admin/ai-ratings", icon: Activity },
  { label: "Quản lý FAQ", to: "/admin/faqs", icon: BookOpen },
  { label: "Quản lý thông báo", to: "/admin/notifications", icon: Megaphone },
  { label: "Nội dung đã xác minh", to: "/community/verified", icon: BadgeCheck },
  { label: "Bảng xếp hạng", to: "/leaderboard", icon: Trophy },
];

export const STUDENT_TABS: NavItem[] = [
  { label: "Hôm nay", to: "/home", icon: House },
  { label: "Thư viện", to: "/library", icon: LibraryBig, activePrefixes: ["/saved"] },
  { label: "Bài tập", to: "/assignments", icon: NotebookPen, activePrefixes: ["/assignment", "/community/bonus"] },
  { label: "Lịch sử", to: "/practice/submissions", icon: History },
  { label: "Hồ sơ", to: "/profile", icon: UserRound, activePrefixes: ["/help", "/notifications"] },
];

export const TEACHER_TABS: NavItem[] = [
  {
    label: "Trang chủ",
    to: "/teacher/home",
    icon: LayoutDashboard,
    activePrefixes: ["/teacher/attention-students", "/teacher/today-submissions"],
  },
  { label: "Lớp học", to: "/teacher/classes", icon: GraduationCap },
  { label: "Bài tập", to: "/teacher/assignments", icon: NotebookPen },
  { label: "Duyệt bài", to: "/teacher/review", icon: ClipboardCheck, activePrefixes: ["/teacher/student-review"] },
];

export const NAV_BY_ROLE: Record<number, NavEntry[]> = {
  [ROLES.TEACHER]: TEACHER_NAV,
  [ROLES.SYSTEM_ADMIN]: ADMIN_NAV,
};
