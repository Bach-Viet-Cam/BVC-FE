# STRUCTURE.md — bản đồ code bvc-fe

Đọc file này khi: dựng feature mới (đặt file đúng chỗ + nối đúng mạch), thêm primitive/ui token/route mới,
debug một màn hình (lần theo mạch kết nối ở §3). Quy tắc viết code (import, TypeScript, form, API,
đặt tên) thuộc về `RULES.md` — file này không nhắc lại, chỉ nói file nằm đâu và nối với nhau thế nào.

## 1. Cây thư mục (trạng thái hiện tại)

```
src/
├── main.tsx                    # entry: render <App/>, import duy nhất ./index.css
├── index.css                   # @import tailwind + @theme tokens + @layer base (§5, §6)
├── vite-env.d.ts
├── assets/                     # static (đang trống)
├── app/
│   ├── App.tsx                 # <AppProviders> → <AppRouter/> + <Toaster/> app-wide
│   ├── router.tsx              # declarative <BrowserRouter><Routes> (§2)
│   └── providers/
│       └── AppProviders.tsx    # bọc AuthProvider (mở rộng thêm provider ở đây)
├── features/
│   ├── auth/                   # đã code xong — mẫu chuẩn để copy shape
│   │   ├── pages/              # LoginPage, RegisterPage (route-level)
│   │   ├── components/         # LoginForm, RegisterForm (JSX thuần)
│   │   ├── hooks/              # useLogin, useRegister (loading/error + điều hướng)
│   │   ├── api/                # authApi.ts (object gọi axiosClient)
│   │   ├── types/              # authTypes.ts (Request/Response interfaces)
│   │   └── utils/              # validateLogin.ts (zod schema + type infer)
│   ├── music-library/ classes/ community/ ensemble/ platform/
│   │   └── api|components|hooks|pages|types|utils/  # khung .gitkeep, chưa code
│   └── (quyết định đặt file ở đâu: RULES.md §2)
└── shared/                     # dùng chung ≥2 features
    ├── components/
    │   ├── AppLayout.tsx       # sidebar + topbar + <Outlet/> cho route bảo vệ
    │   ├── AppSidebar.tsx      # menu NAV_ITEMS lọc theo role
    │   ├── ProtectedRoute.tsx  # chặn chưa-login / sai-role
    │   └── ui/                 # 27 primitives Base UI (button…tooltip, toast)
    ├── context/AuthContext.tsx # UserInfo + useAuth() (user, hasRole/hasAnyRole/hasPermission, logout)
    ├── constants/roles.ts      # ROLES = STUDENT | TEACHER | SYSTEM_ADMIN
    ├── api/axiosClient.ts      # baseURL=VITE_API_BASE_URL, Bearer accessToken, 401→/login
    ├── types/commonTypes.ts    # ApiResponse<T>, PaginatedResponse<T>, SelectOption<T>
    ├── utils/                  # cn.ts (merge class), formatDate.ts, fileUtils.ts (xlsx)
    ├── hooks/use-mobile.ts
    └── pages/                  # DashboardPage, ForbiddenPage (/403), NotFoundPage (*)
```

## 2. Boot flow (thứ tự chạy)

1. `main.tsx` → `createRoot.render(<App/>)`.
2. `App.tsx`: `AppProviders` (hiện chỉ `AuthProvider`, đọc `user` từ `localStorage` rồi mới render tiếp —
   `ProtectedRoute` chờ `isLoading` xong mới quyết định) → `AppRouter` → `Toaster` (toast toàn app).
3. `router.tsx`: `/`, `/login` → `LoginPage` (public); `/register`, `/403` (public);
   `*` → `NotFoundPage`; `/dashboard` (và mọi route feature sau này) nằm trong
   `<ProtectedRoute>` → `<AppLayout>` → `<Outlet/>`; lồng thêm
   `<ProtectedRoute allowedRoles={[...]}>` cho route theo role (sai role → `/403`).
4. `axiosClient` tự gắn `Bearer accessToken` (localStorage); gặp 401 thì xóa token + về `/login`.

## 3. Mạch kết nối (lần theo khi debug)

- **Màn hình → dữ liệu:** `pages/XPage.tsx` render `components/XForm.tsx` + gọi `hooks/useX.ts`
  → hook giữ `isLoading/error` → gọi `api/xApi.ts` → `axiosClient.<get|post><Type>(url)`
  → type Request/Response trong `types/xTypes.ts`. Mẫu đầy đủ: `LoginPage → LoginForm →
useLogin → authApi.login → axiosClient` (`features/auth/`).
- **Form:** schema + `type XFormValues = z.infer` trong `utils/validateX.ts` → component
  `useForm<XFormValues>({ resolver: zodResolver(schema) })` → `register()` + đoạn `<p>` lỗi
  có điều kiện (`LoginForm.tsx:17-49`). Không quản form bằng `useState`.
