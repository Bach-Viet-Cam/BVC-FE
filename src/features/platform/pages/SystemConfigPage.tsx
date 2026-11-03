import { useEffect, useState } from "react";
import { Info, Pencil, RotateCw, Search, X } from "lucide-react";
import { DesktopPageHeader } from "@/shared/components/bvc";
import { TABLE_STYLES } from "@/shared/components/bvc/tableStyles";
import { cn } from "@/shared/utils/cn";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { formatConfigDate, parseSemesters, SEMESTERS_CONFIG_KEY } from "@/features/platform/utils/configValue";
import { SettingFormDialog } from "@/features/platform/components/SettingFormDialog";
import { CONFIG_GROUP_LABELS, CONFIG_GROUP_OPTIONS } from "@/features/platform/constants/configConstants";
import { useSystemConfigs } from "@/features/platform/hooks/useSystemConfigs";
import { type ConfigGroup, type SystemConfigItem } from "@/features/platform/types/configTypes";

const SEMESTERS_DESCRIPTION = "Các học kỳ dùng khi tạo lớp: mỗi học kỳ có tên, ngày bắt đầu và ngày kết thúc.";

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

export function SettingsPanel() {
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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-bvc-border bg-white p-3 shadow-none">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative flex flex-1 items-center sm:max-w-[300px]">
            <Search size={15} className="pointer-events-none absolute left-3 text-bvc-muted" />
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Khóa kỹ thuật, nhãn, giá trị..."
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
              value={filters.group ?? "ALL"}
              onValueChange={(val) => updateFilters({ group: val === "ALL" ? undefined : (val as ConfigGroup) })}
            >
              <SelectTrigger
                aria-label="Lọc theo nhóm cấu hình"
                className="h-[38px] min-w-[160px] rounded-[10px] border-bvc-border-strong bg-white px-3 text-[13px] font-medium text-bvc-ink shadow-2xs hover:border-bvc-ink"
              >
                <SelectValue>
                  {(val) => {
                    const opt = CONFIG_GROUP_OPTIONS.find((o) => o.value === val);
                    return <span className="truncate">{opt?.label ?? "Tất cả nhóm"}</span>;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectPopup positionerClassName="z-50">
                <SelectItem value="ALL">Tất cả nhóm</SelectItem>
                {CONFIG_GROUP_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
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
            title="Làm mới tham số"
            className="flex size-[38px] cursor-pointer items-center justify-center rounded-[10px] border border-bvc-border bg-white text-bvc-muted transition-colors hover:border-bvc-border-strong hover:text-bvc-ink disabled:opacity-50"
          >
            <RotateCw size={15} className={isLoading ? "animate-spin text-bvc-ink" : ""} />
          </button>
        </div>

        <span className="shrink-0 font-mono text-[13px] text-bvc-muted">
          {items.length} <span className="font-sans text-[12px] text-bvc-faint">tham số</span>
        </span>
      </div>

      <div className="flex flex-col overflow-hidden rounded-bvc-xl border border-bvc-border bg-white shadow-none">
        <div className="overflow-x-auto">
          <table className={cn(TABLE_STYLES.table, TABLE_STYLES.dense, "min-w-[920px]")}>
            <thead>
              <tr className={cn(TABLE_STYLES.headRow, TABLE_STYLES.headText)}>
                <th className="px-5 py-3.5 w-[380px]">Tham số & Khóa kỹ thuật</th>
                <th className="px-5 py-3.5 w-[180px]">Nhóm nghiệp vụ</th>
                <th className="px-5 py-3.5">Giá trị cấu hình</th>
                <th className="px-5 py-3.5 w-[110px] text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody>
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
                    <p className="text-[14px] font-semibold text-bvc-ink">Không tìm thấy tham số phù hợp</p>
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
                  const isSemesters = config.key === SEMESTERS_CONFIG_KEY;
                  const jsonItems = isJson
                    ? isSemesters
                      ? parseSemesters(config.value).map(
                          (semester) =>
                            `${semester.name} · ${formatConfigDate(semester.startDate)} – ${formatConfigDate(semester.endDate)}`
                        )
                      : parseJsonArray(config.value)
                    : [];
                  const isBytes = config.key.includes("SIZE_BYTES");
                  const isAccuracy = config.key.includes("ACCURACY");

                  return (
                    <tr key={config.id} className={TABLE_STYLES.row}>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-bvc-ink text-[13.5px]">{config.label}</span>
                            <span className="font-mono text-[11px] font-medium text-bvc-muted bg-bvc-surface border border-bvc-border px-1.5 py-0.5 rounded-[5px]">
                              {config.key}
                            </span>
                          </div>
                          {(isSemesters ? SEMESTERS_DESCRIPTION : config.description) && (
                            <p className="text-[12px] leading-relaxed text-bvc-muted">
                              {isSemesters ? SEMESTERS_DESCRIPTION : config.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-block rounded-[7px] border border-bvc-border bg-bvc-surface/70 px-2 py-0.5 text-[11.5px] font-medium text-bvc-muted">
                          {CONFIG_GROUP_LABELS[config.group]}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        {config.valueType === "BOOLEAN" && (
                          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium">
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
                                className="font-mono text-[11.5px] font-medium text-bvc-ink bg-bvc-surface border border-bvc-border px-2 py-0.5 rounded-[6px]"
                              >
                                {val}
                              </span>
                            ))}
                            {jsonItems.length === 0 && <span className="text-[12px] text-bvc-muted italic">Trống</span>}
                          </div>
                        )}

                        {!isJson && config.valueType !== "BOOLEAN" && isBytes && (
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-[13.5px] font-semibold text-bvc-ink">
                              {formatBytes(config.value)}
                            </span>
                            <span className="font-mono text-[11px] text-bvc-muted">
                              ({Number(config.value).toLocaleString()} bytes)
                            </span>
                          </div>
                        )}

                        {!isJson && config.valueType !== "BOOLEAN" && isAccuracy && (
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-[13.5px] font-semibold text-bvc-ink">
                              {Math.round(Number(config.value) * 100)}%
                            </span>
                            <span className="font-mono text-[11px] text-bvc-muted">({config.value})</span>
                          </div>
                        )}

                        {!isJson && config.valueType !== "BOOLEAN" && !isBytes && !isAccuracy && (
                          <span className="font-mono text-[13px] font-semibold text-bvc-ink">
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
                          className="inline-flex h-[32px] cursor-pointer items-center gap-1.5 rounded-[8px] border border-bvc-border bg-white px-3 text-[12.5px] font-medium text-bvc-ink transition-colors hover:border-bvc-ink hover:bg-bvc-surface"
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
            Các tham số ngưỡng chấm (Accuracy tối thiểu, biên Nguy cơ) trực tiếp điều khiển thuật toán đánh giá ở module
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
  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[#FAF9F7]">
      <DesktopPageHeader breadcrumb="Quản trị" title="Cấu hình hệ thống" />
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-6 md:px-8">
        <SettingsPanel />
      </div>
    </div>
  );
}
