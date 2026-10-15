import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { DesktopPageHeader } from "@/shared/components/bvc";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogDescription, DialogPopup, DialogTitle } from "@/shared/components/ui/dialog";
import { UserFormDialog } from "@/features/platform/components/UserFormDialog";
import {
  USER_ROLE_LABELS,
  USER_ROLE_OPTIONS,
  USER_STATUS_DOT,
  USER_STATUS_OPTIONS,
} from "@/features/platform/constants/userConstants";
import { useUsers } from "@/features/platform/hooks/useUsers";
import { type UserItem, type UserSortKey, type UserStatus } from "@/features/platform/types/userTypes";

const COLUMNS = "grid-cols-[2fr_2.2fr_1.2fr_1fr_1.1fr_1fr]";
const STATUS_LABELS: Record<UserStatus, string> = Object.fromEntries(
  USER_STATUS_OPTIONS.map((option) => [option.value, option.label])
) as Record<UserStatus, string>; // Object.fromEntries trả về kiểu rộng; khóa luôn là UserStatus.

const SORTABLE_COLUMNS: { key: UserSortKey; label: string }[] = [
  { key: "username", label: "Họ tên" },
  { key: "email", label: "Email" },
  { key: "role", label: "Vai trò" },
];

export function UserManagePage() {
  const { filters, updateFilters, items, total, error, isLoading, pageSize, saveUser, toggleLock } = useUsers();
  const [searchText, setSearchText] = useState("");
  const [formTarget, setFormTarget] = useState<UserItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [lockTarget, setLockTarget] = useState<UserItem | null>(null);

  const appliedQuery = filters.q;
  useEffect(() => {
    const nextQuery = searchText.trim();
    if (nextQuery === appliedQuery) return;
    const timer = window.setTimeout(() => updateFilters({ q: nextQuery }), 300);
    return () => window.clearTimeout(timer);
  }, [searchText, appliedQuery, updateFilters]);

  const firstRow = total === 0 ? 0 : (filters.page - 1) * pageSize + 1;
  const lastRow = Math.min(filters.page * pageSize, total);
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  const openForm = (user: UserItem | null) => {
    setFormTarget(user);
    setIsFormOpen(true);
  };

  const toggleSort = (key: UserSortKey) => {
    const isSame = filters.sortBy === key;
    updateFilters({ sortBy: key, sortDir: isSame && filters.sortDir === "asc" ? "desc" : "asc" });
  };

  const confirmLockChange = async () => {
    if (!lockTarget) return;
    await toggleLock(lockTarget);
    setLockTarget(null);
  };

  return (
    <>
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopPageHeader
          breadcrumb="SCR-M06-05 · Quản lý người dùng"
          title="Người dùng"
          actions={
            <button
              type="button"
              onClick={() => openForm(null)}
              className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
            >
              Thêm người dùng
            </button>
          }
        />

        <div className="flex flex-1 flex-col gap-[16px] overflow-y-auto p-[22px_32px_26px]">
          <div className="flex flex-wrap items-center gap-[10px]">
            <select
              aria-label="Vai trò"
              value={filters.role ?? ""}
              onChange={(event) => updateFilters({ role: event.target.value ? Number(event.target.value) : undefined })}
              className="h-[44px] cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:outline-none"
            >
              <option value="">Tất cả vai trò</option>
              {USER_ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Trạng thái tài khoản"
              value={filters.status ?? ""}
              onChange={(event) =>
                updateFilters({ status: (event.target.value || undefined) as UserStatus | undefined })
              }
              className="h-[44px] cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:outline-none"
            >
              <option value="">Tất cả trạng thái</option>
              {USER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tên, email hoặc mã sinh viên"
              maxLength={100}
              className="h-[44px] w-[280px] rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink placeholder:text-bvc-faint focus:outline-none"
            />
            <span className="ml-auto font-mono text-[13px] text-bvc-muted">{total} người dùng</span>
          </div>

          <div className="flex flex-col overflow-hidden rounded-[20px] border border-bvc-border bg-white">
            <div
              className={`grid shrink-0 ${COLUMNS} gap-[14px] border-b border-bvc-border px-[20px] py-[11px] text-[12px] font-bold uppercase tracking-[0.08em] text-bvc-muted`}
            >
              {SORTABLE_COLUMNS.map((column) => (
                <button
                  key={column.key}
                  type="button"
                  onClick={() => toggleSort(column.key)}
                  className="flex cursor-pointer items-center gap-[4px] text-left uppercase"
                >
                  {column.label}
                  {filters.sortBy === column.key &&
                    (filters.sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                </button>
              ))}
              <span>Mã SV</span>
              <button
                type="button"
                onClick={() => toggleSort("status")}
                className="flex cursor-pointer items-center gap-[4px] text-left uppercase"
              >
                Trạng thái
                {filters.sortBy === "status" &&
                  (filters.sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
              </button>
              <span>Hành động</span>
            </div>

            {isLoading && <p className="px-[20px] py-[28px] text-[14px] text-bvc-muted">Đang tải...</p>}
            {!isLoading && error && <p className="px-[20px] py-[28px] text-[14px] text-bvc-error">{error}</p>}
            {!isLoading && !error && items.length === 0 && (
              <p className="px-[20px] py-[28px] text-[14px] text-bvc-muted">Không tìm thấy người dùng phù hợp.</p>
            )}
            {!isLoading &&
              !error &&
              items.map((user) => (
                <div
                  key={user.id}
                  className={`grid min-h-[52px] ${COLUMNS} items-center gap-[14px] border-b border-bvc-line px-[20px] py-[8px] text-[13px] last:border-0`}
                >
                  <span className="truncate font-semibold text-bvc-ink">{user.username}</span>
                  <span className="truncate text-bvc-muted">{user.email}</span>
                  <span className="text-bvc-ink">{USER_ROLE_LABELS[user.role] ?? "—"}</span>
                  <span className="font-mono text-bvc-muted">{user.studentCode ?? "—"}</span>
                  <span className="flex items-center gap-[6px]">
                    <span className={`size-[7px] shrink-0 rounded-full ${USER_STATUS_DOT[user.status]}`} />
                    <span className="text-bvc-muted">{STATUS_LABELS[user.status]}</span>
                  </span>
                  <span className="flex items-center gap-[12px] font-semibold">
                    <button type="button" onClick={() => openForm(user)} className="cursor-pointer text-bvc-ink">
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => setLockTarget(user)}
                      className="cursor-pointer text-bvc-accent-text"
                    >
                      {user.status === "LOCKED" ? "Mở khóa" : "Khóa"}
                    </button>
                  </span>
                </div>
              ))}
          </div>

          <div className="flex items-center justify-between text-[13px] text-bvc-muted">
            <span>
              Hiển thị {firstRow}-{lastRow} / {total}
            </span>
            <span className="flex items-center gap-[8px]">
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page <= 1}
                onClick={() => updateFilters({ page: filters.page - 1 })}
              >
                Trước
              </Button>
              <span className="font-mono">
                {filters.page} / {lastPage}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page >= lastPage}
                onClick={() => updateFilters({ page: filters.page + 1 })}
              >
                Sau
              </Button>
            </span>
          </div>
          <p className="text-[12.5px] text-bvc-muted">
            Tài khoản “Chờ kích hoạt” chuyển sang “Hoạt động” ở lần đăng nhập Google đầu tiên.
          </p>
        </div>
      </main>

      <UserFormDialog
        isOpen={isFormOpen}
        user={formTarget}
        onOpenChange={setIsFormOpen}
        onSubmit={(values) => saveUser(formTarget?.id ?? null, values)}
      />

      <Dialog open={lockTarget !== null} onOpenChange={(isOpen) => !isOpen && setLockTarget(null)}>
        <DialogPopup>
          <DialogTitle>{lockTarget?.status === "LOCKED" ? "Mở khóa tài khoản" : "Khóa tài khoản"}</DialogTitle>
          <DialogDescription>
            {lockTarget?.status === "LOCKED"
              ? `Mở khóa tài khoản ${lockTarget.username}?`
              : `Khóa tài khoản ${lockTarget?.username}? Người dùng sẽ bị đăng xuất và không thể đăng nhập cho đến khi được mở khóa.`}
          </DialogDescription>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setLockTarget(null)}>
              Hủy
            </Button>
            <Button variant={lockTarget?.status === "LOCKED" ? "primary" : "danger"} onClick={confirmLockChange}>
              Xác nhận
            </Button>
          </div>
        </DialogPopup>
      </Dialog>
    </>
  );
}
