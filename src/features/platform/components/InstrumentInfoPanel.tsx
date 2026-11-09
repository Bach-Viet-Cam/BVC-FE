import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Pencil,
  Plus,
  Power,
  RotateCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { InstrumentFormDialog } from "@/features/platform/components/InstrumentFormDialog";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useInstruments } from "@/features/platform/hooks/useInstruments";
import {
  type InstrumentItem,
  type InstrumentSortKey,
} from "@/features/platform/types/configTypes";

interface SortHeaderProps {
  label: string;
  isActive: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
}

function SortHeader({ label, isActive, direction, onClick }: SortHeaderProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer items-center gap-1.5 text-left transition-colors hover:text-bvc-ink uppercase"
    >
      <span>{label}</span>
      {isActive ? (
        direction === "asc" ? (
          <ArrowUp size={13} className="text-bvc-ink" />
        ) : (
          <ArrowDown size={13} className="text-bvc-ink" />
        )
      ) : (
        <ArrowUpDown size={12} className="opacity-40" />
      )}
    </button>
  );
}

export interface InstrumentInfoPanelProps {
  onSelectTunes?: (instrument: InstrumentItem) => void;
}

export function InstrumentInfoPanel({ onSelectTunes }: InstrumentInfoPanelProps) {
  const { filters, updateFilters, items, error, isLoading, saveInstrument, toggleActive, reload } = useInstruments();
  const [searchText, setSearchText] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<InstrumentItem | null>(null);
  const appliedQuery = filters.q;

  useEffect(() => {
    const nextQuery = searchText.trim();
    if (nextQuery === appliedQuery) return;
    const timer = window.setTimeout(() => updateFilters({ q: nextQuery }), 300);
    return () => window.clearTimeout(timer);
  }, [searchText, appliedQuery, updateFilters]);

  const openForm = (instrument: InstrumentItem | null) => {
    setFormTarget(instrument);
    setIsFormOpen(true);
  };

  const toggleSort = (key: InstrumentSortKey) => {
    updateFilters({ sortBy: key, sortDir: filters.sortBy === key && filters.sortDir === "asc" ? "desc" : "asc" });
  };

  const hasActiveFilters = Boolean(filters.status !== "all" || filters.q);

  const resetFilters = () => {
    setSearchText("");
    updateFilters({ status: "all", q: "" });
  };

  const activeCount = useMemo(() => items.filter((item) => item.isActive).length, [items]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-bvc-border bg-white p-3 shadow-none">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative flex flex-1 items-center sm:max-w-[280px]">
            <Search size={15} className="pointer-events-none absolute left-3 text-bvc-muted" />
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Mã hoặc tên nhạc cụ..."
              maxLength={100}
              className="h-[38px] w-full rounded-[10px] border border-bvc-border-strong bg-white pl-8.5 pr-8 text-[13px] text-bvc-ink placeholder:text-bvc-faint transition-all focus:border-bvc-ink focus:outline-none"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText("")}
                className="absolute right-2.5 cursor-pointer text-bvc-muted hover:text-bvc-ink"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative">
            <Select
              value={filters.status}
              onValueChange={(val) =>
                updateFilters({ status: (val ?? "all") as "all" | "active" | "inactive" })
              }
            >
              <SelectTrigger
                aria-label="Lọc trạng thái nhạc cụ"
                className="h-[38px] min-w-[155px] rounded-[10px] border-bvc-border-strong bg-white px-3 text-[13px] font-medium text-bvc-ink shadow-2xs hover:border-bvc-ink"
              >
                <SelectValue>
                  {(val) => {
                    if (val === "active") return <span className="truncate">Đang hoạt động</span>;
                    if (val === "inactive") return <span className="truncate">Ngừng hoạt động</span>;
                    return <span className="truncate">Tất cả trạng thái</span>;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectPopup positionerClassName="z-50">
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
              </SelectPopup>
            </Select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex h-[38px] cursor-pointer items-center gap-1.5 rounded-[10px] border border-bvc-border bg-bvc-surface/80 px-2.5 text-[12.5px] font-medium text-bvc-muted transition-colors hover:bg-bvc-border hover:text-bvc-ink"
              title="Xóa bộ lọc"
            >
              <X size={13} />
              <span>Xóa lọc</span>
            </button>
          )}

          <button
            type="button"
            onClick={reload}
            disabled={isLoading}
            title="Làm mới danh sách"
            className="flex size-[38px] cursor-pointer items-center justify-center rounded-[10px] border border-bvc-border bg-white text-bvc-muted transition-colors hover:border-bvc-border-strong hover:text-bvc-ink disabled:opacity-50"
          >
            <RotateCw size={15} className={isLoading ? "animate-spin text-bvc-ink" : ""} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => openForm(null)}
          className="flex h-[38px] cursor-pointer items-center gap-1.5 rounded-[10px] bg-bvc-ink px-3.5 text-[13px] font-semibold text-white shadow-xs transition-colors hover:bg-black"
        >
          <Plus size={15} />
          <span>Thêm nhạc cụ</span>
        </button>
      </div>

      <div className="flex flex-col overflow-hidden rounded-[18px] border border-bvc-border bg-white shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-bvc-border bg-bvc-surface/60 text-[11.5px] font-bold text-bvc-muted tracking-wider select-none">
                <th className="px-5 py-3.5 w-[160px]">
                  <SortHeader
                    label="Mã nhạc cụ"
                    isActive={filters.sortBy === "code"}
                    direction={filters.sortDir}
                    onClick={() => toggleSort("code")}
                  />
                </th>
                <th className="px-5 py-3.5 w-[200px]">
                  <SortHeader
                    label="Tên hiển thị"
                    isActive={filters.sortBy === "name"}
                    direction={filters.sortDir}
                    onClick={() => toggleSort("name")}
                  />
                </th>
                <th className="px-5 py-3.5">Mô tả</th>
                <th className="px-5 py-3.5 w-[160px]">Cấu hình dây</th>
                <th className="px-5 py-3.5 w-[160px]">Trạng thái</th>
                <th className="px-5 py-3.5 text-right w-[150px]">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-bvc-border">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-bvc-muted text-[13px]">
                    <div className="flex items-center justify-center gap-2">
                      <RotateCw size={15} className="animate-spin text-bvc-ink" />
                      <span>Đang tải danh sách nhạc cụ...</span>
                    </div>
                  </td>
                </tr>
              )}

              {error && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-bvc-error text-[13px]">
                    <p className="font-semibold">{error}</p>
                    <button
                      type="button"
                      onClick={reload}
                      className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-[8px] bg-bvc-surface px-3 py-1.5 text-[12px] font-semibold text-bvc-ink hover:bg-bvc-border"
                    >
                      <RotateCw size={13} />
                      <span>Thử lại</span>
                    </button>
                  </td>
                </tr>
              )}

              {!isLoading && !error && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <p className="text-[14px] font-bold text-bvc-ink">Không tìm thấy nhạc cụ</p>
                    <p className="mt-1 text-[12.5px] text-bvc-muted">
                      {hasActiveFilters
                        ? "Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc trạng thái."
                        : "Bấm “Thêm nhạc cụ” để tạo mới danh mục nhạc cụ."}
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                items.map((instrument) => (
                  <tr key={instrument.id} className="transition-colors hover:bg-bvc-surface/40">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[12.5px] font-semibold text-bvc-ink bg-bvc-surface border border-bvc-border px-2 py-0.5 rounded-[6px]">
                        {instrument.code}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-bold text-bvc-ink text-[13.5px]">{instrument.name}</td>

                    <td className="px-5 py-3.5 text-bvc-muted">{instrument.description || "-"}</td>

                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => onSelectTunes?.(instrument)}
                        className="whitespace-nowrap flex h-[32px] cursor-pointer items-center gap-1.5 rounded-[8px] border border-bvc-border bg-bvc-surface/60 px-3 text-[12.5px] font-semibold text-bvc-ink transition-all hover:border-bvc-ink hover:bg-white hover:shadow-2xs"
                      >
                        <SlidersHorizontal size={13} className="text-bvc-muted" />
                        <span>Cấu hình dây</span>
                      </button>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className={`size-[7px] shrink-0 rounded-full ${
                            instrument.isActive ? "bg-bvc-ok" : "bg-bvc-bar-strong"
                          }`}
                        />
                        <span
                          className={`text-[13px] ${instrument.isActive ? "font-semibold text-bvc-ink" : "text-bvc-muted"}`}
                        >
                          {instrument.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                        </span>
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openForm(instrument)}
                          title="Sửa nhạc cụ"
                          className="flex h-[32px] cursor-pointer items-center gap-1.5 rounded-[8px] border border-bvc-border bg-white px-2.5 text-[12.5px] font-semibold text-bvc-ink transition-colors hover:border-bvc-ink hover:bg-bvc-surface"
                        >
                          <Pencil size={13} />
                          <span>Sửa</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => void toggleActive(instrument)}
                          title={instrument.isActive ? "Ngừng hoạt động" : "Kích hoạt lại"}
                          className={`flex h-[32px] cursor-pointer items-center gap-1 rounded-[8px] border border-bvc-border px-2.5 text-[12.5px] font-semibold transition-colors hover:bg-white ${
                            instrument.isActive
                              ? "bg-bvc-surface/60 text-bvc-muted hover:border-bvc-error hover:text-bvc-error"
                              : "bg-bvc-surface text-bvc-ok hover:border-bvc-ok hover:text-bvc-ok"
                          }`}
                        >
                          <Power size={13} />
                          <span>{instrument.isActive ? "Ngừng" : "Bật"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-bvc-border bg-bvc-surface/30 px-5 py-3 text-[12px] text-bvc-muted">
          <span>
            Tổng cộng <strong className="font-mono text-bvc-ink">{items.length}</strong> nhạc cụ (
            <strong className="font-mono text-bvc-ink">{activeCount}</strong> đang hoạt động)
          </span>
          <span>Dữ liệu nhạc cụ được đồng bộ với bài tập, thư viện tác phẩm và module thu âm</span>
        </div>
      </div>

      <InstrumentFormDialog
        isOpen={isFormOpen}
        instrument={formTarget}
        onOpenChange={setIsFormOpen}
        onSubmit={(values) => saveInstrument(formTarget?.id ?? null, values)}
      />
    </div>
  );
}
