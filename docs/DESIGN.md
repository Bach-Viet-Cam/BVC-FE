# DESIGN.md — Hệ thống thiết kế Bách Việt Cầm

> "Trắng, đen, và một màu cam." Giao diện gần như không màu. Cam chỉ xuất hiện ở thứ người dùng cần nhìn ngay: chỉ số chính, mục đang chọn, đoạn đang sai. Nút hành động dùng màu mực đen.

---

## 1. Triết lý thiết kế

- **Monochrome + 1 accent.** Sáu giá trị màu, không thêm màu mới.
- **Cam là tín hiệu.** #F4622E chỉ xuất hiện ở: nút thu âm, cột biểu đồ đang xét, mục/đoạn đang chọn/sai. Ở mọi chỗ khác, dùng màu mực hoặc xám.
- **Không đổ bóng.** Tách lớp bằng viền và nền — không dùng `box-shadow` hay `drop-shadow` ở bất kỳ đâu.
- **Số đo dùng mono.** Mọi giá trị đo lường (BPM, %, ms, Hz, dung lượng) dùng IBM Plex Mono để các cột thẳng hàng.
- **Vùng chạm tối thiểu 44 px.** Nút thu âm 84 px vì người dùng bấm khi tay còn cầm nhạc cụ.

---

## 2. Bảng màu

Tokens định nghĩa trong `src/index.css` → `@theme inline` block. Tailwind v4 tự sinh utility `bg-bvc-*`, `text-bvc-*`, `border-bvc-*`.

### 2.1 Màu chính

| Token | Hex | Tailwind utility | Dùng cho |
|---|---|---|---|
| `bvc-accent` | `#F4622E` | `bg-bvc-accent` / `text-bvc-accent` | Nút thu âm, cột chart hiện tại, đoạn đang sai |
| `bvc-accent-tint` | `#FEEEE7` | `bg-bvc-accent-tint` | Nền nhãn lỗi, nền card tiếp tục luyện |
| `bvc-accent-text` | `#C4431A` | `text-bvc-accent-text` | Chữ cam trên nền trắng (tương phản 5.0:1) |
| `bvc-ink` | `#1A1714` | `bg-bvc-ink` / `text-bvc-ink` | Chữ chính, nút hành động chính, tab đang chọn |
| `bvc-muted` | `#6E6A64` | `text-bvc-muted` | Chữ phụ, nhãn tĩnh (tương phản 5.2:1) |
| `bvc-faint` | `#A09B94` | `text-bvc-faint` | Placeholder, hint — chỉ cỡ chữ ≥ 17 px |

### 2.2 Màu nền & viền

| Token | Hex | Tailwind utility | Dùng cho |
|---|---|---|---|
| `bvc-surface` | `#F7F5F3` | `bg-bvc-surface` | Nền trang ngoài frame, nền section phụ, khay chip |
| `bvc-line` | `#F2F1EF` | `border-bvc-line` | Đường kẻ hàng bảng, divider nhẹ trong card |
| `bvc-border` | `#EBE9E6` | `border-bvc-border` | Viền thẻ (card), viền đường ngang waveform |
| `bvc-border-strong` | `#E0DDD9` | `border-bvc-border-strong` | Viền input, viền nút phụ |
| `bvc-bar` | `#D8D5D0` | `bg-bvc-bar` | Cột biểu đồ rỗng, waveform bản mẫu |
| `bvc-bar-strong` | `#A8A49E` | `bg-bvc-bar-strong` | Waveform bản thu sinh viên |

### 2.3 Màu trạng thái (status dots — 7 px, không dùng ở đâu khác)

| Token | Hex | Tailwind utility | Ngữ nghĩa |
|---|---|---|---|
| `bvc-ok` | `#2E7D4F` | `bg-bvc-ok` | Đạt yêu cầu — chỉ dùng cho chấm 7 px và xu hướng dương |
| `bvc-warn` | `#D99B1E` | `bg-bvc-warn` | Cần chú ý |
| `bvc-error` | `#F4622E` | `bg-bvc-error` (= `bvc-accent`) | Sai nhiều |

> **Quy tắc cứng:** Xanh lá và vàng chỉ xuất hiện ở chấm 7 px và thanh bar chart trạng thái. Không dùng `bg-bvc-ok` hay `bg-bvc-warn` làm nền card hay nền nhãn. Cam nguyên bản `#F4622E` không đủ tương phản làm chữ nhỏ → dùng `#C4431A` (`text-bvc-accent-text`) thay thế.

