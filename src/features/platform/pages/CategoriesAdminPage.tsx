import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderPlus,
  FolderTree,
  Music2,
  Pencil,
  Plus,
  Power,
  RotateCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { DesktopPageHeader } from "@/shared/components/bvc";
import { CategoryDeleteDialog } from "@/features/platform/components/CategoryDeleteDialog";
import { CategoryFormDialog } from "@/features/platform/components/CategoryFormDialog";
import { InstrumentFormDialog } from "@/features/platform/components/InstrumentFormDialog";
import { PageStatus } from "@/features/platform/components/PageStatus";
import { useContentCategories } from "@/features/platform/hooks/useContentCategories";
import { useInstruments } from "@/features/platform/hooks/useInstruments";
import { type CategoryFormTarget } from "@/features/platform/types/categoryTypes";
import { type InstrumentItem } from "@/features/platform/types/configTypes";

export function CategoriesAdminPage() {
  const { items, error, isLoading, reload, saveCategory, removeCategory } = useContentCategories();
  const instruments = useInstruments();

  const [categorySearch, setCategorySearch] = useState("");
  const [instrumentSearch, setInstrumentSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [categoryTarget, setCategoryTarget] = useState<CategoryFormTarget | null>(null);
  const [defaultParentId, setDefaultParentId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const [isInstrumentFormOpen, setIsInstrumentFormOpen] = useState(false);
  const [instrumentTarget, setInstrumentTarget] = useState<InstrumentItem | null>(null);

  const totalRoots = items.length;
  const totalChildren = useMemo(
    () => items.reduce((acc, cat) => acc + cat.children.length, 0),
    [items]
  );
  const totalPieces = useMemo(
    () => items.reduce((acc, cat) => acc + cat.pieceCount, 0),
    [items]
  );
  const activeInstrumentsCount = useMemo(
    () => instruments.items.filter((item) => item.isActive).length,
    [instruments.items]
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    items.forEach((cat) => {
      next[cat.id] = true;
    });
    setExpandedIds(next);
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    items.forEach((cat) => {
      next[cat.id] = false;
    });
    setExpandedIds(next);
  };

  const isExpanded = (id: string) => {
    return expandedIds[id] ?? true; // Default expanded
  };

  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return items;

    return items
      .map((cat) => {
        const matchesParent = cat.name.toLowerCase().includes(q);
        const matchingChildren = cat.children.filter((child) => child.name.toLowerCase().includes(q));

        if (matchesParent) return cat;
        if (matchingChildren.length > 0) {
          return {
            ...cat,
            children: matchingChildren,
          };
        }
        return null;
      })
      .filter((cat): cat is NonNullable<typeof cat> => cat !== null);
  }, [items, categorySearch]);

  const filteredInstruments = useMemo(() => {
    const q = instrumentSearch.trim().toLowerCase();
    if (!q) return instruments.items;
    return instruments.items.filter(
      (item) => item.code.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)
    );
  }, [instruments.items, instrumentSearch]);

  const openCategoryForm = (target: CategoryFormTarget | null, parentId = "") => {
    setCategoryTarget(target);
    setDefaultParentId(parentId);
    setIsCategoryFormOpen(true);
  };

  const openInstrumentForm = (instrument: InstrumentItem | null) => {
    setInstrumentTarget(instrument);
    setIsInstrumentFormOpen(true);
  };

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#FAF9F7]">
      <DesktopPageHeader
        breadcrumb="Quản trị nội dung"
        title="Phân loại nội dung"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                void reload();
                void instruments.reload();
              }}
              disabled={isLoading || instruments.isLoading}
              title="Làm mới dữ liệu"
              className="flex size-[42px] cursor-pointer items-center justify-center rounded-[12px] border border-bvc-border bg-white text-bvc-muted transition-colors hover:border-bvc-border-strong hover:text-bvc-ink disabled:opacity-50"
            >
              <RotateCw size={16} className={isLoading || instruments.isLoading ? "animate-spin text-bvc-ink" : ""} />
            </button>

            <button
              type="button"
              onClick={() => openCategoryForm(null)}
              className="flex min-h-[42px] cursor-pointer items-center gap-2 rounded-[12px] bg-bvc-ink px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-black"
            >
              <FolderPlus size={16} />
              <span>Thêm danh mục gốc</span>
            </button>
          </div>
        }
      />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-bvc-border bg-white px-5 py-3">
          <div className="flex flex-wrap items-center gap-6 text-[13px]">
            <div className="flex items-center gap-2">
              <span className="text-bvc-muted">Danh mục:</span>
              <span className="font-mono font-bold text-bvc-ink">{totalRoots}</span>
              <span className="text-[12px] text-bvc-muted">gốc</span>
              <span className="text-bvc-faint">/</span>
              <span className="font-mono font-bold text-bvc-ink">{totalChildren}</span>
              <span className="text-[12px] text-bvc-muted">nhánh con</span>
            </div>

            <div className="h-3.5 w-px bg-bvc-border" />

            <div className="flex items-center gap-2">
              <span className="text-bvc-muted">Bài nhạc đã gán:</span>
              <span className="font-mono font-bold text-bvc-ink">{totalPieces}</span>
              <span className="text-[12px] text-bvc-muted">tác phẩm</span>
            </div>

            <div className="h-3.5 w-px bg-bvc-border" />

            <div className="flex items-center gap-2">
              <span className="text-bvc-muted">Nhạc cụ hệ thống:</span>
              <span className="font-mono font-bold text-bvc-ink">{activeInstrumentsCount}</span>
              <span className="text-[12px] text-bvc-muted">/ {instruments.items.length} đang kích hoạt</span>
            </div>
          </div>

          <p className="text-[12px] text-bvc-muted">
            Cấu trúc phân loại 2 cấp phục vụ thư viện, tìm kiếm và bài tập
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="flex flex-col overflow-hidden rounded-[18px] border border-bvc-border bg-white lg:col-span-7">
            <div className="flex flex-col gap-3 border-b border-bvc-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-[32px] items-center justify-center rounded-[8px] bg-bvc-surface text-bvc-ink">
                  <FolderTree size={16} />
                </div>
                <div>
                  <h2 className="text-[15px] font-extrabold tracking-[-0.02em] text-bvc-ink">
                    Cây danh mục nội dung
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <Search size={14} className="pointer-events-none absolute left-3 text-bvc-muted" />
                  <input
                    type="search"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Tìm danh mục..."
                    className="h-[36px] w-[180px] rounded-[10px] border border-bvc-border-strong bg-white pl-8 pr-7 text-[13px] text-bvc-ink placeholder:text-bvc-faint transition-colors focus:border-bvc-ink focus:outline-none"
                  />
                  {categorySearch && (
                    <button
                      type="button"
                      onClick={() => setCategorySearch("")}
                      className="absolute right-2 cursor-pointer text-bvc-muted hover:text-bvc-ink"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="flex items-center rounded-[9px] border border-bvc-border bg-bvc-surface/60 p-0.5">
                  <button
                    type="button"
                    onClick={expandAll}
                    title="Mở rộng tất cả"
                    className="cursor-pointer rounded-[7px] px-2 py-1 text-[11.5px] font-semibold text-bvc-muted transition-colors hover:text-bvc-ink"
                  >
                    Mở rộng
                  </button>
                  <button
                    type="button"
                    onClick={collapseAll}
                    title="Thu gọn tất cả"
                    className="cursor-pointer rounded-[7px] px-2 py-1 text-[11.5px] font-semibold text-bvc-muted transition-colors hover:text-bvc-ink"
                  >
                    Thu gọn
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4">
              <PageStatus isLoading={isLoading} error={error} onRetry={reload}>
                {filteredCategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex size-[44px] items-center justify-center rounded-[12px] bg-bvc-surface text-bvc-muted">
                      <Folder size={20} />
                    </div>
                    <p className="mt-3 text-[14px] font-bold text-bvc-ink">
                      {categorySearch ? "Không tìm thấy danh mục phù hợp" : "Chưa có danh mục nội dung"}
                    </p>
                    <p className="mt-1 text-[12.5px] text-bvc-muted">
                      {categorySearch
                        ? `Không có kết quả cho từ khóa “${categorySearch}”. Hãy thử tìm từ khóa khác.`
                        : "Bấm “Thêm danh mục gốc” phía trên để thiết lập cây thư mục ban đầu."}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {filteredCategories.map((category) => {
                      const expanded = isExpanded(category.id);
                      return (
                        <div
                          key={category.id}
                          className="group rounded-[14px] border border-bvc-border bg-white transition-colors hover:border-bvc-border-strong"
                        >
                          <div className="flex items-center justify-between gap-3 p-3">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <button
                                type="button"
                                onClick={() => toggleExpand(category.id)}
                                aria-label={expanded ? "Thu gọn danh mục" : "Mở rộng danh mục"}
                                className="flex size-[28px] cursor-pointer items-center justify-center rounded-[7px] text-bvc-muted transition-colors hover:bg-bvc-surface hover:text-bvc-ink"
                              >
                                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </button>

                              <Folder size={17} className="shrink-0 text-bvc-ink" />

                              <span className="truncate text-[14px] font-bold text-bvc-ink">
                                {category.name}
                              </span>

                              <span className="font-mono text-[11.5px] font-medium text-bvc-muted bg-bvc-surface border border-bvc-border px-2 py-0.5 rounded-[6px]">
                                {category.pieceCount} bài
                              </span>

                              {category.children.length > 0 && (
                                <span className="hidden font-mono text-[11px] text-bvc-faint sm:inline">
                                  {category.children.length} nhánh con
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openCategoryForm(null, category.id)}
                                title={`Thêm nhánh con cho ${category.name}`}
                                className="flex h-[30px] cursor-pointer items-center gap-1 rounded-[8px] border border-bvc-border bg-bvc-surface/60 px-2 text-[12px] font-medium text-bvc-ink transition-colors hover:border-bvc-border-strong hover:bg-white"
                              >
                                <Plus size={13} />
                                <span className="hidden sm:inline">Thêm con</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openCategoryForm({ id: category.id, name: category.name, parentId: null })
                                }
                                title={`Đổi tên ${category.name}`}
                                className="flex size-[30px] cursor-pointer items-center justify-center rounded-[8px] text-bvc-muted transition-colors hover:bg-bvc-surface hover:text-bvc-ink"
                              >
                                <Pencil size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteTarget({ id: category.id, name: category.name })}
                                title={`Xóa ${category.name}`}
                                className="flex size-[30px] cursor-pointer items-center justify-center rounded-[8px] text-bvc-muted transition-colors hover:bg-bvc-surface hover:text-bvc-error"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {expanded && category.children.length > 0 && (
                            <div className="border-t border-bvc-line bg-bvc-surface/20 px-3 py-2">
                              <div className="ml-4 flex flex-col gap-1 border-l-2 border-bvc-border pl-3">
                                {category.children.map((child) => (
                                  <div
                                    key={child.id}
                                    className="flex min-h-[36px] items-center justify-between rounded-[8px] px-2.5 py-1 text-[13px] transition-colors hover:bg-white"
                                  >
                                    <div className="flex min-w-0 items-center gap-2">
                                      <span className="size-[5px] shrink-0 rounded-full bg-bvc-muted" />
                                      <span className="truncate font-medium text-bvc-ink">{child.name}</span>
                                      <span className="font-mono text-[11px] text-bvc-muted">
                                        ({child.pieceCount} bài)
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openCategoryForm({
                                            id: child.id,
                                            name: child.name,
                                            parentId: category.id,
                                          })
                                        }
                                        title={`Sửa ${child.name}`}
                                        className="flex size-[28px] cursor-pointer items-center justify-center rounded-[6px] text-bvc-muted transition-colors hover:bg-bvc-surface hover:text-bvc-ink"
                                      >
                                        <Pencil size={13} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeleteTarget({ id: child.id, name: child.name })}
                                        title={`Xóa ${child.name}`}
                                        className="flex size-[28px] cursor-pointer items-center justify-center rounded-[6px] text-bvc-muted transition-colors hover:bg-bvc-surface hover:text-bvc-error"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {expanded && category.children.length === 0 && (
                            <div className="border-t border-bvc-line bg-bvc-surface/10 px-4 py-2 text-[12px] text-bvc-muted">
                              Chưa có nhánh con trực thuộc.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </PageStatus>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-[18px] border border-bvc-border bg-white lg:col-span-5">
            <div className="flex flex-col gap-3 border-b border-bvc-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-[32px] items-center justify-center rounded-[8px] bg-bvc-surface text-bvc-ink">
                  <Music2 size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-extrabold tracking-[-0.02em] text-bvc-ink">
                      Nhạc cụ
                    </h2>
                    <span className="rounded-[6px] border border-bvc-border bg-bvc-surface px-1.5 py-0.5 text-[10.5px] font-bold text-bvc-muted uppercase">
                      Chỉ Admin
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openInstrumentForm(null)}
                className="flex h-[36px] cursor-pointer items-center gap-1.5 rounded-[10px] bg-bvc-ink px-3 text-[13px] font-semibold text-white transition-colors hover:bg-black"
              >
                <Plus size={14} />
                <span>Thêm nhạc cụ</span>
              </button>
            </div>

            <div className="border-b border-bvc-line bg-bvc-surface/30 p-3">
              <div className="relative flex items-center">
                <Search size={14} className="pointer-events-none absolute left-3 text-bvc-muted" />
                <input
                  type="search"
                  value={instrumentSearch}
                  onChange={(e) => setInstrumentSearch(e.target.value)}
                  placeholder="Lọc mã hoặc tên nhạc cụ..."
                  className="h-[36px] w-full rounded-[10px] border border-bvc-border bg-white pl-8 pr-7 text-[13px] text-bvc-ink placeholder:text-bvc-faint transition-colors focus:border-bvc-ink focus:outline-none"
                />
                {instrumentSearch && (
                  <button
                    type="button"
                    onClick={() => setInstrumentSearch("")}
                    className="absolute right-2.5 cursor-pointer text-bvc-muted hover:text-bvc-ink"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col p-2">
              <PageStatus isLoading={instruments.isLoading} error={instruments.error} onRetry={instruments.reload}>
                {filteredInstruments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-[13.5px] font-semibold text-bvc-ink">
                      {instrumentSearch ? "Không có nhạc cụ phù hợp" : "Chưa có nhạc cụ nào"}
                    </p>
                    <p className="mt-1 text-[12px] text-bvc-muted">
                      {instrumentSearch
                        ? `Không tìm thấy kết quả cho “${instrumentSearch}”.`
                        : "Bấm “Thêm nhạc cụ” để bổ sung vào danh mục."}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-bvc-line">
                    {filteredInstruments.map((instrument) => (
                      <div
                        key={instrument.id}
                        className="flex items-center justify-between gap-3 rounded-[10px] p-2.5 transition-colors hover:bg-bvc-surface/50"
                      >
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[12px] font-semibold text-bvc-ink bg-bvc-surface border border-bvc-border px-2 py-0.5 rounded-[6px]">
                              {instrument.code}
                            </span>
                            <span className="truncate text-[13.5px] font-bold text-bvc-ink">
                              {instrument.name}
                            </span>
                          </div>

                          {instrument.description && (
                            <p className="truncate text-[12px] text-bvc-muted pl-0.5">
                              {instrument.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className="flex items-center gap-1.5 text-[12px] font-medium"
                            title={instrument.isActive ? "Đang hoạt động trong các bài tập" : "Đã tạm dừng"}
                          >
                            <span
                              className={`size-[7px] shrink-0 rounded-full ${
                                instrument.isActive ? "bg-bvc-ok" : "bg-bvc-bar-strong"
                              }`}
                            />
                            <span className={instrument.isActive ? "text-bvc-ink" : "text-bvc-muted"}>
                              {instrument.isActive ? "Hoạt động" : "Ngừng"}
                            </span>
                          </span>

                          <div className="flex items-center gap-1 pl-1">
                            <button
                              type="button"
                              onClick={() => openInstrumentForm(instrument)}
                              title={`Chỉnh sửa ${instrument.name}`}
                              className="flex size-[30px] cursor-pointer items-center justify-center rounded-[8px] text-bvc-muted transition-colors hover:bg-white hover:text-bvc-ink"
                            >
                              <Pencil size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => void instruments.toggleActive(instrument)}
                              title={
                                instrument.isActive
                                  ? `Tạm dừng hoạt động ${instrument.name}`
                                  : `Kích hoạt lại ${instrument.name}`
                              }
                              className={`flex size-[30px] cursor-pointer items-center justify-center rounded-[8px] transition-colors hover:bg-white ${
                                instrument.isActive
                                  ? "text-bvc-muted hover:text-bvc-error"
                                  : "text-bvc-ok hover:text-bvc-ok"
                              }`}
                            >
                              <Power size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PageStatus>
            </div>
          </div>
        </div>
      </div>

      <CategoryFormDialog
        isOpen={isCategoryFormOpen}
        target={categoryTarget}
        defaultParentId={defaultParentId}
        parentOptions={items}
        onOpenChange={setIsCategoryFormOpen}
        onSubmit={(values) => saveCategory(categoryTarget, values)}
      />
      <CategoryDeleteDialog target={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={removeCategory} />
      <InstrumentFormDialog
        isOpen={isInstrumentFormOpen}
        instrument={instrumentTarget}
        onOpenChange={setIsInstrumentFormOpen}
        onSubmit={(values) => instruments.saveInstrument(instrumentTarget?.id ?? null, values)}
      />
    </main>
  );
}
