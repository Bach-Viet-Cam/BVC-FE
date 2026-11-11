import {
  BookOpen,
  Bot,
  CalendarRange,
  Gauge,
  LibraryBig,
  Mic,
  Timer,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

// Nội dung trang giới thiệu /landing. Chỉ nêu những gì ứng dụng đang làm được, không có số liệu người dùng.

export const LANDING_NAV = [
  { label: "Tính năng", href: "#features" },
  { label: "Thư viện", href: "/library", isRoute: true },
  { label: "Câu hỏi thường gặp", href: "/help", isRoute: true },
  { label: "Thêm vào màn hình", href: "/install", isRoute: true },
];

export const LANDING_INSTRUMENTS = ["Đàn tranh", "Đàn bầu", "Sáo trúc", "Tỳ bà", "Đàn nhị"];

export interface LandingFeature {
  key: "score" | "ensemble" | "library" | "roadmap";
  title: string;
  description: string;
  icon: LucideIcon;
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    key: "score",
    title: "Nhận xét hỗ trợ từ AI",
    description: "Mỗi bản thu được so với bản mẫu để chấm cao độ, nhịp và kèm nhận xét chỉ ra đoạn cần luyện thêm.",
    icon: Bot,
  },
  {
    key: "ensemble",
    title: "Luyện hòa tấu",
    description: "Đeo tai nghe, nghe các bè nhạc cụ khác đã thu sẵn và thu phần của bạn khớp vào bản hòa tấu.",
    icon: Users,
  },
  {
    key: "library",
    title: "Thư viện bản nhạc",
    description: "Tìm bài theo tên không dấu, lọc theo thể loại, nhạc cụ, trình độ và lưu lại bài muốn luyện.",
    icon: LibraryBig,
  },
  {
    key: "roadmap",
    title: "Lớp học có lộ trình",
    description: "Giảng viên giao bài theo tuần, theo dõi bài nộp của cả lớp và để lại nhận xét cho từng lần nộp.",
    icon: CalendarRange,
  },
];

export interface LandingModule {
  name: string;
  description: string;
  icon: LucideIcon;
}

export const LANDING_MODULES_LEFT: LandingModule[] = [
  { name: "Thư viện", description: "Bài hát và bản nhạc", icon: BookOpen },
  { name: "Máy lên dây", description: "Chỉnh dây theo cent", icon: Gauge },
  { name: "Máy đếm nhịp", description: "Giữ đúng tốc độ bài", icon: Timer },
  { name: "Thu âm", description: "Thu hoặc tải bản thu", icon: Mic },
];

export const LANDING_MODULES_RIGHT: LandingModule[] = [
  { name: "Nhận xét từ AI", description: "Góp ý sau mỗi bản thu", icon: Bot },
  { name: "Hòa tấu", description: "Thu cùng các bè", icon: Users },
  { name: "Lớp học", description: "Lộ trình và bài tập", icon: CalendarRange },
  { name: "Xếp hạng", description: "Thử thách mỗi tuần", icon: Trophy },
];
