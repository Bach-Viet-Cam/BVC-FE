import { useEffect, useState, useTransition } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileSpreadsheet,
  GraduationCap,
  Info,
  Lock,
  MoreHorizontal,
  Pencil,
  RotateCw,
  Search,
  SearchX,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  UserPlus,
  X,
} from "lucide-react";
import { DesktopPageHeader } from "@/shared/components/bvc";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogDescription, DialogPopup, DialogTitle } from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "@/shared/components/ui/toast";
import { StudentImportDialog } from "@/features/platform/components/StudentImportDialog";
import { UserFormDialog } from "@/features/platform/components/UserFormDialog";
import { USER_ROLE_LABELS, USER_STATUS_OPTIONS } from "@/features/platform/constants/userConstants";
import { useUsers } from "@/features/platform/hooks/useUsers";
import { type UserItem, type UserSortKey, type UserStatus } from "@/features/platform/types/userTypes";
import { ROLES } from "@/shared/constants/roles";
import { formatDateTime } from "@/shared/utils/formatDate";
import { getInitials } from "@/shared/utils/getInitials";
import { cn } from "@/shared/utils/cn";

const ROLE_TABS: { value?: number; label: string }[] = [
  { value: undefined, label: "Tất cả vai trò" },
  { value: ROLES.STUDENT, label: "Sinh viên" },
  { value: ROLES.TEACHER, label: "Giảng viên" },
  { value: ROLES.SYSTEM_ADMIN, label: "Quản trị viên" },
];

const STATUS_LABELS: Record<UserStatus, string> = Object.fromEntries(
  USER_STATUS_OPTIONS.map((option) => [option.value, option.label])
) as Record<UserStatus, string>;