---

## 3. Hệ thống chữ

### 3.1 Font stack

| Vai trò | Font | Khai báo |
|---|---|---|
| Sans (UI chính) | **Hanken Grotesk** → Be Vietnam Pro → system-ui | `font-family: var(--bvc-font-sans)` |
| Mono (số đo) | **IBM Plex Mono** → ui-monospace | `font-family: var(--bvc-font-mono)` |

Cài từ Google Fonts trong `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

### 3.2 Thang cỡ chữ

| Cỡ (px) | Weight | Dùng cho |
|---|---|---|
| `11` | 500–600 | Label rất nhỏ, footnote, mã màn hình |
| `12` | 400–600 | Label phụ, hint, mono hex |
| `13` | 400–700 | Body nhỏ, hàng bảng, chip label |
| `14` | 400–700 | Body mặc định, card label, nút phụ |
| `15` | 600 | Nút hành động chính |
| `17` | 600–700 | Subheading section |
| `21` | 800, letter-spacing -0.02em | Tên app trong top bar |
| `27–34` | 800, letter-spacing -0.025em | Tiêu đề màn hình |
| `36–80` | 500–600, mono | Số liệu lớn (BPM, note name trong tuner) |

> **Cỡ nhỏ nhất là 11 px.** Không dùng nhỏ hơn.

### 3.3 Quy tắc weight

- Tiêu đề: `font-weight: 800` + `letter-spacing: -0.025em`
- Nhãn quan trọng, nút: `600–700`
- Body, mô tả: `400`
- Số đo lớn (BPM, Hz, %): IBM Plex Mono `500–600`

---

## 4. Bo góc (Border Radius)

| Token | Giá trị | Dùng cho |
|---|---|---|
| `bvc-r-sm` | `11px` | Chip nhỏ, nút nhỏ, rounded-[11px] |
| `bvc-r-md` | `14px` | Input, nút hành động, tab khay |
| `bvc-r-lg` | `17px` | Hàng danh sách có border |
| `bvc-r-xl` | `20–22px` | Card lớn, thẻ nổi bật |

Trong Tailwind: `rounded-[11px]`, `rounded-[14px]`, `rounded-[17px]`, `rounded-[20px]`.

---

## 5. Thành phần nút (Buttons)

### 5.1 Nút hành động chính (Primary)

```tsx
<button className="w-full min-h-[46px] rounded-[14px] bg-bvc-ink text-white text-[15px] font-semibold">
  Hành động chính
</button>
```

- Nền `bg-bvc-ink` (#1A1714), chữ trắng
- `min-h-[46px]`, `rounded-[14px]`, `text-[15px] font-semibold`
- Disabled: `opacity-40 cursor-not-allowed`

### 5.2 Nút hành động phụ (Secondary)

```tsx
<button className="w-full min-h-[46px] rounded-[14px] border border-bvc-border-strong bg-white text-bvc-ink text-[15px] font-semibold">
  Hành động phụ
</button>
```

- Nền trắng, viền `border-bvc-border-strong`, chữ `text-bvc-ink`

### 5.3 Nút thu âm (Record — chỉ màn Practice)

```tsx
// Nút lớn (84 px)
<button className="size-[84px] rounded-full bg-bvc-accent text-white flex items-center justify-center">
  <Mic size={32} />
</button>

// Nút nhỏ (46 px, trong một số màn)
<button className="min-h-[46px] rounded-[14px] bg-bvc-accent text-white text-[15px] font-semibold">
  Thu âm
</button>
```

- **Chỉ** dùng `bg-bvc-accent` cho nút thu âm. Không dùng cam cho nút khác.
- Size 84 px cho màn Practice chính (người dùng bấm khi tay cầm nhạc cụ).

### 5.4 Nút icon nhỏ (Icon button)

```tsx
<button className="size-[40px] rounded-[13px] border border-bvc-border bg-white flex items-center justify-center text-bvc-ink">
  <Bell size={18} />
</button>
```

---

## 6. Chip & Nhãn trạng thái

### 6.1 Tab chip (trong khay điều hướng)

```tsx
// Active tab — tô mực
<span className="text-[13px] font-bold bg-bvc-ink text-white rounded-[9px] px-[11px] py-[6px]">
  Hôm nay
