import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  Eye,
  FileText,
  Headphones,
  Layers,
  Music2,
  Pause,
  Play,
  RotateCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  X,
} from "lucide-react";
import { DesktopPageHeader } from "@/shared/components/bvc";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { toast } from "@/shared/components/ui/toast";


export type ContentType = "Bản thu" | "Bản nhạc" | "Arrangement";

export interface VerifiedItem {
  id: string;
  name: string;
  type: ContentType;
  contributor: string;
  contributorRole: "Giảng viên" | "Sinh viên" | "Cộng tác viên";
  key: string;
  bpm?: number;
  duration?: string;
  instrument: string;
  uses: number;
  verifiedAt: string;
  verifiedBy: string;
  description: string;
}

type SortKey = "name" | "uses" | "date" | "key";
type SortDirection = "asc" | "desc";


const INITIAL_ITEMS: VerifiedItem[] = [
  {
    id: "v-01",
    name: "Lý ngựa ô — bè đàn tranh (bản 3)",
    type: "Bản thu",
    contributor: "Phương Linh",
    contributorRole: "Sinh viên",
    key: "G",
    bpm: 112,
    duration: "03:12",
    instrument: "Đàn Tranh",
    uses: 124,
    verifiedAt: "15/09/2026",
    verifiedBy: "GV. Nguyễn Thu Hương",
    description: "Bản thu đạt độ chính xác cao về cao độ thang âm ngũ cung Nam Bộ, tempo chuẩn 112 BPM, âm thanh rõ nét.",
  },
  {
    id: "v-02",
    name: "Trống cơm — full score tổng phổ",
    type: "Bản nhạc",
    contributor: "GV. Nguyễn Thu Hương",
    contributorRole: "Giảng viên",
    key: "C",
    bpm: 96,
    duration: "02:45",
    instrument: "Hòa tấu",
    uses: 231,
    verifiedAt: "10/09/2026",
    verifiedBy: "Hội đồng chuyên môn",
    description: "Ký âm chuẩn 2 bè gồm đàn bầu và đàn nguyệt, đầy đủ ký hiệu luyến láy và ngắt nhịp truyền thống.",
  },
  {
    id: "v-03",
    name: "Bèo dạt mây trôi — arrangement jazz",
    type: "Arrangement",
    contributor: "Minh Anh",
    contributorRole: "Sinh viên",
    key: "F",
    bpm: 84,
    duration: "04:10",
    instrument: "Đàn Bầu & Piano",
    uses: 78,
    verifiedAt: "05/09/2026",
    verifiedBy: "GV. Trần Văn Hưng",
    description: "Phối khí kết hợp ngũ cung Bắc Bộ với hòa âm jazz ballad hiện đại, tạo cảm giác mới lạ cho bài thi học kỳ.",
  },
  {
    id: "v-04",
    name: "Scale Rê thứ x80 BPM luyện ngón",
    type: "Bản thu",
    contributor: "Quốc Bảo",
    contributorRole: "Sinh viên",
    key: "D",
    bpm: 80,
    duration: "01:30",
    instrument: "Đàn Nguyệt",
    uses: 167,
    verifiedAt: "22/08/2026",
    verifiedBy: "GV. Nguyễn Thu Hương",
    description: "Bản thu thang âm mẫu chuẩn cho sinh viên năm 1 luyện ngón móng gảy và kỹ thuật vê ngón.",
  },
  {
    id: "v-05",
    name: "Lưu thủy kim tiền — version chuẩn hội diễn",
    type: "Bản nhạc",
    contributor: "GV. Trần Văn Hưng",
    contributorRole: "Giảng viên",
    key: "A",
    bpm: 104,
    duration: "03:30",
    instrument: "Đàn Nhị & Nguyệt",
    uses: 342,
    verifiedAt: "01/09/2026",
    verifiedBy: "Hội đồng chuyên môn",
    description: "Bản nhạc chuẩn theo phong cách ca kịch truyền thống miền Trung, nhịp phách rõ nét, dùng trong thi chuyển cấp.",
  },
  {
    id: "v-06",
    name: "Hát ru Nam Bộ — arrangement cổ điển",
    type: "Arrangement",
    contributor: "Gia Hân",
    contributorRole: "Sinh viên",
    key: "G",
    bpm: 68,
    duration: "03:45",
    instrument: "Sáo Trúc & Tranh",
    uses: 89,
    verifiedAt: "18/09/2026",
    verifiedBy: "GV. Nguyễn Thu Hương",
    description: "Không khí êm dịu, bè đệm sáo trúc mộc mạc, phù hợp cho bài thi kiểm tra học phần âm nhạc dân gian.",
  },
  {
    id: "v-07",
    name: "Cò Lả — bè sáo trúc luyện hơi",
    type: "Bản thu",
    contributor: "Văn Toàn",
    contributorRole: "Sinh viên",
    key: "C",
    bpm: 92,
    duration: "02:15",
    instrument: "Sáo Trúc",
    uses: 195,
    verifiedAt: "28/08/2026",
    verifiedBy: "GV. Trần Văn Hưng",
    description: "Bài mẫu luyện rung hơi và vuốt ngón trên sáo Đô (C5), âm sắc tròn đầy và chuẩn cao độ.",
  },
  {
    id: "v-08",
    name: "Qua cầu gió bay — tổng phổ hòa tấu dân tộc",
    type: "Bản nhạc",
    contributor: "Hội Đồng Khảo Thí",
    contributorRole: "Giảng viên",
    key: "F",
    bpm: 100,
    duration: "03:00",
    instrument: "Dàn nhạc dân tộc",
    uses: 412,
    verifiedAt: "12/08/2026",
    verifiedBy: "Trưởng bộ môn",
    description: "Tổng phổ hòa tấu 4 bè (Tranh, Bầu, Nguyệt, Nhị) phục vụ diễn xướng và thi hòa tấu cuối khóa.",
  },
];


