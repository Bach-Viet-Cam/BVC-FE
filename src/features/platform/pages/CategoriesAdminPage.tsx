import { useEffect, useState } from "react";
import { Pencil, Plus, Power, RotateCw, Search, Trash2, X } from "lucide-react";
import { DesktopPageHeader } from "@/shared/components/bvc";
import { CatalogCategoryFormDialog } from "@/features/platform/components/CatalogCategoryFormDialog";
import { CategoryDeleteDialog } from "@/features/platform/components/CategoryDeleteDialog";
import { CATALOG_CATEGORY_PAGE_SIZE, useCatalogCategories } from "@/features/platform/hooks/useCatalogCategories";
import {
  CATALOG_CATEGORY_TYPE_LABELS,
  type CatalogCategoryItem,
  type CatalogCategoryStatusFilter,
  type CatalogCategoryType,
} from "@/features/platform/types/catalogCategoryTypes";
import { Pagination } from "@/shared/components/bvc/Pagination";
import { SegmentedTabs } from "@/shared/components/bvc/SegmentedTabs";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ActionTooltip } from "@/shared/components/ui/tooltip";

const TYPE_TABS = (["GENRE", "LEVEL"] as const).map((value) => ({ value, label: CATALOG_CATEGORY_TYPE_LABELS[value] }));

const STATUS_FILTERS: CatalogCategoryStatusFilter[] = ["all", "active", "inactive"];

const STATUS_LABELS: Record<CatalogCategoryStatusFilter, string> = {
  all: "Tất cả trạng thái",
  active: "Đang hoạt động",
  inactive: "Ngừng hoạt động",
};

const USAGE_UNITS: Record<CatalogCategoryType, string> = { GENRE: "bài hát", LEVEL: "bản nhạc" };

function isStatusFilter(value: unknown): value is CatalogCategoryStatusFilter {
  return value === "all" || value === "active" || value === "inactive";
}