</span>

// Inactive tab
<span className="text-[13px] font-medium text-bvc-muted px-[10px] py-[6px]">
  Luyện tập
</span>
```

Khay chứa tab: `bg-bvc-surface rounded-[11px] p-[4px] flex gap-0`.

### 6.2 Filter chip (bộ lọc)

```tsx
// Active filter
<button className="border border-bvc-accent bg-bvc-accent-tint text-bvc-accent-text text-[13px] font-bold rounded-[11px] px-3 py-1.5">
  Đang chọn
</button>

// Inactive filter
<button className="border border-bvc-border-strong bg-white text-bvc-muted text-[13px] rounded-[11px] px-3 py-1.5">
  Lọc khác
</button>
```

### 6.3 Nhãn lỗi / phạm vi (Error range label)

```tsx
<span className="font-mono text-[13px] font-semibold bg-bvc-accent-tint text-bvc-accent-text rounded-[9px] px-3 py-1.5">
  Bar 18–24
</span>
```

Chỉ dùng nền cam nhạt cho nhãn gắn với lỗi. Không dùng cho trạng thái khác.

### 6.4 Nhãn pending / chờ duyệt

```tsx
<span className="text-[13px] border border-bvc-border-strong text-bvc-muted rounded-[9px] px-3 py-1.5">
  Chờ duyệt
</span>
```

### 6.5 Nhãn trạng thái với status dot

```tsx
<span className="flex items-center gap-1.5 text-[13px] border border-bvc-border-strong rounded-[9px] px-3 py-1.5">
  <span className="size-[7px] rounded-full bg-bvc-ok" />
  Verified
</span>
```

---

## 7. Chấm trạng thái (Status Dot)

Quy tắc: **7–8 px, chỉ dot, chữ giữ màu mực.** Không tô nền cả nhãn.

```tsx
// Component StatusDot trong src/shared/components/bvc/StatusDot.tsx
<StatusDot status="ok" label="Đạt yêu cầu" />
<StatusDot status="warn" label="Cần chú ý" />
<StatusDot status="error" label="Sai nhiều" />

// Inline pattern
<span className="flex items-center gap-2 text-[14px] text-bvc-ink">
  <span className="size-[7px] rounded-full bg-bvc-ok flex-shrink-0" />
  Đạt yêu cầu
</span>
```

| Status | Màu dot | Chữ |
|---|---|---|
| `ok` | `bg-bvc-ok` (#2E7D4F) | `text-bvc-ink` |
| `warn` | `bg-bvc-warn` (#D99B1E) | `text-bvc-ink` |
| `error` | `bg-bvc-error` (#F4622E) | `text-bvc-ink` |
| `muted` | `bg-bvc-bar-strong` (#A8A49E) | `text-bvc-muted` |

---

## 8. Biểu đồ cột (Bar Chart)

```tsx
// Tất cả cột màu xám; chỉ cột hiện tại màu cam
<div className="flex items-end gap-1 h-[52px]">
  {bars.map((bar, i) => (
    <span
      key={i}
      className={`flex-1 rounded-[2px] ${i === bars.length - 1 ? 'bg-bvc-accent' : 'bg-bvc-bar'}`}
      style={{ height: `${bar.percent}%` }}
    />
  ))}
</div>
```

- Cột mặc định: `bg-bvc-bar` (#D8D5D0)
- Cột hiện tại / mới nhất: `bg-bvc-accent` (#F4622E)
- Không dùng màu trạng thái (ok/warn) trong biểu đồ bar chart thông thường

---

## 9. Waveform

Mọi biểu diễn âm thanh là vạch mảnh, không phải cột to.

```tsx
// Component Waveform trong src/shared/components/bvc/Waveform.tsx
<Waveform
  bars={[{ h: 0.4 }, { h: 0.8, color: '#F4622E' }, { h: 0.6 }]}
  height={48}
/>
```

**Spec:**
- Vạch rộng `2 px`, `border-radius: 1px`
- Căn giữa quanh đường ngang màu `#EBE9E6`
- Khoảng cách giữa vạch: `2 px`
- Màu theo ngữ cảnh:

| Ngữ cảnh | Màu |
|---|---|
| Waveform bản mẫu (template) | `#D8D5D0` (`bvc-bar`) |
| Waveform bản thu sinh viên | `#A8A49E` (`bvc-bar-strong`) |
| Đoạn đang phát | `#F4622E` (`bvc-accent`) |
| Đoạn đang sai | `#F4622E` (`bvc-accent`) |

