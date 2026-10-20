import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Info,
  Music2,
  Pencil,
  Plus,
  Power,
  RotateCw,
  Search,
  Sliders,
  X,
} from "lucide-react";
import { DesktopPageHeader } from "@/shared/components/bvc";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/shared/components/ui/tabs";
import { InstrumentFormDialog } from "@/features/platform/components/InstrumentFormDialog";
import { SettingFormDialog } from "@/features/platform/components/SettingFormDialog";
import {
  CONFIG_GROUP_LABELS,
  CONFIG_GROUP_OPTIONS,
  INSTRUMENT_STATUS_OPTIONS,
} from "@/features/platform/constants/configConstants";
import { useInstruments } from "@/features/platform/hooks/useInstruments";
import { useSystemConfigs } from "@/features/platform/hooks/useSystemConfigs";
import {
  type InstrumentItem,
  type InstrumentSortKey,
  type SystemConfigItem,
} from "@/features/platform/types/configTypes";

function parseJsonArray(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function formatBytes(bytesStr: string): string {
  const bytes = Number(bytesStr);
  if (isNaN(bytes) || bytes <= 0) return bytesStr;
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 0)} ${units[i]}`;
}

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

function InstrumentsTab() {
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
      <div className="flex flex-col gap-3 rounded-[16px] border border-bvc-border bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex flex-wrap items-center rounded-[12px] border border-bvc-border/80 bg-bvc-surface/60 p-1">
          {INSTRUMENT_STATUS_OPTIONS.map((opt) => {
            const isActive = filters.status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateFilters({ status: opt.value })}
                className={`cursor-pointer rounded-[9px] px-3.5 py-1.5 text-[13px] font-semibold transition-all select-none ${
                  isActive ? "bg-white text-bvc-ink shadow-xs" : "text-bvc-muted hover:text-bvc-ink"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex items-center">
            <Search size={15} className="pointer-events-none absolute left-3 text-bvc-muted" />
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Mã hoặc tên nhạc cụ..."
              maxLength={100}
              className="h-[38px] w-[240px] rounded-[11px] border border-bvc-border-strong bg-white pl-8.5 pr-8 text-[13px] text-bvc-ink placeholder:text-bvc-faint transition-all focus:border-bvc-ink focus:outline-none"
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

          <button
            type="button"
            onClick={reload}
            disabled={isLoading}
            title="Làm mới danh sách"
            className="flex size-[38px] cursor-pointer items-center justify-center rounded-[11px] border border-bvc-border bg-white text-bvc-muted transition-colors hover:border-bvc-border-strong hover:text-bvc-ink disabled:opacity-50"
          >
            <RotateCw size={15} className={isLoading ? "animate-spin text-bvc-ink" : ""} />
          </button>

          <button
            type="button"
            onClick={() => openForm(null)}
            className="flex min-h-[38px] cursor-pointer items-center gap-2 rounded-[11px] bg-bvc-ink px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-black"
          >
            <Plus size={15} />
            <span>Thêm nhạc cụ</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-[18px] border border-bvc-border bg-white shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-bvc-border bg-bvc-surface/50 text-[11.5px] font-bold uppercase tracking-[0.06em] text-bvc-muted">
                <th className="px-5 py-3.5 w-[200px]">
                  <SortHeader
                    label="Mã nhạc cụ (Slug)"
                    isActive={filters.sortBy === "code"}
                    direction={filters.sortDir}
                    onClick={() => toggleSort("code")}
                  />
                </th>
                <th className="px-5 py-3.5 w-[240px]">
                  <SortHeader
                    label="Tên hiển thị"
                    isActive={filters.sortBy === "name"}
                    direction={filters.sortDir}
                    onClick={() => toggleSort("name")}
                  />
                </th>
                <th className="px-5 py-3.5">Mô tả</th>
                <th className="px-5 py-3.5 w-[180px]">Trạng thái</th>
                <th className="px-5 py-3.5 w-[160px] text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-bvc-line">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[13.5px] text-bvc-muted">
                    Đang tải dữ liệu nhạc cụ...
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[13.5px] text-bvc-error">
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <p className="text-[14px] font-bold text-bvc-ink">Không tìm thấy nhạc cụ phù hợp</p>
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

                    <td className="px-5 py-3.5 font-bold text-bvc-ink text-[13.5px]">
                      {instrument.name}
                    </td>

                    <td className="px-5 py-3.5 text-bvc-muted">
                      {instrument.description || "—"}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className={`size-[7px] shrink-0 rounded-full ${
                            instrument.isActive ? "bg-bvc-ok" : "bg-bvc-bar-strong"
                          }`}
                        />
                        <span className={`text-[13px] ${instrument.isActive ? "font-semibold text-bvc-ink" : "text-bvc-muted"}`}>
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

function SettingsTab() {
  const { filters, updateFilters, items, error, isLoading, saveValue, reload } = useSystemConfigs();
  const [searchText, setSearchText] = useState("");
  const [editTarget, setEditTarget] = useState<SystemConfigItem | null>(null);
  const appliedQuery = filters.q;

  useEffect(() => {
    const nextQuery = searchText.trim();
    if (nextQuery === appliedQuery) return;
    const timer = window.setTimeout(() => updateFilters({ q: nextQuery }), 300);
    return () => window.clearTimeout(timer);
  }, [searchText, appliedQuery, updateFilters]);

  const hasActiveFilters = Boolean(filters.group || filters.q);

  const resetFilters = () => {
    setSearchText("");
    updateFilters({ group: undefined, q: "" });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-[16px] border border-bvc-border bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex flex-wrap items-center rounded-[12px] border border-bvc-border/80 bg-bvc-surface/60 p-1">
          <button
            type="button"
            onClick={() => updateFilters({ group: undefined })}
            className={`cursor-pointer rounded-[9px] px-3.5 py-1.5 text-[13px] font-semibold transition-all select-none ${
              filters.group === undefined ? "bg-white text-bvc-ink shadow-xs" : "text-bvc-muted hover:text-bvc-ink"
            }`}
          >
            Tất cả nhóm
          </button>
          {CONFIG_GROUP_OPTIONS.map((opt) => {
            const isActive = filters.group === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateFilters({ group: opt.value })}
                className={`cursor-pointer rounded-[9px] px-3.5 py-1.5 text-[13px] font-semibold transition-all select-none ${
                  isActive ? "bg-white text-bvc-ink shadow-xs" : "text-bvc-muted hover:text-bvc-ink"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex items-center">
            <Search size={15} className="pointer-events-none absolute left-3 text-bvc-muted" />
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Khóa kỹ thuật, nhãn, giá trị..."
              maxLength={100}
              className="h-[38px] w-[260px] rounded-[11px] border border-bvc-border-strong bg-white pl-8.5 pr-8 text-[13px] text-bvc-ink placeholder:text-bvc-faint transition-all focus:border-bvc-ink focus:outline-none"
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

          <button
            type="button"
            onClick={reload}
            disabled={isLoading}
            title="Làm mới tham số"
            className="flex size-[38px] cursor-pointer items-center justify-center rounded-[11px] border border-bvc-border bg-white text-bvc-muted transition-colors hover:border-bvc-border-strong hover:text-bvc-ink disabled:opacity-50"
          >
            <RotateCw size={15} className={isLoading ? "animate-spin text-bvc-ink" : ""} />
          </button>

          <span className="ml-1 font-mono text-[13px] text-bvc-muted">
            {items.length} <span className="font-sans text-[12px] text-bvc-faint">tham số</span>
          </span>
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-[18px] border border-bvc-border bg-white shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-bvc-border bg-bvc-surface/50 text-[11.5px] font-bold uppercase tracking-[0.06em] text-bvc-muted">
                <th className="px-5 py-3.5 w-[380px]">Tham số & Khóa kỹ thuật</th>
                <th className="px-5 py-3.5 w-[180px]">Nhóm nghiệp vụ</th>
                <th className="px-5 py-3.5">Giá trị cấu hình</th>
                <th className="px-5 py-3.5 w-[110px] text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-bvc-line">
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-[13.5px] text-bvc-muted">
                    Đang tải tham số hệ thống...
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-[13.5px] text-bvc-error">
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center">
                    <p className="text-[14px] font-bold text-bvc-ink">Không tìm thấy tham số phù hợp</p>
                    <p className="mt-1 text-[12.5px] text-bvc-muted">
                      Thử thay đổi từ khóa tìm kiếm hoặc lọc theo nhóm khác.
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                items.map((config) => {
                  const isJson = config.valueType === "JSON";
                  const jsonItems = isJson ? parseJsonArray(config.value) : [];
                  const isBytes = config.key.includes("SIZE_BYTES");
                  const isAccuracy = config.key.includes("ACCURACY");

                  return (
                    <tr key={config.id} className="transition-colors hover:bg-bvc-surface/40">
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-bvc-ink text-[13.5px]">{config.label}</span>
                            <span className="font-mono text-[11px] font-semibold text-bvc-muted bg-bvc-surface border border-bvc-border px-1.5 py-0.5 rounded-[5px]">
                              {config.key}
                            </span>
                          </div>
                          {config.description && (
                            <p className="text-[12px] leading-relaxed text-bvc-muted">{config.description}</p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-block rounded-[7px] border border-bvc-border bg-bvc-surface/70 px-2 py-0.5 text-[11.5px] font-semibold text-bvc-muted">
                          {CONFIG_GROUP_LABELS[config.group]}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        {config.valueType === "BOOLEAN" && (
                          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold">
                            <span
                              className={`size-[7px] rounded-full ${
                                config.value === "true" ? "bg-bvc-ok" : "bg-bvc-bar-strong"
                              }`}
                            />
                            <span className={config.value === "true" ? "text-bvc-ink" : "text-bvc-muted"}>
                              {config.value === "true" ? "Bật (Kích hoạt)" : "Tắt (Không kích hoạt)"}
                            </span>
                          </span>
                        )}

                        {isJson && (
                          <div className="flex flex-wrap gap-1.5">
                            {jsonItems.map((val) => (
                              <span
                                key={val}
                                className="font-mono text-[11.5px] font-semibold text-bvc-ink bg-bvc-surface border border-bvc-border px-2 py-0.5 rounded-[6px]"
                              >
                                {val}
                              </span>
                            ))}
                            {jsonItems.length === 0 && (
                              <span className="text-[12px] text-bvc-muted italic">Trống</span>
                            )}
                          </div>
                        )}

                        {!isJson && config.valueType !== "BOOLEAN" && isBytes && (
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-[13.5px] font-bold text-bvc-ink">
                              {formatBytes(config.value)}
                            </span>
                            <span className="font-mono text-[11px] text-bvc-muted">
                              ({Number(config.value).toLocaleString()} bytes)
                            </span>
                          </div>
                        )}

                        {!isJson && config.valueType !== "BOOLEAN" && isAccuracy && (
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-[13.5px] font-bold text-bvc-ink">
                              {Math.round(Number(config.value) * 100)}%
                            </span>
                            <span className="font-mono text-[11px] text-bvc-muted">
                              ({config.value})
                            </span>
                          </div>
                        )}

                        {!isJson &&
                          config.valueType !== "BOOLEAN" &&
                          !isBytes &&
                          !isAccuracy && (
                            <span className="font-mono text-[13px] font-bold text-bvc-ink">
                              {config.value}
                              {config.key.includes("ATTEMPTS") ? " lần" : ""}
                              {config.key.includes("DAYS") ? " ngày" : ""}
                              {config.key.includes("DURATION") ? " giây" : ""}
                            </span>
                          )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setEditTarget(config)}
                          className="inline-flex h-[32px] cursor-pointer items-center gap-1.5 rounded-[8px] border border-bvc-border bg-white px-3 text-[12.5px] font-semibold text-bvc-ink transition-colors hover:border-bvc-ink hover:bg-bvc-surface"
                        >
                          <Pencil size={13} />
                          <span>Sửa</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="flex items-start gap-2.5 border-t border-bvc-border bg-bvc-surface/40 px-5 py-3 text-[12px] leading-relaxed text-bvc-muted">
          <Info size={15} className="mt-0.5 shrink-0 text-bvc-ink" />
          <p>
            Các tham số chấm điểm (Accuracy tối thiểu, biên Nguy cơ) trực tiếp điều khiển thuật toán đánh giá ở module
            Thu âm và màn Theo dõi tiến độ sinh viên. Thay đổi tham số chỉ áp dụng cho các lượt thu âm hoặc tác vụ phát
            sinh sau thời điểm cập nhật.
          </p>
        </div>
      </div>

      <SettingFormDialog
        config={editTarget}
        onOpenChange={(isOpen) => !isOpen && setEditTarget(null)}
        onSubmit={saveValue}
      />
    </div>
  );
}

export function SystemConfigPage() {
  const instruments = useInstruments();
  const configs = useSystemConfigs();

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#FAF9F7]">
      <DesktopPageHeader
        breadcrumb="SCR-M06-06 · Quản trị hệ thống"
        title="Cấu hình hệ thống"
      />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-bvc-border bg-white px-5 py-3">
          <div className="flex flex-wrap items-center gap-6 text-[13px]">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-bvc-ink" />
              <span className="text-bvc-muted">Tham số hệ thống:</span>
              <span className="font-mono font-bold text-bvc-ink">{configs.items.length}</span>
              <span className="text-[12px] text-bvc-muted">chỉ số</span>
            </div>

            <div className="h-3.5 w-px bg-bvc-border" />

            <div className="flex items-center gap-2">
              <Music2 size={16} className="text-bvc-ink" />
              <span className="text-bvc-muted">Nhạc cụ chuẩn hóa:</span>
              <span className="font-mono font-bold text-bvc-ink">{instruments.items.length}</span>
              <span className="text-[12px] text-bvc-muted">loại</span>
            </div>
          </div>

          <p className="text-[12px] text-bvc-muted">
            Quản lý quy chuẩn kỹ thuật cho toàn bộ môi trường luyện tập và thư viện âm nhạc
          </p>
        </div>

        <Tabs defaultValue="settings" className="flex flex-1 flex-col gap-4">
          <div className="inline-flex self-start rounded-[12px] border border-bvc-border/80 bg-bvc-surface/60 p-1">
            <TabsList className="bg-transparent p-0 gap-1">
              <TabsTab
                value="settings"
                className="cursor-pointer rounded-[9px] px-4 py-2 text-[13.5px] font-semibold text-bvc-muted transition-all data-[selected]:bg-white data-[selected]:text-bvc-ink data-[selected]:shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Sliders size={14} />
                  <span>Tham số hệ thống</span>
                  <span className="font-mono text-[11px] text-bvc-muted bg-bvc-surface px-1.5 py-0.5 rounded-[5px]">
                    {configs.items.length}
                  </span>
                </div>
              </TabsTab>
              <TabsTab
                value="instruments"
                className="cursor-pointer rounded-[9px] px-4 py-2 text-[13.5px] font-semibold text-bvc-muted transition-all data-[selected]:bg-white data-[selected]:text-bvc-ink data-[selected]:shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Music2 size={14} />
                  <span>Nhạc cụ truyền thống</span>
                  <span className="font-mono text-[11px] text-bvc-muted bg-bvc-surface px-1.5 py-0.5 rounded-[5px]">
                    {instruments.items.length}
                  </span>
                </div>
              </TabsTab>
            </TabsList>
          </div>

          <TabsPanel value="settings">
            <SettingsTab />
          </TabsPanel>

          <TabsPanel value="instruments">
            <InstrumentsTab />
          </TabsPanel>
        </Tabs>
      </div>
    </main>
  );
}