- **Auth:** `useLogin` thành công → `localStorage.accessToken` + `setUser(data.user)` →
  `navigate("/dashboard")`; `logout()` xóa user + về `/login`. Role check tại render:
  `hasAnyRole()` (sidebar lọc menu), `ProtectedRoute` (chặn route).
- **Thêm màn hình mới:** tạo theo khung §13 RULES.md → khai báo `<Route>` trong `router.tsx`
  (trong `<AppLayout>` nếu cần login, bọc `allowedRoles` nếu theo role) → thêm item vào
  `NAV_ITEMS` trong `AppSidebar.tsx` với `roles` tương ứng.
- **Toast:** gọi `toast.success/error/info(title, description)` từ `ui/toast.tsx` ở bất kỳ đâu
  (không cần props drilling — `<Toaster/>` đã mount ở `App`).

## 4. Khung file chuẩn (thứ tự trong file)

```
import ngoài (react, lib) → import @/... theo RULES.md §3 (không barrel) →
interface Props đặt ngay trên component → export function Tên (named export, PascalCase)
```

Primitive `ui/` mới = wrapper mỏng trên Base UI: ` Root/Trigger/Portal/Popup` giữ nguyên,
class Tailwind + `cn()` phủ ngoài, `className` của caller luôn nối cuối (mẫu: `ui/button.tsx`,
`ui/toast.tsx`). Không tạo primitive mới khi `ui/` đã có — tái dùng.

## 5. Tailwind: chỉ dùng biến định nghĩa

Mọi màu/border/shadow trong class phải là token `@theme` trong `index.css` (`bg-primary`,
`text-on-surface-variant`, `border-outline-variant/30`, `shadow-level-1`...). Mã hex rời
(`bg-[#14b8a6]`, `text-red-500`) chỉ xuất hiện trong `:root` khi định nghĩa token mới.
Bảng token hiện tại (`index.css:71-133`):

| Nhóm        | Token (→ hex)                                                                                                                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nền/chữ     | `background` #f4fbf8, `foreground`/`on-surface` #161d1b, `on-surface-variant` #3c4947, `inverse-surface` #2b3230, `inverse-on-surface` #ecf2ef                                                        |
| Thương hiệu | `primary`/`accent` #14b8a6 (+`on`: trắng/`00423b`), `primary-container` #14b8a6, `on-primary-container` #00423b, `secondary` #0058be, `secondary-container` #14b8a6, `on-secondary-container` #fefcff |
| Bề mặt      | `surface-container-lowest` #ffffff, `-low` #eff5f2, `-container` #e9efec, `-high` #e3eae7                                                                                                             |
| Viền/lỗi    | `outline` #6c7a77, `outline-variant` #bbcac6, `error`/`destructive` #ba1a1a, `on-error` trắng, `error-container` #ffdad6, `on-error-container` #93000a                                                |
| Khác        | `muted` #e9efec, `card`/`popover` trắng, `border`/`input` #bbcac6, `ring` #14b8a6, `chart-1..5`, `sidebar*` (xanh slate #0f172a...)                                                                   |
| Bo/bóng     | `rounded-md` 0.5rem (`radius-*`), `shadow-level-1/2`                                                                                                                                                  |

Base layer đã set sẵn: `body` nền/chữ + `h1–h3` cỡ 48/36/24px, `a` xanh + hover, nút con trỏ pointer,
`.material-symbols-outlined`. Thêm token màu mới = thêm cặp `--color-*` trong `@theme` +
hex trong `:root`. Cấm token `--spacing-*` custom — lý do ở RULES.md §6.

## 6. Config & scripts (tra cứu, không học thuộc)

`package.json` scripts: `dev` (vite), `build` (`tsc -b && vite build`), `typecheck` (`tsc --noEmit`),
`lint`/`lint:fix`, `format`/`format:check`. Env duy nhất: `VITE_API_BASE_URL`
(`.env.example` → `http://localhost:3000/api`), đọc qua `import.meta.env` trong `axiosClient`.
Alias `@` → `./src` (`vite.config.ts` + `tsconfig.app.json:23-25`).

## 7. Checklist xong-việc (kiểm hết mới coi là xong)

1. File đúng folder theo §1 + import alias `@/` + named export (RULES.md §3, §5).
2. Route khai báo trong `router.tsx` đúng vùng (public / ProtectedRoute / allowedRoles) + menu sidebar có `roles`.
3. Mọi màu sắc là token §5 (grep `#[0-9a-fA-F]{3,6}` ngoài `index.css` phải rỗng).
4. `npm run typecheck` + `npm run lint` + `npm run format:check` đều sạch.
