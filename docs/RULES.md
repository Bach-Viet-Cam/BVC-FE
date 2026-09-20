# RULES.md

## 1. Stack & Versions

| Layer | Package | Version |
|---|---|---|
| Build | Vite | ^8.0.0 |
| UI | React | ^19.1.0 |
| Language | TypeScript | ^5.8.3 |
| Styling | Tailwind CSS v4 | ^4.1.6 |
| Routing | react-router-dom | ^7.5.3 |
| Forms | react-hook-form + zod + @hookform/resolvers | ^7.55.0 / ^3.24.4 / ^5.2.2 |
| HTTP | axios | ^1.8.4 |
| Date | date-fns | ^4.1.0 |
| Primitives | @base-ui/react | ^1.8.0 |
| Icons | lucide-react | ^1.47.0 |
| Excel | xlsx | ^0.18.5 |

---

## 2. Folder Structure

```
src/
├── app/                     # Global setup only
│   ├── App.tsx
│   ├── router.tsx
│   └── providers/
│
├── features/                # One folder per domain
│   └── {feature}/
│       ├── pages/           # Route-level components
│       ├── components/      # UI dùng riêng cho feature này
│       ├── hooks/           # Custom hooks của feature
│       ├── api/             # API calls của feature
│       ├── types/           # TypeScript types/interfaces
│       ├── constants/       # Feature-specific constants
│       ├── context/         # Feature-specific context/providers
│       └── utils/           # Helpers, schemas, validators
│
├── shared/                  # Dùng lại ở nhiều features
│   ├── components/          # Component thuần (Button, ...)
│   ├── components/ui/       # Primitives Base UI (dialog, select, tabs, toast, ...)
│   ├── hooks/               # Hooks dùng chung
│   ├── api/                 # axiosClient.ts
│   ├── constants/           # env.ts, ...
│   ├── types/               # commonTypes.ts
│   ├── utils/               # cn.ts, formatDate.ts, fileUtils.ts, ...
│   └── context/             # AuthContext.tsx, ThemeContext.tsx, ...
│
├── assets/                  # Static: images, fonts, svgs
├── main.tsx
└── index.css

public/
└── (Không còn thư mục locales — text hiển thị hardcode tiếng Việt trực tiếp trong UI.)
```

**Rule quyết định vị trí file:**
- Code chỉ dùng trong 1 feature → `features/{feature}/`
- Code dùng ở ≥ 2 features → `shared/`
- Setup global (router, providers) → `app/`

---

## 3. Import Rules

### ✅ Luôn dùng alias `@/` — KHÔNG dùng relative path lên thư mục cha

```ts
// ✅ Đúng
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { authApi } from "@/features/auth/api/authApi";
import { axiosClient } from "@/shared/api/axiosClient";
import { cn } from "@/shared/utils/cn";

// ❌ Sai
import { LoginForm } from "../components/LoginForm";
import { axiosClient } from "../../shared/api/axiosClient";
```

### ❌ KHÔNG dùng barrel exports (index.ts re-export)

```ts
// ❌ Không tạo file này
// features/auth/index.ts
export * from "./components/LoginForm";
export * from "./hooks/useLogin";

// ✅ Import trực tiếp đến file
import { LoginForm } from "@/features/auth/components/LoginForm";
```

---

## 4. TypeScript

- Luôn dùng `interface` cho object shapes, `type` cho unions/intersections
- Không dùng `any` — dùng `unknown` nếu chưa biết type
- Không dùng `as` ép kiểu trừ khi thực sự cần (ghi comment lý do)
- Props của component phải có interface riêng, đặt ngay trên component

```ts
// ✅ Đúng
interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) { ... }

// ❌ Sai
export function ProductCard({ product, onSelect }: { product: any; onSelect: any }) { ... }
```

- Export kiểu tường minh: dùng `export type` cho types/interfaces

```ts
export type { LoginFormValues };   // ✅
export { loginSchema };            // ✅
```

---

## 5. Component Conventions

- Luôn dùng **named export**, không dùng default export cho components

```ts
// ✅
export function LoginForm() { ... }

// ❌
export default function LoginForm() { ... }
```

- Tên file = tên component (PascalCase): `LoginForm.tsx`
- Hooks: camelCase bắt đầu bằng `use`: `useLogin.ts`
- Không để logic trong JSX — tách ra hooks hoặc utils
- Không dùng `<div>` cho interactive elements — dùng `<button>`, `<a>`, v.v.