**Màn đang thu âm (RecordingPage):**
- Vạch mực dọc ở mép phải = đầu ghi (recording head)
- Waveform chạy từ phải sang trái theo thời gian thực

**Không phải waveform** (giữ dạng cột vì là dữ liệu chấm điểm):
- Timeline theo ô nhịp (M01-07 Analysis)
- Bản đồ timing (M01-07)
- Lưới phách (M01-14 SongAnalysis)

---

## 10. Input & Form

### 10.1 Text input

```tsx
<input className="w-full h-[50px] rounded-[15px] border border-bvc-border-strong bg-white px-4 text-[15px] text-bvc-ink placeholder:text-bvc-faint focus:outline-none focus:border-bvc-ink transition-colors" />
```

- Height `50 px`, `rounded-[15px]`
- Viền `border-bvc-border-strong` (#E0DDD9)
- Focus: viền chuyển `border-bvc-ink`
- Placeholder: `text-bvc-faint`
- Không dùng ring/shadow khi focus

### 10.2 Error state

```tsx
<input className="border-bvc-error" />
<p className="text-[13px] text-bvc-accent-text mt-1">Thông báo lỗi</p>
```

- Input: thêm `border-bvc-error`
- Error message: `text-bvc-accent-text` (không dùng `text-bvc-accent`)

---

## 11. Thẻ (Card)

### 11.1 Card tiêu chuẩn

```tsx
<div className="border border-bvc-border rounded-[20px] p-4 bg-white">
  {/* content */}
</div>
```

### 11.2 Card nổi bật (Continue card — màn Home)

```tsx
<div className="border border-[#F9D2C2] bg-bvc-accent-tint rounded-[22px] p-4">
  <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-bvc-accent-text">
    Tiếp tục luyện tập
  </span>
  <p className="text-[24px] font-extrabold mt-1">Lý Ngựa Ô</p>
  <button className="min-h-[42px] bg-bvc-ink text-white rounded-[14px] ...">
    Vào luyện
  </button>
</div>
```

### 11.3 Card thống kê (Stat card)

```tsx
// StatCard component trong src/shared/components/bvc/StatCard.tsx
<StatCard label="Độ chính xác" value="82%" variant="default" />
<StatCard label="Chuỗi ngày" value="7" variant="ok" />
```

---

## 12. Bố cục Mobile (428×926)

```tsx
// Pattern bắt buộc cho MỌI màn mobile
<div className="flex min-h-dvh justify-center bg-bvc-surface">
  <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
    {/* content */}
  </div>
</div>
```

- Nền ngoài: `bg-bvc-surface` (#F7F5F3)
- Frame trắng: `max-w-[428px]`, `h-dvh`, `overflow-hidden`
- Dùng `h-dvh` (dynamic viewport height) thay `h-screen` để tránh lỗi với mobile browser chrome

Hoặc dùng component `MobileFrame` từ `src/shared/components/bvc/MobileFrame.tsx`.

---

## 13. Điều hướng Mobile

### 13.1 Top bar (màn chính — Home, Library, Assignments, Ensemble)

**KHÔNG có bottom tab bar.** Điều hướng nằm trên đầu.

```tsx
// Phần 1: App bar
<div className="flex items-center px-4 pt-4 pb-2">
  <span className="text-[21px] font-extrabold tracking-[-0.02em] text-bvc-ink">
    Bách Việt Cầm
  </span>
  <div className="ml-auto flex items-center gap-2">
    <button className="size-[40px] rounded-[13px] border border-bvc-border bg-white flex items-center justify-center">
      <Bell size={18} />
    </button>
    <div className="size-[40px] rounded-full bg-bvc-accent-tint flex items-center justify-center text-[14px] font-bold text-bvc-accent-text">
      MA
    </div>
  </div>
</div>

// Phần 2: Tab row trong khay xám
<div className="px-4 pb-3">
  <div className="flex bg-bvc-surface rounded-[11px] p-1">
    <button className="flex-1 py-[6px] text-[13px] font-bold bg-bvc-ink text-white rounded-[8px]">
      Hôm nay
    </button>
    <button className="flex-1 py-[6px] text-[13px] font-medium text-bvc-muted">
      Luyện tập
    </button>
    {/* ... */}
  </div>
</div>
```

Tab list: **Hôm nay · Luyện tập · Thư viện · Bài tập · Hòa tấu**

### 13.2 Header màn sâu (màn con — có nút quay lại)

```tsx
// MobileHeader component
<div className="flex items-center gap-3 px-4 py-3 border-b border-bvc-line">
  <button onClick={() => navigate(-1)} className="size-[40px] flex items-center justify-center">
    <ChevronLeft size={20} />
  </button>
  <span className="text-[17px] font-bold text-bvc-ink">{title}</span>
  {/* rightSlot optional */}
</div>
```

### 13.3 Màn Practice (bỏ nav hoàn toàn)

Màn PracticePage bỏ hẳn top bar và tab row để nhường chỗ cho bản nhạc. Chỉ giữ nút đóng nhỏ ở góc.

---

## 14. Bố cục Desktop (1440×960)

Desktop pages là **self-contained** — có `DesktopSidebar` riêng, **không** bọc trong `AppLayout`.

```tsx
<div className="flex h-screen w-full overflow-hidden bg-white">
  <DesktopSidebar items={NAV_ITEMS} user={currentUser} />
  <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
    {/* page content */}
  </main>
</div>
```

Component `DesktopSidebar` trong `src/shared/components/bvc/DesktopSidebar.tsx`:

```tsx
<DesktopSidebar
  items={[
    { label: "Tổng quan", path: "/admin", icon: LayoutDashboard },
    { label: "Người dùng", path: "/admin/users", icon: Users },
  ]}
  user={{ name: "Admin", initials: "AD", role: "Quản trị viên" }}
  showLogo={true}
/>
```

Sidebar width: `240 px`. Active item: `bg-bvc-surface text-bvc-ink font-semibold`. Inactive: `text-bvc-muted`.

---

## 15. Shared Components (src/shared/components/bvc/)

Import từ barrel: `import { MobileFrame, MobileHeader, StatusDot, ... } from "@/shared/components/bvc"`.

| Component | Props chính | Dùng khi |
|---|---|---|
| `MobileFrame` | `children, className?` | Bọc mọi màn mobile |
| `MobileHeader` | `title, subtitle?, variant?: "back"\|"close", onBack?, rightSlot?` | Header màn sâu |
| `StatusDot` | `status: "ok"\|"warn"\|"error"\|"muted", label?, size?` | Chấm trạng thái 7px |
| `StatCard` | `label, value, variant?: "default"\|"surface"\|"accent"\|"ok"` | Thẻ chỉ số |
| `Waveform` | `bars: {h: number, color?: string}[], height?, defaultColor?` | Biểu diễn âm thanh |
| `ScoreRing` | `score: number, size?, strokeWidth?` | Vòng tròn điểm SVG |
| `ScoreBar` | `label, score: number, maxScore?` | Thanh điểm ngang |
| `TagBadge` | `variant: "verified"\|"community"\|"pending"\|"error"\|"ok"\|"warn"\|"muted", label` | Nhãn tag |
| `FilterChips` | `chips: {value, label}[], active, onChange` | Bộ lọc chip |
| `DesktopSidebar` | `items: NavItem[], user: UserInfo, showLogo?` | Sidebar desktop |
| `DesktopPageHeader` | `breadcrumb?, title, actions?` | Header trang desktop |

---

## 16. Số liệu lớn (Large Numbers)

```tsx
// Pattern: số mono + xu hướng màu
<div className="flex items-baseline gap-2">
  <span className="font-mono text-[36px] font-semibold leading-none">82%</span>
  <span className="text-[13px] font-semibold text-bvc-ok">+6 so với lần trước</span>
</div>
```

- Số: IBM Plex Mono, cỡ 27–80 px tùy ngữ cảnh
- Xu hướng dương: `text-bvc-ok` (#2E7D4F)
- Xu hướng âm: `text-bvc-accent-text` (#C4431A)
- Nhãn phụ bên trên: `text-[12px] text-bvc-muted`

---

## 17. Mẫu PWA

### 17.1 Nhắc cài đặt (Install Prompt)

- **Chỉ hiện sau lần luyện thứ hai**, không hiện lần đầu mở app.
- Dạng card nhỏ, `bg-bvc-surface rounded-[14px] p-[13px]`.

```tsx
<div className="flex items-center gap-3 bg-bvc-surface rounded-[14px] p-[13px]">
  <div className="size-9 rounded-[11px] bg-bvc-ink flex items-center justify-center text-white flex-shrink-0">
    <Download size={18} />
  </div>
  <div className="flex flex-col gap-0.5 flex-1">
    <span className="text-[13.5px] font-bold">Cài đặt ứng dụng</span>
    <span className="text-[12px] text-bvc-muted">Mở nhanh khi ngồi vào đàn, chạy toàn màn hình</span>
  </div>
  <button className="text-[13px] font-semibold text-bvc-accent-text">Cài</button>
</div>
```

### 17.2 Trạng thái ngoại tuyến (Offline)

```tsx
<div className="flex items-center gap-3 bg-bvc-surface rounded-[14px] p-[13px]">
  <div className="size-9 rounded-[11px] bg-white border border-bvc-border-strong flex items-center justify-center flex-shrink-0">
    <WifiOff size={18} className="text-bvc-ink" />
  </div>
  <div className="flex flex-col gap-0.5 flex-1">
    <span className="text-[13.5px] font-bold">Đang ngoại tuyến</span>
    <span className="text-[12px] text-bvc-muted">2 bản thu chờ gửi · tự động khi có mạng</span>
  </div>
</div>
```

### 17.3 Xin quyền microphone

- Xin **ngay trước lần thu âm đầu tiên**, kèm một câu giải thích rõ mục đích.
- Không xin lúc đăng nhập hay khi mở app.

---

## 18. Router & Màn hình

### 18.1 Cấu trúc route

```
/ (public)          → LoginPage
/login              → LoginPage
/register           → RegisterPage
/forgot             → ForgotPage
/403                → ForbiddenPage

<ProtectedRoute>
  Mobile screens (no AppLayout):
    /home                         → HomePage
    /profile                      → ProfilePage
    /practice/:songId             → PracticePage (bỏ nav)
    /practice/:songId/tuner       → TunerPage
    /practice/:songId/metronome   → MetronomePage
    /practice/:songId/recording   → RecordingPage
    /practice/:songId/quality     → QualityCheckPage
    /practice/:songId/modes       → ModesPage
    /practice/:songId/analysis/:recordingId → AnalysisPage
    /practice/:songId/error/:errorId        → ErrorDetailPage
    /practice/:songId/section     → SectionPage
    /practice/:songId/compare     → ComparePage
    /practice/:songId/history     → HistoryPage
    /practice/:songId/song-analysis → SongAnalysisPage
    /library                      → LibraryPage
    /library/upload               → SongUploadPage
    /library/:songId              → SongDetailPage
    /library/:songId/sheet        → SheetPage
    /saved                        → SavedPage
    /assignments                  → MyAssignmentsPage
    /assignment/:assignmentId     → AssignmentPage
    /ensemble/:sessionId          → EnsemblePage
    /rental                       → RentalPage

  Desktop screens (self-contained with DesktopSidebar):
    /teacher                      → TeacherPage
    /teacher/review               → ReviewPage
    /teacher/assignments/new      → AssignmentFormPage
    /songs                        → SongManagePage
    /songs/new                    → SongFormPage
    /songs/:songId/edit           → SongFormPage
    /songs/sheets                 → SheetManagePage
    /categories                   → CategoriesPage
    /admin                        → AdminPage
    /rental/provider              → RentalProviderPage

  <AppLayout> (legacy dashboard shell):
    /dashboard                    → DashboardPage
```

### 18.2 Danh sách 36 màn hình

| Mã | Tên | File HTML gốc | Route | Khung |
|---|---|---|---|---|
| System | Hệ thống thiết kế | System.html | — | 1200×1060 |
| Flow | Luồng & module map | Flow.html | — | 1200×820 |
| M00-01 | Đăng nhập | Login.html | `/login` | 428×926 |
| M00-02 | Quên mật khẩu | Forgot.html | `/forgot` | 428×926 |
| M00-03 | Trang chủ sinh viên | Main.html | `/home` | 428×926 |
| M00-06 | Hồ sơ & cài đặt | Profile.html | `/profile` | 428×926 |
| M00-05 | Trang chủ System Admin | Admin.html | `/admin` | 1440×960 |
| M01-01 | Phòng luyện tập | Practice.html | `/practice/:songId` | 428×926 |
| M01-02 | Tuner | Tuner.html | `/practice/:songId/tuner` | 428×926 |
| M01-03 | Metronome | Metronome.html | `/practice/:songId/metronome` | 428×926 |
| M01-04 | Chế độ luyện tập | Modes.html | `/practice/:songId/modes` | 428×926 |
| M01-05 | Đang thu âm | Recording.html | `/practice/:songId/recording` | 428×926 |
| M01-06 | Kiểm tra bản thu | QualityCheck.html | `/practice/:songId/quality` | 428×926 |
| M01-07 | Kết quả phân tích AI | Analysis.html | `/practice/:songId/analysis/:recordingId` | 428×926 |
| M01-08 | Chi tiết lỗi theo đoạn | ErrorDetail.html | `/practice/:songId/error/:errorId` | 428×926 |
| M01-09 | Luyện đoạn + Tempo ramp | Section.html | `/practice/:songId/section` | 428×926 |
| M01-11 | So sánh bản thu | Compare.html | `/practice/:songId/compare` | 428×926 |
| M01-12 | Lịch sử luyện tập | History.html | `/practice/:songId/history` | 428×926 |
| M01-13 | Tải bài hát | SongUpload.html | `/library/upload` | 428×926 |
| M01-14 | Beat · Chord · Key · Lyrics | SongAnalysis.html | `/practice/:songId/song-analysis` | 428×926 |
| M02-01 | Thư viện bài nhạc | Library.html | `/library` | 428×926 |
| M02-02 | Chi tiết bài nhạc | SongDetail.html | `/library/:songId` | 428×926 |
| M02-03 | Bản nhạc | Sheet.html | `/library/:songId/sheet` | 428×926 |
| M02-04 | Nội dung đã lưu | Saved.html | `/saved` | 428×926 |
| M02-05 | Quản lý bài nhạc | SongManage.html | `/songs` | 1440×960 |
| M02-06 | Tạo / Chỉnh sửa bài nhạc | SongForm.html | `/songs/new`, `/songs/:id/edit` | 1440×960 |
| M02-07 | Quản lý bản nhạc | SheetManage.html | `/songs/sheets` | 1440×960 |
| M02-08 | Phân loại nội dung | Categories.html | `/categories` | 1440×960 |
| M03-09 | Chi tiết bài tập & nộp bài | Assignment.html | `/assignment/:assignmentId` | 428×926 |
| M03-10 | Bài tập của tôi | MyAssignments.html | `/assignments` | 428×926 |
| M03-02 | Bảng điều khiển lớp | Teacher.html | `/teacher` | 1440×960 |
| M03-08 | Tạo bài tập | AssignmentForm.html | `/teacher/assignments/new` | 1440×960 |
| M05 | Luyện hòa tấu | Ensemble.html | `/ensemble/:sessionId` | 428×926 |
| M06-13 | Thuê nhạc cụ | Rental.html | `/rental` | 428×926 |
| M04-05 | Duyệt bài nộp | Review.html | `/teacher/review` | 1440×960 |
| M06-14 | Quản lý cho thuê | RentalProvider.html | `/rental/provider` | 1440×960 |

---

## 19. Checklist khi code 1 màn hình mới

- [ ] Mobile: bọc trong `MobileFrame` hoặc pattern `flex min-h-dvh justify-center bg-bvc-surface`
- [ ] Desktop: tự chứa `DesktopSidebar`, đặt NGOÀI `AppLayout` trong router
- [ ] Không dùng màu ngoài bảng token (không thêm hex mới)
- [ ] Cam (`bvc-accent`) chỉ dùng cho: nút thu âm, cột chart hiện tại, đoạn đang sai
- [ ] Chữ cam dùng `text-bvc-accent-text` (#C4431A), không dùng `text-bvc-accent`
- [ ] Mọi số đo (BPM, %, ms, Hz) → `font-mono` (IBM Plex Mono)
- [ ] Không dùng `box-shadow` hay `drop-shadow`
- [ ] Trạng thái = dot 7 px, chữ giữ `text-bvc-ink`
- [ ] Nút chính: `min-h-[46px]`, vùng chạm tối thiểu 44 px
- [ ] Nút thu âm: 84 px trên màn Practice chính
- [ ] Placeholder/hint: `text-bvc-faint`, chỉ dùng ở cỡ ≥ 13 px
- [ ] Border/separator: `border-bvc-line` (bảng) hoặc `border-bvc-border` (card)
