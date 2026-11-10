import {
  BarChart3,
  BookOpen,
  Bot,
  CalendarRange,
  Gauge,
  Headphones,
  Heart,
  LibraryBig,
  Mic,
  Sparkles,
  Timer,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

// Nội dung trang giới thiệu /landing. Chỉ nêu những gì ứng dụng đang làm được, không có số liệu người dùng.

export const LANDING_NAV = [
  { label: "Tính năng", href: "#features" },
  { label: "Lợi ích", href: "#benefits" },
  { label: "Thư viện", href: "#library" },
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

export const LANDING_BENEFIT_TAGS = ["Nhạc cụ dân tộc", "Hòa tấu", "Lộ trình theo tuần", "Bảng xếp hạng"];

export interface LandingBenefit {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const LANDING_BENEFITS: LandingBenefit[] = [
  {
    title: "Phản hồi sau mỗi lần nộp",
    description: "Không cần chờ đến buổi học, bạn biết ngay mình đánh đúng cao độ và nhịp tới đâu.",
    icon: Sparkles,
  },
  {
    title: "Nhận xét dễ hiểu",
    description: "AI chỉ ra đoạn đánh nhanh, chậm hay thiếu nốt so với bản mẫu để bạn tập trúng chỗ.",
    icon: Bot,
  },
  {
    title: "Luyện theo bản mẫu",
    description: "Nghe bản thu của giảng viên, xem video hướng dẫn và luyện chậm từng đoạn.",
    icon: Headphones,
  },
  {
    title: "Lên dây chuẩn",
    description: "Máy lên dây hiện độ lệch theo cent cho từng dây của nhạc cụ bạn đang học.",
    icon: Gauge,
  },
  {
    title: "Giữ nhịp đều tay",
    description: "Máy đếm nhịp theo đúng tốc độ bài tập yêu cầu, luyện quen trước khi thu.",
    icon: Timer,
  },
  {
    title: "Hòa tấu cùng các bè",
    description: "Thu phần của bạn trên nền các nhạc cụ khác, nghe lại cả bản hòa tấu.",
    icon: Users,
  },
  {
    title: "Thấy rõ sự tiến bộ",
    description: "Trang Hôm nay tổng hợp lượt nộp, điểm cao nhất và mức tiến bộ độc tấu, hòa tấu.",
    icon: BarChart3,
  },
  {
    title: "Lộ trình từ giảng viên",
    description: "Bài tập được giao theo tuần kèm hạn nộp, số lần nộp và điểm cần đạt.",
    icon: CalendarRange,
  },
  {
    title: "Thử thách mỗi tuần",
    description: "Tham gia thử thách và so thứ hạng với các bạn cùng lớp trên bảng xếp hạng.",
    icon: Trophy,
  },
  {
    title: "Lưu bài yêu thích",
    description: "Lưu bài hát và bản nhạc để mở lại nhanh ở mục Đã lưu.",
    icon: Heart,
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