export function UserManagePage() {
  const { filters, updateFilters, items, total, error, isLoading, pageSize, saveUser, toggleLock, reload } = useUsers();

  const [searchText, setSearchText] = useState("");
  const [formTarget, setFormTarget] = useState<UserItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [lockTarget, setLockTarget] = useState<UserItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const appliedQuery = filters.q;
  useEffect(() => {
    const nextQuery = searchText.trim();
    if (nextQuery === appliedQuery) return;
    const timer = window.setTimeout(() => {
      startTransition(() => {
        updateFilters({ q: nextQuery });
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchText, appliedQuery, updateFilters]);

  const firstRow = total === 0 ? 0 : (filters.page - 1) * pageSize + 1;
  const lastRow = Math.min(filters.page * pageSize, total);
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  const hasActiveFilters = Boolean(filters.role !== undefined || filters.status !== undefined || filters.q !== "");

  const resetFilters = () => {
    setSearchText("");
    updateFilters({ role: undefined, status: undefined, q: "" });
  };

  const openForm = (user: UserItem | null) => {
    setFormTarget(user);
    setIsFormOpen(true);
  };

  const toggleSort = (key: UserSortKey) => {
    const isSame = filters.sortBy === key;
    updateFilters({ sortBy: key, sortDir: isSame && filters.sortDir === "asc" ? "desc" : "asc" });
  };

  const copyEmail = async (email: string, userId: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedId(userId);
      toast.success("Đã sao chép email");
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      toast.error("Không thể sao chép email");
    }
  };

  const confirmLockChange = async () => {
    if (!lockTarget) return;
    await toggleLock(lockTarget);
    setLockTarget(null);
  };

  return (
    <>
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#FAF9F7]">
        <DesktopPageHeader
          breadcrumb="Quản trị"
          title="Người dùng"
          actions={
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={reload}
                disabled={isLoading}
                title="Làm mới danh sách"
                className="flex size-[42px] cursor-pointer items-center justify-center rounded-[12px] border border-bvc-border bg-white text-bvc-muted transition-colors hover:border-bvc-border-strong hover:text-bvc-ink disabled:opacity-50"
              >
                <RotateCw size={16} className={cn(isLoading && "animate-spin text-bvc-ink")} />
              </button>

              <button
                type="button"
                onClick={() => setIsImportOpen(true)}
                className="flex min-h-[42px] cursor-pointer items-center gap-2 rounded-[12px] border border-bvc-border bg-white px-4 text-[13.5px] font-semibold text-bvc-ink transition-colors hover:border-bvc-border-strong"
              >
                <FileSpreadsheet size={16} />
                <span>Nhập từ Excel</span>
              </button>

              <button
                type="button"
                onClick={() => openForm(null)}
                className="flex min-h-[42px] cursor-pointer items-center gap-2 rounded-[12px] bg-bvc-ink px-4 text-[13.5px] font-semibold text-white shadow-xs transition-colors hover:bg-black"
              >
                <UserPlus size={16} />
                <span>Thêm người dùng</span>
              </button>
            </div>
          }
        />

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 md:px-8">
          <div className="flex flex-col gap-3 rounded-[16px] border border-bvc-border bg-white p-3.5 shadow-none sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex flex-wrap items-center rounded-[12px] border border-bvc-border/80 bg-bvc-surface/60 p-1">
              {ROLE_TABS.map((tab) => {
                const isActive = filters.role === tab.value;
                return (
                  <button
                    key={tab.value ?? "all"}
                    type="button"
                    onClick={() => updateFilters({ role: tab.value })}
                    className={cn(
                      "cursor-pointer rounded-[9px] px-3.5 py-1.5 text-[13px] font-semibold transition-all select-none",
                      isActive ? "bg-white text-bvc-ink shadow-xs" : "text-bvc-muted hover:text-bvc-ink"
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <select
                  aria-label="Trạng thái tài khoản"
                  value={filters.status ?? ""}
                  onChange={(event) =>
                    updateFilters({ status: (event.target.value || undefined) as UserStatus | undefined })
                  }
                  className="h-[38px] cursor-pointer rounded-[11px] border border-bvc-border-strong bg-white pl-3 pr-8 text-[13px] font-medium text-bvc-ink transition-colors focus:border-bvc-ink focus:outline-none"
                >
                  <option value="">Tất cả trạng thái</option>
                  {USER_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex items-center">
                <Search size={15} className="pointer-events-none absolute left-3 text-bvc-muted" />
                <input
                  type="search"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Tên, email hoặc mã SV..."
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
                  title="Xóa toàn bộ bộ lọc"
                >
                  <X size={13} />
                  <span>Xóa lọc</span>
                </button>
              )}

              <span className="ml-1 font-mono text-[13px] text-bvc-muted">
                {total} <span className="font-sans text-[12px] text-bvc-faint">người dùng</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-[18px] border border-bvc-border bg-white shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-bvc-border bg-bvc-surface/50 text-[11.5px] font-bold uppercase tracking-[0.06em] text-bvc-muted">
                    <th className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => toggleSort("username")}
                        className="flex cursor-pointer items-center gap-1.5 text-left transition-colors hover:text-bvc-ink uppercase"
                      >
                        <span>Người dùng</span>
                        {filters.sortBy === "username" ? (
                          filters.sortDir === "asc" ? (
                            <ArrowUp size={13} className="text-bvc-ink" />
                          ) : (
                            <ArrowDown size={13} className="text-bvc-ink" />
                          )
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </button>
                    </th>

                    <th className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => toggleSort("email")}
                        className="flex cursor-pointer items-center gap-1.5 text-left transition-colors hover:text-bvc-ink uppercase"
                      >
                        <span>Email Google</span>
                        {filters.sortBy === "email" ? (
                          filters.sortDir === "asc" ? (
                            <ArrowUp size={13} className="text-bvc-ink" />
                          ) : (
                            <ArrowDown size={13} className="text-bvc-ink" />
                          )
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </button>
                    </th>

                    <th className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => toggleSort("role")}
                        className="flex cursor-pointer items-center gap-1.5 text-left transition-colors hover:text-bvc-ink uppercase"
                      >
                        <span>Vai trò</span>
                        {filters.sortBy === "role" ? (
                          filters.sortDir === "asc" ? (
                            <ArrowUp size={13} className="text-bvc-ink" />
                          ) : (
                            <ArrowDown size={13} className="text-bvc-ink" />
                          )
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </button>
                    </th>

                    <th className="px-4 py-3.5">Mã SV</th>

                    <th className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => toggleSort("status")}
                        className="flex cursor-pointer items-center gap-1.5 text-left transition-colors hover:text-bvc-ink uppercase"
                      >
                        <span>Trạng thái</span>
                        {filters.sortBy === "status" ? (
                          filters.sortDir === "asc" ? (
                            <ArrowUp size={13} className="text-bvc-ink" />
                          ) : (
                            <ArrowDown size={13} className="text-bvc-ink" />
                          )
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </button>
                    </th>

                    <th className="px-4 py-3.5">Đăng nhập gần nhất</th>
                    <th className="px-5 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-bvc-line">
                  {isLoading &&
                    Array.from({ length: 6 }).map((_, index) => (
                      <tr key={`skeleton-${index}`} className="h-[60px]">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="size-9 shrink-0 rounded-full bg-bvc-surface" />
                            <div className="flex flex-col gap-1.5">
                              <Skeleton className="h-4 w-28 rounded bg-bvc-surface" />
                              <Skeleton className="h-3 w-16 rounded bg-bvc-surface" />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-40 rounded bg-bvc-surface" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-6 w-24 rounded-full bg-bvc-surface" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-5 w-16 rounded bg-bvc-surface" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-5 w-20 rounded bg-bvc-surface" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-28 rounded bg-bvc-surface" />
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Skeleton className="size-7 rounded bg-bvc-surface" />
                            <Skeleton className="size-7 rounded bg-bvc-surface" />
                          </div>
                        </td>
                      </tr>
                    ))}

                  {!isLoading && error && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ShieldAlert size={28} className="text-bvc-error" />
                          <p className="text-[14px] font-semibold text-bvc-ink">Đã có lỗi xảy ra</p>
                          <p className="max-w-md text-[13px] text-bvc-muted">{error}</p>
                          <Button variant="secondary" size="sm" onClick={reload} className="mt-2 rounded-[10px]">
                            Thử lại
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {!isLoading && !error && items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-14 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="flex size-12 items-center justify-center rounded-full bg-bvc-surface text-bvc-muted">
                            <SearchX size={22} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="text-[15px] font-bold text-bvc-ink">Không tìm thấy người dùng</p>
                            <p className="max-w-sm text-[13px] text-bvc-muted">
                              {hasActiveFilters
                                ? "Không có tài khoản nào khớp với bộ lọc hoặc từ khóa tìm kiếm của bạn."
                                : "Hệ thống hiện tại chưa có người dùng nào."}
                            </p>
                          </div>
                          {hasActiveFilters && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={resetFilters}
                              className="mt-1 rounded-[10px] text-[13px]"
                            >
                              Đặt lại bộ lọc
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}

                  {!isLoading &&
                    !error &&
                    items.map((user) => {
                      const isLocked = user.status === "LOCKED";
                      const isPending = user.status === "PENDING";
                      const initials = getInitials(user.username);

                      return (
                        <tr
                          key={user.id}
                          className="h-[60px] transition-colors hover:bg-bvc-surface/40 group"
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-bvc-border bg-bvc-surface text-[12px] font-bold text-bvc-ink">
                                {initials}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="truncate font-semibold text-bvc-ink">{user.username}</span>
                                <span className="truncate font-mono text-[11px] text-bvc-faint">
                                  ID: {user.id.slice(0, 8)}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 max-w-[280px]">
                              <span className="truncate text-bvc-muted select-all" title={user.email}>
                                {user.email}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyEmail(user.email, user.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-bvc-muted hover:text-bvc-ink rounded cursor-pointer shrink-0"
                                title="Sao chép email"
                              >
                                {copiedId === user.id ? <Check size={13} className="text-bvc-ok" /> : <Copy size={13} />}
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            {user.role === ROLES.SYSTEM_ADMIN && (
                              <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-bvc-ink/20 bg-bvc-ink/10 px-2.5 py-1 text-[11.5px] font-semibold text-bvc-ink">
                                <ShieldCheck size={13} />
                                <span>{USER_ROLE_LABELS[user.role] ?? "Quản trị viên"}</span>
                              </span>
                            )}
                            {user.role === ROLES.TEACHER && (
                              <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#C8E6D3] bg-[#EBF5EE] px-2.5 py-1 text-[11.5px] font-semibold text-bvc-ok">
                                <GraduationCap size={13} />
                                <span>{USER_ROLE_LABELS[user.role] ?? "Giảng viên"}</span>
                              </span>
                            )}
                            {user.role === ROLES.STUDENT && (
                              <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-bvc-border bg-bvc-surface px-2.5 py-1 text-[11.5px] font-semibold text-bvc-muted">
                                <BookOpen size={13} />
                                <span>{USER_ROLE_LABELS[user.role] ?? "Sinh viên"}</span>
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            {user.studentCode ? (
                              <span className="font-mono text-[12px] font-medium text-bvc-ink rounded-[6px] border border-bvc-line bg-bvc-surface px-2 py-0.5">
                                {user.studentCode}
                              </span>
                            ) : (
                              <span className="text-bvc-faint text-[13px]">—</span>
                            )}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "size-[7px] shrink-0 rounded-full",
                                  isLocked ? "bg-bvc-bar-strong" : isPending ? "bg-bvc-warn" : "bg-bvc-ok"
                                )}
                              />
                              <span
                                className={cn("text-[13px] font-medium", isLocked ? "text-bvc-accent-text" : "text-bvc-ink")}
                              >
                                {STATUS_LABELS[user.status]}
                              </span>
                              {isPending && (
                                <span
                                  title="Chờ đăng nhập Google lần đầu để kích hoạt tài khoản"
                                  className="cursor-help text-bvc-muted hover:text-bvc-ink"
                                >
                                  <Info size={13} />
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            {user.lastLoginAt ? (
                              <span className="font-mono text-[12px] text-bvc-muted">
                                {formatDateTime(user.lastLoginAt)}
                              </span>
                            ) : (
                              <span className="text-[12px] italic text-bvc-faint">Chưa đăng nhập</span>
                            )}
                          </td>

                          <td className="px-5 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1 font-semibold">
                              <button
                                type="button"
                                onClick={() => openForm(user)}
                                title="Sửa tài khoản"
                                className="flex size-[30px] cursor-pointer items-center justify-center rounded-[8px] text-bvc-muted transition-colors hover:bg-bvc-surface hover:text-bvc-ink"
                              >
                                <Pencil size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setLockTarget(user)}
                                title={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                                className={cn(
                                  "flex size-[30px] cursor-pointer items-center justify-center rounded-[8px] transition-colors",
                                  isLocked
                                    ? "text-bvc-ok hover:bg-[#EBF5EE]"
                                    : "text-bvc-accent-text hover:bg-bvc-accent-tint"
                                )}
                              >
                                {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                              </button>

                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  title="Tùy chọn khác"
                                  className="flex size-[30px] cursor-pointer items-center justify-center rounded-[8px] text-bvc-muted transition-colors hover:bg-bvc-surface hover:text-bvc-ink"
                                >
                                  <MoreHorizontal size={14} />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48 rounded-[12px] p-1.5 border-bvc-border bg-white shadow-level-1">
                                  <DropdownMenuItem
                                    onClick={() => copyEmail(user.email, user.id)}
                                    className="flex cursor-pointer items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-[13px] text-bvc-ink hover:bg-bvc-surface"
                                  >
                                    <Copy size={14} className="text-bvc-muted" />
                                    <span>Sao chép email</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openForm(user)}
                                    className="flex cursor-pointer items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-[13px] text-bvc-ink hover:bg-bvc-surface"
                                  >
                                    <Pencil size={14} className="text-bvc-muted" />
                                    <span>Chỉnh sửa thông tin</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="my-1 border-bvc-border" />
                                  <DropdownMenuItem
                                    onClick={() => setLockTarget(user)}
                                    className={cn(
                                      "flex cursor-pointer items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-[13px]",
                                      isLocked
                                        ? "text-bvc-ok hover:bg-[#EBF5EE]"
                                        : "text-bvc-error hover:bg-bvc-accent-tint"
                                    )}
                                  >
                                    {isLocked ? (
                                      <>
                                        <Unlock size={14} />
                                        <span>Mở khóa tài khoản</span>
                                      </>
                                    ) : (
                                      <>
                                        <Lock size={14} />
                                        <span>Khóa tài khoản</span>
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-[13px] text-bvc-muted pt-1">
            <span>
              Hiển thị{" "}
              <strong className="font-mono text-bvc-ink">
                {firstRow}–{lastRow}
              </strong>{" "}
              trong tổng số <strong className="font-mono text-bvc-ink">{total}</strong> người dùng
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page <= 1 || isLoading}
                onClick={() => updateFilters({ page: filters.page - 1 })}
                className="rounded-[10px] border-bvc-border bg-white px-3 font-medium text-bvc-ink hover:bg-bvc-surface"
              >
                <ChevronLeft size={14} className="mr-0.5" />
                <span>Trước</span>
              </Button>

              <span className="font-mono text-[12.5px] font-semibold text-bvc-ink px-2.5 py-1 rounded-[8px] border border-bvc-border bg-white">
                {filters.page} / {lastPage}
              </span>

              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page >= lastPage || isLoading}
                onClick={() => updateFilters({ page: filters.page + 1 })}
                className="rounded-[10px] border-bvc-border bg-white px-3 font-medium text-bvc-ink hover:bg-bvc-surface"
              >
                <span>Sau</span>
                <ChevronRight size={14} className="ml-0.5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-[12px] border border-bvc-border bg-white p-3 text-[12.5px] text-bvc-muted shadow-none">
            <Info size={16} className="shrink-0 text-bvc-muted" />
            <span>
              Tài khoản ở trạng thái <strong>“Chờ kích hoạt”</strong> sẽ tự động chuyển sang{" "}
              <strong>“Hoạt động”</strong> ngay khi người dùng đăng nhập bằng Google lần đầu tiên qua đúng địa chỉ email
              đã đăng ký.
            </span>
          </div>
        </div>
      </main>

      <StudentImportDialog isOpen={isImportOpen} onOpenChange={setIsImportOpen} onImported={reload} />

      <UserFormDialog
        isOpen={isFormOpen}
        user={formTarget}
        onOpenChange={setIsFormOpen}
        onSubmit={(values) => saveUser(formTarget?.id ?? null, values)}
      />

      <Dialog open={lockTarget !== null} onOpenChange={(isOpen) => !isOpen && setLockTarget(null)}>
        <DialogPopup className="max-w-[460px] rounded-[18px] p-6 border-bvc-border">
          <div className="flex items-start gap-3.5">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-[12px]",
                lockTarget?.status === "LOCKED" ? "bg-[#EBF5EE] text-bvc-ok" : "bg-bvc-accent-tint text-bvc-accent-text"
              )}
            >
              {lockTarget?.status === "LOCKED" ? <Unlock size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-[17px] font-bold text-bvc-ink">
                {lockTarget?.status === "LOCKED" ? "Mở khóa tài khoản" : "Khóa tài khoản người dùng"}
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-relaxed text-bvc-muted">
                {lockTarget?.status === "LOCKED" ? (
                  <>
                    Mở khóa tài khoản cho <strong>{lockTarget.username}</strong> ({lockTarget.email})? Người dùng sẽ có
                    thể đăng nhập và truy cập vào hệ thống bình thường.
                  </>
                ) : (
                  <>
                    Khóa tài khoản <strong>{lockTarget?.username}</strong> ({lockTarget?.email})? Người dùng sẽ bị thu
                    hồi phiên đăng nhập hiện tại và không thể truy cập lại cho đến khi được mở khóa.
                  </>
                )}
              </DialogDescription>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2.5 border-t border-bvc-border pt-4">
            <Button
              variant="secondary"
              onClick={() => setLockTarget(null)}
              className="rounded-[11px] border-bvc-border-strong font-medium text-bvc-ink"
            >
              Hủy
            </Button>
            <Button
              variant={lockTarget?.status === "LOCKED" ? "primary" : "danger"}
              onClick={confirmLockChange}
              className="rounded-[11px] font-semibold"
            >
              {lockTarget?.status === "LOCKED" ? "Xác nhận mở khóa" : "Xác nhận khóa"}
            </Button>
          </div>
        </DialogPopup>
      </Dialog>
    </>
  );
}