function TypeBadge({ type }: { type: ContentType }) {
  if (type === "Bản thu") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-bvc-border bg-bvc-surface px-2.5 py-1 text-[12px] font-semibold text-bvc-ink">
        <Headphones size={13} className="text-bvc-muted" />
        <span>Bản thu</span>
      </span>
    );
  }
  if (type === "Bản nhạc") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-bvc-border bg-white px-2.5 py-1 text-[12px] font-semibold text-bvc-ink">
        <FileText size={13} className="text-bvc-muted" />
        <span>Bản nhạc</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-bvc-border-strong bg-white px-2.5 py-1 text-[12px] font-semibold text-bvc-ink">
      <Layers size={13} className="text-bvc-muted" />
      <span>Arrangement</span>
    </span>
  );
}


export function VerifiedContentPage() {
  const [items, setItems] = useState<VerifiedItem[]>(INITIAL_ITEMS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [typeFilter, setTypeFilter] = useState<ContentType | "all">("all");
  const [keyFilter, setKeyFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const [previewTarget, setPreviewTarget] = useState<VerifiedItem | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [unverifyTarget, setUnverifyTarget] = useState<VerifiedItem | null>(null);
  const [isBatchUnverifyOpen, setIsBatchUnverifyOpen] = useState(false);

  const totalCount = items.length;
  const countRecordings = useMemo(() => items.filter((it) => it.type === "Bản thu").length, [items]);
  const countSheets = useMemo(() => items.filter((it) => it.type === "Bản nhạc").length, [items]);
  const countArrangements = useMemo(() => items.filter((it) => it.type === "Arrangement").length, [items]);
  const totalUses = useMemo(() => items.reduce((acc, it) => acc + it.uses, 0), [items]);

  const availableKeys = useMemo(() => {
    const keys = Array.from(new Set(items.map((it) => it.key)));
    return keys.sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (typeFilter !== "all") {
      result = result.filter((it) => it.type === typeFilter);
    }

    if (keyFilter !== "all") {
      result = result.filter((it) => it.key === keyFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.contributor.toLowerCase().includes(q) ||
          it.instrument.toLowerCase().includes(q) ||
          it.description.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name, "vi");
      } else if (sortBy === "uses") {
        comparison = a.uses - b.uses;
      } else if (sortBy === "key") {
        comparison = a.key.localeCompare(b.key);
      } else if (sortBy === "date") {
        comparison = a.verifiedAt.localeCompare(b.verifiedAt);
      }
      return sortDir === "asc" ? comparison : -comparison;
    });

    return result;
  }, [items, typeFilter, keyFilter, searchQuery, sortBy, sortDir]);

  const hasActiveFilters = Boolean(typeFilter !== "all" || keyFilter !== "all" || searchQuery.trim());

  const resetFilters = () => {
    setTypeFilter("all");
    setKeyFilter("all");
    setSearchQuery("");
  };

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  const allFilteredSelected =
    filteredItems.length > 0 && filteredItems.every((it) => selectedIds.has(it.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((it) => it.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleConfirmSingleUnverify = () => {
    if (!unverifyTarget) return;
    setItems((prev) => prev.filter((it) => it.id !== unverifyTarget.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(unverifyTarget.id);
      return next;
    });
    toast.success(`Đã gỡ xác minh “${unverifyTarget.name}”`);
    setUnverifyTarget(null);
  };

  const handleConfirmBatchUnverify = () => {
    const count = selectedIds.size;
    if (count === 0) return;
    setItems((prev) => prev.filter((it) => !selectedIds.has(it.id)));
    setSelectedIds(new Set());
    toast.success(`Đã gỡ xác minh ${count} nội dung được chọn`);
    setIsBatchUnverifyOpen(false);
  };

  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      toast.error("Không có dữ liệu để xuất file CSV");
      return;
    }

    const headers = [
      "Mã ID",
      "Tên nội dung",
      "Loại",
      "Người đóng góp",
      "Vai trò",
      "Nhạc cụ",
      "Khóa/Giọng",
      "Lượt dùng",
      "Ngày xác minh",
      "Người thẩm định",
    ];

    const rows = filteredItems.map((it) => [
      `"${it.id}"`,
      `"${it.name.replace(/"/g, '""')}"`,
      `"${it.type}"`,
      `"${it.contributor.replace(/"/g, '""')}"`,
      `"${it.contributorRole}"`,
      `"${it.instrument}"`,
      `"${it.key}"`,
      it.uses,
      `"${it.verifiedAt}"`,
      `"${it.verifiedBy.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bvc-noi-dung-da-xac-minh-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Đã xuất ${filteredItems.length} nội dung ra tệp CSV`);
  };

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#FAF9F7]">
      <DesktopPageHeader
        breadcrumb="Quản lý nội dung cộng đồng"
        title="Nội dung đã xác minh"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setItems(INITIAL_ITEMS);
                setSelectedIds(new Set());
                toast.success("Đã làm mới dữ liệu nội dung đã xác minh");
              }}
              title="Làm mới danh sách"
              className="flex size-[42px] cursor-pointer items-center justify-center rounded-[12px] border border-bvc-border bg-white text-bvc-muted transition-colors hover:border-bvc-border-strong hover:text-bvc-ink"
            >
              <RotateCw size={16} />
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              title="Xuất bảng nội dung ra tệp CSV"
              className="flex min-h-[42px] cursor-pointer items-center gap-2 rounded-[12px] border border-bvc-border-strong bg-white px-4 text-[13.5px] font-semibold text-bvc-ink transition-colors hover:border-bvc-ink hover:bg-bvc-surface/40"
            >
              <Download size={15} />
              <span>Xuất CSV</span>
            </button>

            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => setIsBatchUnverifyOpen(true)}
                className="flex min-h-[42px] cursor-pointer items-center gap-2 rounded-[12px] border border-bvc-error bg-white px-4 text-[13.5px] font-semibold text-bvc-accent-text transition-colors hover:bg-bvc-accent-tint"
              >
                <ShieldOff size={15} />
                <span>Gỡ xác minh ({selectedIds.size})</span>
              </button>
            )}
          </div>
        }
      />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-bvc-border bg-white px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-6 text-[13px]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={17} className="text-bvc-ok" />
              <span className="text-bvc-muted">Tổng đã thẩm định:</span>
              <span className="font-mono font-bold text-bvc-ink">{totalCount}</span>
              <span className="text-[12px] text-bvc-muted">tác phẩm</span>
            </div>

            <div className="h-3.5 w-px bg-bvc-border" />

            <div className="flex items-center gap-3 text-[12.5px]">
              <span className="text-bvc-muted">Phân loại:</span>
              <span className="font-medium text-bvc-ink">
                <strong className="font-mono text-bvc-ink">{countRecordings}</strong> Bản thu
              </span>
              <span className="text-bvc-faint">·</span>
              <span className="font-medium text-bvc-ink">
                <strong className="font-mono text-bvc-ink">{countSheets}</strong> Bản nhạc
              </span>
              <span className="text-bvc-faint">·</span>
              <span className="font-medium text-bvc-ink">
                <strong className="font-mono text-bvc-ink">{countArrangements}</strong> Arrangement
              </span>
            </div>

            <div className="h-3.5 w-px bg-bvc-border" />

            <div className="flex items-center gap-2">
              <span className="text-bvc-muted">Tổng lượt sử dụng:</span>
              <span className="font-mono font-bold text-bvc-ink">{totalUses.toLocaleString()}</span>
              <span className="text-[12px] text-bvc-muted">lượt trong hệ thống</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[12px] text-bvc-muted">
            <span className="size-[7px] rounded-full bg-bvc-ok" />
            <span>Nội dung đã duyệt chất lượng đưa vào thư viện dùng chung</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[16px] border border-bvc-border bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex flex-wrap items-center rounded-[12px] border border-bvc-border/80 bg-bvc-surface/60 p-1">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`cursor-pointer rounded-[9px] px-3.5 py-1.5 text-[13px] font-semibold transition-all select-none ${
                typeFilter === "all" ? "bg-white text-bvc-ink shadow-xs" : "text-bvc-muted hover:text-bvc-ink"
              }`}
            >
              Tất cả ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("Bản thu")}
              className={`cursor-pointer rounded-[9px] px-3.5 py-1.5 text-[13px] font-semibold transition-all select-none ${
                typeFilter === "Bản thu" ? "bg-white text-bvc-ink shadow-xs" : "text-bvc-muted hover:text-bvc-ink"
              }`}
            >
              Bản thu ({countRecordings})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("Bản nhạc")}
              className={`cursor-pointer rounded-[9px] px-3.5 py-1.5 text-[13px] font-semibold transition-all select-none ${
                typeFilter === "Bản nhạc" ? "bg-white text-bvc-ink shadow-xs" : "text-bvc-muted hover:text-bvc-ink"
              }`}
            >
              Bản nhạc ({countSheets})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("Arrangement")}
              className={`cursor-pointer rounded-[9px] px-3.5 py-1.5 text-[13px] font-semibold transition-all select-none ${
                typeFilter === "Arrangement" ? "bg-white text-bvc-ink shadow-xs" : "text-bvc-muted hover:text-bvc-ink"
              }`}
            >
              Arrangement ({countArrangements})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Lọc theo Giọng / Khóa"
              value={keyFilter}
              onChange={(e) => setKeyFilter(e.target.value)}
              className="h-[38px] cursor-pointer rounded-[11px] border border-bvc-border-strong bg-white px-3 text-[13px] font-medium text-bvc-ink transition-colors focus:border-bvc-ink focus:outline-none"
            >
              <option value="all">Tất cả khóa/giọng</option>
              {availableKeys.map((k) => (
                <option key={k} value={k}>
                  Khóa {k}
                </option>
              ))}
            </select>

            <div className="relative flex items-center">
              <Search size={15} className="pointer-events-none absolute left-3 text-bvc-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tên tác phẩm, người đóng góp..."
                maxLength={100}
                className="h-[38px] w-[240px] rounded-[11px] border border-bvc-border-strong bg-white pl-8.5 pr-8 text-[13px] text-bvc-ink placeholder:text-bvc-faint transition-all focus:border-bvc-ink focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 cursor-pointer text-bvc-muted hover:text-bvc-ink"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex h-[38px] cursor-pointer items-center gap-1.5 rounded-[11px] border border-bvc-border bg-bvc-surface/80 px-2.5 text-[12.5px] font-medium text-bvc-muted transition-colors hover:bg-bvc-border hover:text-bvc-ink"
                title="Xóa bộ lọc"
              >
                <X size={13} />
                <span>Xóa lọc</span>
              </button>
            )}

            <span className="ml-1 font-mono text-[13px] text-bvc-muted">
              {filteredItems.length} <span className="font-sans text-[12px] text-bvc-faint">nội dung</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-[18px] border border-bvc-border bg-white shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1020px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-bvc-border bg-bvc-surface/50 text-[11.5px] font-bold uppercase tracking-[0.06em] text-bvc-muted">
                  <th className="px-4 py-3.5 w-[44px] text-center">
                    <input
                      type="checkbox"
                      aria-label="Chọn tất cả nội dung"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      className="size-4 cursor-pointer rounded border-bvc-border-strong accent-bvc-ink"
                    />
                  </th>

                  <th className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => toggleSort("name")}
                      className="flex cursor-pointer items-center gap-1.5 text-left transition-colors hover:text-bvc-ink uppercase"
                    >
                      <span>Tác phẩm &amp; Chi tiết</span>
                      {sortBy === "name" ? (
                        sortDir === "asc" ? <ArrowUp size={13} className="text-bvc-ink" /> : <ArrowDown size={13} className="text-bvc-ink" />
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </button>
                  </th>

                  <th className="px-4 py-3.5 w-[160px]">Loại nội dung</th>
                  <th className="px-4 py-3.5 w-[180px]">Người đóng góp</th>

                  <th className="px-4 py-3.5 w-[100px]">
                    <button
                      type="button"
                      onClick={() => toggleSort("key")}
                      className="flex cursor-pointer items-center gap-1.5 text-left transition-colors hover:text-bvc-ink uppercase"
                    >
                      <span>Giọng</span>
                      {sortBy === "key" ? (
                        sortDir === "asc" ? <ArrowUp size={13} className="text-bvc-ink" /> : <ArrowDown size={13} className="text-bvc-ink" />
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </button>
                  </th>

                  <th className="px-4 py-3.5 w-[130px]">
                    <button
                      type="button"
                      onClick={() => toggleSort("uses")}
                      className="flex cursor-pointer items-center gap-1.5 text-left transition-colors hover:text-bvc-ink uppercase"
                    >
                      <span>Lượt dùng</span>
                      {sortBy === "uses" ? (
                        sortDir === "asc" ? <ArrowUp size={13} className="text-bvc-ink" /> : <ArrowDown size={13} className="text-bvc-ink" />
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </button>
                  </th>

                  <th className="px-4 py-3.5 w-[150px]">
                    <button
                      type="button"
                      onClick={() => toggleSort("date")}
                      className="flex cursor-pointer items-center gap-1.5 text-left transition-colors hover:text-bvc-ink uppercase"
                    >
                      <span>Ngày duyệt</span>
                      {sortBy === "date" ? (
                        sortDir === "asc" ? <ArrowUp size={13} className="text-bvc-ink" /> : <ArrowDown size={13} className="text-bvc-ink" />
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </button>
                  </th>

                  <th className="px-4 py-3.5 w-[160px] text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-bvc-line">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex size-[44px] items-center justify-center rounded-[12px] bg-bvc-surface text-bvc-muted">
                          <Music2 size={20} />
                        </div>
                        <p className="mt-3 text-[14px] font-bold text-bvc-ink">Không tìm thấy nội dung phù hợp</p>
                        <p className="mt-1 text-[12.5px] text-bvc-muted">
                          {hasActiveFilters
                            ? "Thử thay đổi từ khóa hoặc bộ lọc thể loại."
                            : "Chưa có tác phẩm nào được xác minh trong hệ thống."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((row) => {
                    const isSelected = selectedIds.has(row.id);
                    return (
                      <tr
                        key={row.id}
                        className={`transition-colors ${
                          isSelected ? "bg-bvc-surface/70" : "hover:bg-bvc-surface/40"
                        }`}
                      >
                        <td className="px-4 py-3.5 text-center">
                          <input
                            type="checkbox"
                            aria-label={`Chọn ${row.name}`}
                            checked={isSelected}
                            onChange={() => toggleSelectItem(row.id)}
                            className="size-4 cursor-pointer rounded border-bvc-border-strong accent-bvc-ink"
                          />
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="size-[7px] shrink-0 rounded-full bg-bvc-ok"
                                title="Đã thẩm định & xác minh"
                              />
                              <span className="truncate text-[13.5px] font-bold text-bvc-ink">
                                {row.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[12px] text-bvc-muted pl-4">
                              <span>{row.instrument}</span>
                              {row.bpm && (
                                <>
                                  <span className="text-bvc-faint">·</span>
                                  <span className="font-mono">{row.bpm} BPM</span>
                                </>
                              )}
                              {row.duration && (
                                <>
                                  <span className="text-bvc-faint">·</span>
                                  <span className="font-mono">{row.duration}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <TypeBadge type={row.type} />
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-bvc-ink">{row.contributor}</span>
                            <span className="text-[11.5px] text-bvc-muted">{row.contributorRole}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-mono text-[12px] font-bold text-bvc-ink bg-bvc-surface border border-bvc-border px-2 py-0.5 rounded-[6px]">
                            {row.key}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-baseline gap-1">
                            <span className="font-mono text-[13.5px] font-bold text-bvc-ink">
                              {row.uses}
                            </span>
                            <span className="text-[12px] text-bvc-muted">lượt</span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-mono text-[12.5px] text-bvc-ink">{row.verifiedAt}</span>
                            <span className="truncate text-[11px] text-bvc-muted" title={row.verifiedBy}>
                              bởi {row.verifiedBy}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewTarget(row)}
                              title="Xem chi tiết nội dung"
                              className="flex h-[32px] cursor-pointer items-center gap-1.5 rounded-[8px] border border-bvc-border bg-white px-2.5 text-[12.5px] font-semibold text-bvc-ink transition-colors hover:border-bvc-ink hover:bg-bvc-surface"
                            >
                              <Eye size={13} />
                              <span>Xem</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setUnverifyTarget(row)}
                              title="Gỡ huy hiệu xác minh"
                              className="flex h-[32px] cursor-pointer items-center gap-1 rounded-[8px] border border-bvc-border bg-white px-2.5 text-[12.5px] font-semibold text-bvc-muted transition-colors hover:border-bvc-error hover:bg-bvc-accent-tint hover:text-bvc-accent-text"
                            >
                              <ShieldOff size={13} />
                              <span className="hidden sm:inline">Gỡ</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-bvc-border bg-bvc-surface/30 px-5 py-3 text-[12px] text-bvc-muted">
            <span>
              Hiển thị <strong className="font-mono text-bvc-ink">{filteredItems.length}</strong> /{" "}
              <strong className="font-mono text-bvc-ink">{totalCount}</strong> tác phẩm đã duyệt
            </span>
            <span>Chỉ Giảng viên và Quản trị viên có thẩm quyền gỡ xác minh</span>
          </div>
        </div>
      </div>

      <Dialog open={previewTarget !== null} onOpenChange={(open) => !open && setPreviewTarget(null)}>
        <DialogPopup className="max-w-[560px] rounded-[20px] border border-bvc-border bg-white p-6 shadow-none">
          {previewTarget && (
            <div className="flex flex-col gap-4.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-[40px] shrink-0 items-center justify-center rounded-[12px] bg-bvc-surface text-bvc-ink">
                    {previewTarget.type === "Bản thu" ? (
                      <Headphones size={20} />
                    ) : previewTarget.type === "Bản nhạc" ? (
                      <FileText size={20} />
                    ) : (
                      <Layers size={20} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <TypeBadge type={previewTarget.type} />
                      <span className="font-mono text-[11.5px] font-semibold text-bvc-ink bg-bvc-surface border border-bvc-border px-2 py-0.5 rounded-[5px]">
                        Khóa {previewTarget.key}
                      </span>
                    </div>
                    <DialogTitle className="mt-1 text-[16.5px] font-extrabold tracking-[-0.02em] text-bvc-ink">
                      {previewTarget.name}
                    </DialogTitle>
                  </div>
                </div>
                <DialogClose className="top-5 right-5 text-bvc-muted hover:text-bvc-ink" />
              </div>

              <div className="flex flex-col gap-2 rounded-[14px] border border-bvc-border bg-bvc-surface/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-bvc-muted">
                    Bản nghe thử mô phỏng
                  </span>
                  <span className="font-mono text-[12px] text-bvc-muted">
                    {previewTarget.bpm ? `${previewTarget.bpm} BPM · ` : ""}
                    {previewTarget.duration || "03:00"}
                  </span>
                </div>

                <div className="flex h-[48px] items-center gap-1 overflow-hidden py-1">
                  {[24, 45, 60, 35, 78, 92, 40, 65, 88, 55, 30, 48, 70, 85, 95, 60, 40, 75, 50, 32, 60, 78, 45, 20].map(
                    (val, idx) => (
                      <div
                        key={idx}
                        className={`w-1 rounded-full transition-all ${
                          idx < 8 && isPlayingPreview
                            ? "bg-bvc-ink"
                            : "bg-bvc-bar hover:bg-bvc-bar-strong"
                        }`}
                        style={{ height: `${val}%` }}
                      />
                    )
                  )}
                </div>

                <div className="mt-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsPlayingPreview((prev) => !prev)}
                    className="flex h-[34px] cursor-pointer items-center gap-2 rounded-[10px] bg-bvc-ink px-3 text-[12.5px] font-semibold text-white transition-colors hover:bg-black"
                  >
                    {isPlayingPreview ? <Pause size={14} /> : <Play size={14} />}
                    <span>{isPlayingPreview ? "Tạm dừng" : "Nghe thử"}</span>
                  </button>
                  <span className="text-[12px] text-bvc-muted">Nhạc cụ: {previewTarget.instrument}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div className="rounded-[11px] border border-bvc-line bg-white p-3">
                  <span className="text-[11.5px] text-bvc-muted">Người đóng góp</span>
                  <p className="mt-0.5 font-bold text-bvc-ink">{previewTarget.contributor}</p>
                  <span className="text-[11px] text-bvc-muted">{previewTarget.contributorRole}</span>
                </div>
                <div className="rounded-[11px] border border-bvc-line bg-white p-3">
                  <span className="text-[11.5px] text-bvc-muted">Người thẩm định</span>
                  <p className="mt-0.5 font-bold text-bvc-ink">{previewTarget.verifiedBy}</p>
                  <span className="font-mono text-[11px] text-bvc-muted">{previewTarget.verifiedAt}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 rounded-[11px] border border-bvc-line bg-bvc-surface/30 p-3 text-[12.5px]">
                <span className="font-semibold text-bvc-muted">Đánh giá thẩm định:</span>
                <p className="leading-relaxed text-bvc-ink">{previewTarget.description}</p>
              </div>

              <div className="mt-1 flex items-center justify-end gap-2.5 border-t border-bvc-line pt-3.5">
                <button
                  type="button"
                  onClick={() => setPreviewTarget(null)}
                  className="min-h-[38px] cursor-pointer rounded-[11px] border border-bvc-border-strong bg-white px-4 text-[13px] font-semibold text-bvc-ink transition-colors hover:border-bvc-ink"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = previewTarget;
                    setPreviewTarget(null);
                    setUnverifyTarget(target);
                  }}
                  className="min-h-[38px] cursor-pointer rounded-[11px] border border-bvc-error bg-white px-4 text-[13px] font-semibold text-bvc-accent-text transition-colors hover:bg-bvc-accent-tint"
                >
                  Gỡ xác minh
                </button>
              </div>
            </div>
          )}
        </DialogPopup>
      </Dialog>

      <Dialog open={unverifyTarget !== null} onOpenChange={(open) => !open && setUnverifyTarget(null)}>
        <DialogPopup className="max-w-[460px] rounded-[20px] border border-bvc-border bg-white p-6 shadow-none">
          <div className="flex items-start gap-3.5">
            <div className="flex size-[40px] shrink-0 items-center justify-center rounded-[12px] bg-bvc-surface text-bvc-error">
              <ShieldAlert size={20} />
            </div>
            <div className="flex-1 pr-6">
              <DialogTitle className="text-[17px] font-extrabold tracking-[-0.02em] text-bvc-ink">
                Gỡ xác minh “{unverifyTarget?.name}”?
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-[13px] leading-relaxed text-bvc-muted">
                Tác phẩm này sẽ không còn xuất hiện trong nhóm nội dung ưu tiên của thư viện chung, mà chuyển về trạng thái
                đóng góp cộng đồng thông thường. Tác giả vẫn giữ toàn bộ bài nộp của mình.
              </DialogDescription>
            </div>
          </div>
          <DialogClose className="top-5 right-5 text-bvc-muted hover:text-bvc-ink" />

          <div className="mt-4 flex items-center justify-end gap-2.5 border-t border-bvc-line pt-4">
            <button
              type="button"
              onClick={() => setUnverifyTarget(null)}
              className="min-h-[40px] cursor-pointer rounded-[12px] border border-bvc-border-strong bg-white px-4 text-[13.5px] font-semibold text-bvc-ink transition-colors hover:border-bvc-ink hover:bg-bvc-surface/40"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmSingleUnverify}
              className="min-h-[40px] cursor-pointer rounded-[12px] bg-bvc-error px-4.5 text-[13.5px] font-bold text-white transition-colors hover:brightness-110"
            >
              Xác nhận gỡ
            </button>
          </div>
        </DialogPopup>
      </Dialog>

      <Dialog open={isBatchUnverifyOpen} onOpenChange={setIsBatchUnverifyOpen}>
        <DialogPopup className="max-w-[460px] rounded-[20px] border border-bvc-border bg-white p-6 shadow-none">
          <div className="flex items-start gap-3.5">
            <div className="flex size-[40px] shrink-0 items-center justify-center rounded-[12px] bg-bvc-surface text-bvc-error">
              <ShieldAlert size={20} />
            </div>
            <div className="flex-1 pr-6">
              <DialogTitle className="text-[17px] font-extrabold tracking-[-0.02em] text-bvc-ink">
                Gỡ xác minh {selectedIds.size} nội dung đã chọn?
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-[13px] leading-relaxed text-bvc-muted">
                Tất cả {selectedIds.size} tác phẩm được đánh dấu sẽ bị hạ cấp khỏi nhóm nội dung thẩm định dùng chung.
                Bạn có chắc chắn muốn thực hiện thao tác hàng loạt này?
              </DialogDescription>
            </div>
          </div>
          <DialogClose className="top-5 right-5 text-bvc-muted hover:text-bvc-ink" />

          <div className="mt-4 flex items-center justify-end gap-2.5 border-t border-bvc-line pt-4">
            <button
              type="button"
              onClick={() => setIsBatchUnverifyOpen(false)}
              className="min-h-[40px] cursor-pointer rounded-[12px] border border-bvc-border-strong bg-white px-4 text-[13.5px] font-semibold text-bvc-ink transition-colors hover:border-bvc-ink hover:bg-bvc-surface/40"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmBatchUnverify}
              className="min-h-[40px] cursor-pointer rounded-[12px] bg-bvc-error px-4.5 text-[13.5px] font-bold text-white transition-colors hover:brightness-110"
            >
              Gỡ {selectedIds.size} mục đã chọn
            </button>
          </div>
        </DialogPopup>
      </Dialog>
    </main>
  );
}