export function CategoriesAdminPage() {
  const { filters, updateFilters, items, total, error, isLoading, reload, saveCategory, toggleActive, removeCategory } =
    useCatalogCategories();
  const [searchText, setSearchText] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<CatalogCategoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogCategoryItem | null>(null);
  const typeLabel = CATALOG_CATEGORY_TYPE_LABELS[filters.type];
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_CATEGORY_PAGE_SIZE));
  const hasActiveFilters = Boolean(filters.q || filters.status !== "all");

  useEffect(() => {
    const nextQuery = searchText.trim();
    if (nextQuery === filters.q) return;
    const timer = window.setTimeout(() => updateFilters({ q: nextQuery }), 300);
    return () => window.clearTimeout(timer);
  }, [searchText, filters.q, updateFilters]);

  const openForm = (category: CatalogCategoryItem | null) => {
    setFormTarget(category);
    setIsFormOpen(true);
  };

  const changeType = (type: CatalogCategoryType) => {
    setSearchText("");
    updateFilters({ type, q: "", status: "all" });
  };

  const resetFilters = () => {
    setSearchText("");
    updateFilters({ q: "", status: "all" });
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[#FAF9F7]">
      <DesktopPageHeader
        breadcrumb="Quản trị nội dung"
        title="Phân loại nội dung"
        actions={
          <div className="flex items-center gap-2.5">
            <ActionTooltip content="Làm mới dữ liệu">
              <button
                type="button"
                onClick={reload}
                disabled={isLoading}
                aria-label="Làm mới dữ liệu"
                className="flex size-[42px] cursor-pointer items-center justify-center rounded-[12px] border border-bvc-border bg-white text-bvc-muted transition-colors hover:border-bvc-border-strong hover:text-bvc-ink disabled:opacity-50"
              >
                <RotateCw size={16} className={isLoading ? "animate-spin text-bvc-ink" : ""} />
              </button>
            </ActionTooltip>
            <button
              type="button"
              onClick={() => openForm(null)}
              className="flex min-h-[42px] cursor-pointer items-center gap-2 rounded-[12px] bg-bvc-ink px-4 text-[13.5px] font-medium text-white transition-colors hover:bg-black"
            >
              <Plus size={16} />
              <span>Thêm {typeLabel.toLowerCase()}</span>
            </button>
          </div>
        }
      />

      <div className="flex min-w-0 flex-1 flex-col gap-4 p-6 md:px-8">
        <SegmentedTabs label="Loại danh mục" tabs={TYPE_TABS} value={filters.type} onChange={changeType} />

        <div className="flex flex-wrap items-center gap-2.5 rounded-[14px] border border-bvc-border bg-white p-3">
          <div className="relative flex flex-1 items-center sm:max-w-[280px]">
            <Search size={15} className="pointer-events-none absolute left-3 text-bvc-muted" />
            <input
              type="search"
              aria-label={`Tìm ${typeLabel.toLowerCase()}`}
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={`Tìm ${typeLabel.toLowerCase()}...`}
              maxLength={100}
              className="h-[38px] w-full rounded-[10px] border border-bvc-border-strong bg-white pr-8 pl-8.5 text-[13px] text-bvc-ink transition-all placeholder:text-bvc-faint focus:border-bvc-ink focus:outline-none"
            />
          </div>

          <Select
            value={filters.status}
            onValueChange={(value) => updateFilters({ status: isStatusFilter(value) ? value : "all" })}
          >
            <SelectTrigger
              aria-label="Lọc trạng thái danh mục"
              className="h-[38px] min-w-[155px] rounded-[10px] border-bvc-border-strong bg-white px-3 text-[13px] font-medium text-bvc-ink shadow-2xs hover:border-bvc-ink"
            >
              <SelectValue>{(value) => (isStatusFilter(value) ? STATUS_LABELS[value] : STATUS_LABELS.all)}</SelectValue>
            </SelectTrigger>
            <SelectPopup positionerClassName="z-50">
              {STATUS_FILTERS.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex h-[38px] cursor-pointer items-center gap-1.5 rounded-[10px] border border-bvc-border bg-bvc-surface/80 px-2.5 text-[12.5px] font-medium text-bvc-muted transition-colors hover:bg-bvc-border hover:text-bvc-ink"
            >
              <X size={13} />
              <span>Xóa lọc</span>
            </button>
          )}
        </div>

        <div className="flex flex-col overflow-hidden rounded-[18px] border border-bvc-border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-bvc-border bg-bvc-surface/60 text-[11.5px] font-bold tracking-wider text-bvc-muted uppercase select-none">
                  <th className="w-[220px] px-5 py-3.5">Tên</th>
                  <th className="px-5 py-3.5">Mô tả</th>
                  <th className="w-[100px] px-5 py-3.5">Thứ tự</th>
                  <th className="w-[130px] px-5 py-3.5">Đang dùng</th>
                  <th className="w-[160px] px-5 py-3.5">Trạng thái</th>
                  <th className="w-[200px] px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bvc-border">
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-bvc-muted">
                      <span className="inline-flex items-center gap-2">
                        <RotateCw size={15} className="animate-spin text-bvc-ink" />
                        Đang tải danh mục...
                      </span>
                    </td>
                  </tr>
                )}

                {error && !isLoading && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-bvc-error">
                      <p className="font-semibold">{error}</p>
                      <button
                        type="button"
                        onClick={reload}
                        className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-[8px] bg-bvc-surface px-3 py-1.5 text-[12px] font-semibold text-bvc-ink hover:bg-bvc-border"
                      >
                        <RotateCw size={13} />
                        Thử lại
                      </button>
                    </td>
                  </tr>
                )}

                {!isLoading && !error && items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <p className="text-[14px] font-bold text-bvc-ink">
                        {hasActiveFilters ? "Không tìm thấy danh mục phù hợp" : `Chưa có ${typeLabel.toLowerCase()}`}
                      </p>
                      {hasActiveFilters && (
                        <p className="mt-1 text-[12.5px] text-bvc-muted">
                          Thử từ khóa khác hoặc bỏ chọn bộ lọc trạng thái.
                        </p>
                      )}
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  !error &&
                  items.map((category) => {
                    const isActive = category.status === "ACTIVE";
                    const isInUse = category.usageCount > 0;
                    return (
                      <tr key={category.id} className="transition-colors hover:bg-bvc-surface/40">
                        <td className="px-5 py-3.5 text-[13.5px] font-bold text-bvc-ink">{category.name}</td>
                        <td className="px-5 py-3.5 text-bvc-muted">{category.description || "-"}</td>
                        <td className="px-5 py-3.5 font-mono text-bvc-ink">{category.displayOrder}</td>
                        <td className="px-5 py-3.5 text-bvc-ink">
                          {category.usageCount} {USAGE_UNITS[category.type]}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={`size-[7px] shrink-0 rounded-full ${isActive ? "bg-bvc-ok" : "bg-bvc-bar-strong"}`}
                            />
                            <span className={isActive ? "font-semibold text-bvc-ink" : "text-bvc-muted"}>
                              {isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                            </span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openForm(category)}
                              aria-label={`Sửa ${category.name}`}
                              className="flex h-[32px] cursor-pointer items-center gap-1.5 rounded-[8px] border border-bvc-border bg-white px-2.5 text-[12.5px] font-semibold text-bvc-ink transition-colors hover:border-bvc-ink hover:bg-bvc-surface"
                            >
                              <Pencil size={13} />
                              <span>Sửa</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => void toggleActive(category)}
                              aria-label={`${isActive ? "Ngừng hoạt động" : "Bật lại"} ${category.name}`}
                              className={`flex h-[32px] cursor-pointer items-center gap-1 rounded-[8px] border border-bvc-border px-2.5 text-[12.5px] font-semibold transition-colors hover:bg-white ${
                                isActive
                                  ? "bg-bvc-surface/60 text-bvc-muted hover:border-bvc-error hover:text-bvc-error"
                                  : "bg-bvc-surface text-bvc-ok hover:border-bvc-ok hover:text-bvc-ok"
                              }`}
                            >
                              <Power size={13} />
                              <span>{isActive ? "Ngừng" : "Bật"}</span>
                            </button>
                            <ActionTooltip
                              content={
                                isInUse
                                  ? `Đang được ${category.usageCount} ${USAGE_UNITS[category.type]} sử dụng. Hãy ngừng hoạt động thay vì xóa.`
                                  : `Xóa ${category.name}`
                              }
                            >
                              <button
                                type="button"
                                disabled={isInUse}
                                onClick={() => setDeleteTarget(category)}
                                aria-label={`Xóa ${category.name}`}
                                className="flex size-[32px] cursor-pointer items-center justify-center rounded-[8px] text-bvc-muted transition-colors hover:bg-bvc-surface hover:text-bvc-error disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-bvc-muted"
                              >
                                <Trash2 size={14} />
                              </button>
                            </ActionTooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-bvc-border bg-bvc-surface/30 px-5 py-3 text-[12px] text-bvc-muted">
            <span>
              Tổng cộng <strong className="font-mono text-bvc-ink">{total}</strong> {typeLabel.toLowerCase()}
            </span>
            {totalPages > 1 && (
              <Pagination page={filters.page} totalPages={totalPages} onChange={(page) => updateFilters({ page })} />
            )}
          </div>
        </div>
      </div>

      <CatalogCategoryFormDialog
        isOpen={isFormOpen}
        type={filters.type}
        category={formTarget}
        onOpenChange={setIsFormOpen}
        onSubmit={(values) => saveCategory(formTarget, values)}
      />
      <CategoryDeleteDialog
        target={deleteTarget}
        description="Chỉ xóa được danh mục chưa có bài hát hoặc bản nhạc nào sử dụng. Thao tác này không thể hoàn tác."
        onClose={() => setDeleteTarget(null)}
        onConfirm={removeCategory}
      />
    </div>
  );
}
