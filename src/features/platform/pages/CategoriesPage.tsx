import { DesktopSidebar, DesktopPageHeader } from "@/shared/components/bvc";

const NAV_ITEMS = [
  { label: "Lớp học", to: "/teacher" },
  { label: "Bài tập", to: "/teacher/assignments" },
  { label: "Duyệt bài nộp", to: "/teacher/review" },
  { label: "Thư viện bài nhạc", to: "/songs" },
  { label: "Phân loại nội dung", to: "/categories" },
];

interface InstrumentItem {
  name: string;
  color: string;
  initial: string;
  count: number;
}

interface GenreItem {
  name: string;
  color: string;
  initial: string;
  count: number;
}

const INSTRUMENTS: InstrumentItem[] = [
  { name: "Đàn tranh", color: "#F4622E", initial: "T", count: 24 },
  { name: "Đàn bầu", color: "#2E7D4F", initial: "B", count: 18 },
  { name: "Đàn nhị", color: "#D99B1E", initial: "N", count: 15 },
  { name: "Đàn tỳ bà", color: "#7B5EA7", initial: "T", count: 11 },
  { name: "Đàn tam thập lục", color: "#2563EB", initial: "T", count: 8 },
  { name: "Đàn nguyệt", color: "#0891B2", initial: "N", count: 6 },
  { name: "Sáo trúc", color: "#16A34A", initial: "S", count: 14 },
];

const GENRES: GenreItem[] = [
  { name: "Dân ca Nam Bộ", color: "#F4622E", initial: "N", count: 32 },
  { name: "Dân ca Bắc Bộ", color: "#2563EB", initial: "B", count: 28 },
  { name: "Quan họ Bắc Ninh", color: "#7B5EA7", initial: "Q", count: 14 },
  { name: "Nhạc lễ", color: "#D99B1E", initial: "L", count: 19 },
  { name: "Nhạc thính phòng", color: "#2E7D4F", initial: "T", count: 11 },
  { name: "Ca Huế", color: "#0891B2", initial: "H", count: 16 },
  { name: "Đờn ca tài tử", color: "#EA580C", initial: "Đ", count: 22 },
  { name: "Chèo", color: "#9D174D", initial: "C", count: 8 },
];

interface DifficultyLevel {
  name: string;
  count: number;
}

const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { name: "Cơ bản", count: 38 },
  { name: "Trung cấp", count: 52 },
  { name: "Nâng cao", count: 29 },
  { name: "Hòa tấu", count: 18 },
];

const POPULAR_TAGS = [
  "dân ca",
  "nam bộ",
  "bắc bộ",
  "quan họ",
  "nhạc lễ",
  "đàn tranh",
  "hòa tấu",
  "cổ điển",
];

export function CategoriesPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <DesktopSidebar
        items={NAV_ITEMS}
        user={{ initials: "NH", name: "Nguyễn Thu Hương", role: "Giảng viên" }}
        showLogo={false}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopPageHeader
          breadcrumb="M02 · Thư viện học liệu"
          title="Phân loại nội dung"
          actions={
            <button
              type="button"
              className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
            >
              + Thêm danh mục
            </button>
          }
        />

        {/* Main content */}
        <div className="flex flex-1 gap-[20px] overflow-hidden p-[20px_32px]">
          {/* Left — Nhạc cụ + Thể loại */}
          <div className="flex flex-1 flex-col gap-[16px] overflow-y-auto">
            {/* Nhạc cụ */}
            <div className="overflow-hidden rounded-[20px] border border-bvc-border bg-white">
              <div className="flex items-center gap-[10px] border-b border-bvc-border px-[18px] py-[14px]">
                <span className="text-[15px] font-bold text-bvc-ink">Nhạc cụ</span>
                <span className="rounded-[8px] bg-bvc-surface px-2 py-1 text-[12px] text-bvc-muted">
                  7 nhạc cụ
                </span>
              </div>

              {INSTRUMENTS.map((inst, idx) => (
                <div
                  key={inst.name}
                  className={`flex h-[50px] items-center gap-[12px] px-[18px] text-[14px] ${
                    idx < INSTRUMENTS.length - 1 ? "border-b border-bvc-border" : ""
                  }`}
                >
                  <span
                    className="flex size-[28px] shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                    style={{ backgroundColor: inst.color }}
                  >
                    {inst.initial}
                  </span>
                  <span className="flex-1 font-medium text-bvc-ink">{inst.name}</span>
                  <span className="font-bvc-mono text-[13px] text-bvc-muted">{inst.count} bài nhạc</span>
                  <button
                    type="button"
                    className="cursor-pointer text-[13px] font-semibold text-bvc-accent-text"
                  >
                    Sửa
                  </button>
                </div>
              ))}
            </div>

            {/* Thể loại */}
            <div className="overflow-hidden rounded-[20px] border border-bvc-border bg-white">
              <div className="flex items-center gap-[10px] border-b border-bvc-border px-[18px] py-[14px]">
                <span className="text-[15px] font-bold text-bvc-ink">Thể loại</span>
                <span className="rounded-[8px] bg-bvc-surface px-2 py-1 text-[12px] text-bvc-muted">
                  8 thể loại
                </span>
              </div>

              {GENRES.map((genre, idx) => (
                <div
                  key={genre.name}
                  className={`flex h-[50px] items-center gap-[12px] px-[18px] text-[14px] ${
                    idx < GENRES.length - 1 ? "border-b border-bvc-border" : ""
                  }`}
                >
                  <span
                    className="flex size-[28px] shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                    style={{ backgroundColor: genre.color }}
                  >
                    {genre.initial}
                  </span>
                  <span className="flex-1 font-medium text-bvc-ink">{genre.name}</span>
                  <span className="font-bvc-mono text-[13px] text-bvc-muted">{genre.count} bài</span>
                  <button
                    type="button"
                    className="cursor-pointer text-[13px] font-semibold text-bvc-accent-text"
                  >
                    Sửa
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="flex w-[340px] shrink-0 flex-col overflow-y-auto">
            {/* Mức độ khó */}
            <div className="flex flex-col gap-[10px] rounded-[20px] border border-bvc-border bg-white p-[16px]">
              <span className="text-[15px] font-bold text-bvc-ink">Mức độ khó</span>
              <div className="flex flex-col gap-[8px]">
                {DIFFICULTY_LEVELS.map((level) => (
                  <div
                    key={level.name}
                    className="flex items-center justify-between rounded-[14px] bg-bvc-surface p-[10px_12px]"
                  >
                    <span className="text-[14px] font-medium text-bvc-ink">{level.name}</span>
                    <span className="font-bvc-mono text-[13px] text-bvc-muted">{level.count} bài</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Thẻ phổ biến */}
            <div className="mt-4 flex flex-col gap-[10px] rounded-[20px] border border-bvc-border bg-white p-[16px]">
              <span className="text-[15px] font-bold text-bvc-ink">Thẻ phổ biến</span>
              <div className="flex flex-wrap gap-[8px]">
                {POPULAR_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-bvc-border-strong px-3 py-1 text-[13px] text-bvc-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