---

## 6. Styling — Tailwind CSS v4

- **Không** dùng `tailwind.config.js` hay `postcss.config.js` — Tailwind v4 dùng Vite plugin
- Import trong `index.css` (chỉ dòng này, không thêm `tw-animate-css` hay package css khác):

```css
@import "tailwindcss";
```

- Primitives unstyled nằm ở `shared/components/ui/` (Base UI: `Root/Trigger/Portal/Popup...`).
  Style bằng Tailwind + `cn()`, state/animation qua `data-*` attributes
  (`data-open`, `data-highlighted`, `data-starting-style`/`data-ending-style`).
- Toast dùng chung: `toast.success/error/info()` từ `@/shared/components/ui/toast`, `<Toaster />` đã gắn ở `App`.
- ⚠️ **Cấm** tự định nghĩa token `--spacing-xs/sm/md/lg/xl/2xl/3xl...` trong `@theme`:
  Tailwind (≥4.3) resolve `max-w-md`, `min-w-*`... theo namespace `--spacing-*` trước,
  token custom sẽ đè `max-w-md: 28rem` thành `16px` và bóp layout (đã dính 1 lần ở trang login).
  Dùng thang số mặc định (`p-4`, `gap-2`...); chỉ custom `color/radius/shadow`.

- Dùng `cn()` từ `@/shared/utils/cn` để merge classes có điều kiện:

```ts
import { cn } from "@/shared/utils/cn";

className={cn("base-class", isActive && "active-class", className)}
```

- Không inline style (`style={{}}`) trừ khi là dynamic value không thể dùng class

---

## 7. Forms

Stack cố định: `react-hook-form` + `zod` + `@hookform/resolvers`

```ts
// utils/validateXxx.ts — định nghĩa schema + infer type tại đây
export const loginSchema = z.object({ ... });
export type LoginFormValues = z.infer<typeof loginSchema>;

// component — chỉ dùng schema, không validate thủ công
const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
});
```

- Schema đặt trong `features/{feature}/utils/validate{Name}.ts`
- Không dùng `useState` để manage form state — để react-hook-form lo

---

## 8. API Layer

```ts
// shared/api/axiosClient.ts — dùng chung, đã có interceptors
// features/{feature}/api/{feature}Api.ts — gọi axiosClient

export const authApi = {
  login: (data: LoginRequest) =>
    axiosClient.post<AuthResponse>("/auth/login", data),
};
```

- Không gọi `axios` trực tiếp — luôn dùng `axiosClient`
- Response type luôn được generic: `axiosClient.get<MyType>("/path")`
- Xử lý error trong hook, không trong api file

---

## 9. State Management

- Không dùng Redux — state cục bộ dùng `useState`/`useReducer`, state dùng chung dùng React Context trong `shared/context/` hoặc `features/{feature}/context/`
- Không import gì từ `react-redux` / `@reduxjs/toolkit` (đã gỡ khỏi dự án)

---

## 10. Ngôn ngữ hiển thị

- i18n đã gỡ khỏi dự án — text hiển thị hardcode **tiếng Việt** trực tiếp trong JSX, không dùng `t()` hay namespace

---

## 11. File Utilities

- **Excel** — dùng helpers từ `@/shared/utils/fileUtils`:

```ts
import { readExcelFile, exportToExcel } from "@/shared/utils/fileUtils";
```

- **Không** import `xlsx` trực tiếp trong components — luôn qua utils

---

## 12. Naming Conventions

| Loại | Convention | Ví dụ |
|---|---|---|
| Component file | PascalCase | `LoginForm.tsx` |
| Hook file | camelCase | `useLogin.ts` |
| Util / helper | camelCase | `formatDate.ts` |
| Type / interface | PascalCase | `AuthResponse`, `LoginRequest` |
| Const (enum-like) | SCREAMING_SNAKE | `API_BASE_URL` |
| API object | camelCase + `Api` suffix | `authApi`, `productApi` |

---

## 13. Checklist khi tạo Feature mới

```
features/{newFeature}/
├── pages/         ← route components
├── components/    ← UI của feature
├── hooks/         ← custom hooks
├── api/           ← {newFeature}Api.ts  (dùng axiosClient)
├── types/         ← {newFeature}Types.ts
└── utils/         ← validate{Name}.ts (zod schemas)

src/app/router.tsx                    ← thêm route mới
```
