import { ROLES } from "@/shared/constants/roles";
import { getRoleHome } from "@/shared/utils/roleHome";

export const RETURN_TO_KEY = "bvc:returnTo";

type Place = { pathname: string; search?: string; hash?: string };

// Chỉ lưu đường dẫn tương đối: tuyệt đối (//evil.com, https://...) sẽ thành open redirect sau khi đăng nhập
export function buildReturnTo(place: Place): string {
  return `${place.pathname}${place.search ?? ""}${place.hash ?? ""}`;
}

function pathnameOf(path: string): string {
  return path.split(/[?#]/)[0] ?? "";
}

function hasControlChar(value: string): boolean {
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code < 32 || code === 127) return true;
  }
  return false;
}

function isSafePath(path: unknown): path is string {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) return false;
  if (hasControlChar(path) || path.includes("\\") || path.includes("://")) return false;
  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    return false;
  }
  if (decoded.startsWith("//") || decoded.includes("\\") || decoded.includes("://")) return false;
  return pathnameOf(decoded) !== "/login";
}

// Tránh quay lại trang của vai trò khác rồi bị ProtectedRoute đá về home - vẫn là mất tiến trình
function isAllowedForRole(path: string, role: number): boolean {
  const pathname = pathnameOf(path).replace(/\/+$/, "") || "/";
  if (role === ROLES.STUDENT && /^\/(?:teacher|admin|songs|categories|community\/(?:verified|approval)|leaderboard)(?:\/|$)/.test(pathname)) {
    return false;
  }
  if (role === ROLES.TEACHER && /^\/(?:admin|community\/approval)(?:\/|$)/.test(pathname)) return false;
  if (
    role === ROLES.SYSTEM_ADMIN &&
    /^\/(?:home|practice|ensemble|assignments?|saved|library\/upload)(?:\/|$)/.test(pathname)
  ) {
    return false;
  }
  return true;
}

function fromState(state: unknown): unknown {
  if (typeof state === "string") return state;
  if (state && typeof state === "object" && "from" in state) return state.from;
  return null;
}

function readStored(): string | null {
  try {
    return sessionStorage.getItem(RETURN_TO_KEY);
  } catch {
    return null;
  }
}

export function clearReturnTo(): void {
  try {
    sessionStorage.removeItem(RETURN_TO_KEY);
  } catch {
    /* ignore */
  }
}

// Khách bấm chức năng cần đăng nhập: lưu lại trang đang xem làm phương án dự phòng khi reload /login
export function saveReturnTo(path: string): void {
  if (isSafePath(path)) {
    try {
      sessionStorage.setItem(RETURN_TO_KEY, path);
    } catch {
      /* ignore */
    }
  }
}

// state.from là trang liền trước; sessionStorage chỉ là dự phòng. Cả hai phải qua cùng một bộ lọc.
export function resolveReturnTarget(state: unknown, role: number): string {
  const candidates = [fromState(state), readStored()];
  const target = candidates.find((candidate) => isSafePath(candidate) && isAllowedForRole(candidate, role));
  clearReturnTo();
  return target ?? getRoleHome(role);
}
