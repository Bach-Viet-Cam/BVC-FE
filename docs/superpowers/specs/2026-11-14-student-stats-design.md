# Thống kê sinh viên & nhận xét bài nộp (giảng viên) - Thiết kế

Ngày: 2026-11-14 · Phạm vi: BVC-FE + BVC-BE

## 1. Mục đích

Giảng viên hiện chỉ xem được bài nộp của một sinh viên dưới dạng lưới thẻ (audio + ô nhận xét) theo từng bài tập
(`StudentHistoryPage`). Không thấy được sinh viên tiến bộ thế nào qua các lần nộp, không xem được kết quả phân tích
chi tiết (biểu đồ cao độ, nhận xét AI) như sinh viên thấy, và không có chỗ ghi đánh giá chung về sinh viên.

Mục tiêu: từ danh sách lớp, giảng viên mở một sinh viên → thấy tổng quan tiến bộ (điểm cao nhất, đồ thị độ chính xác
theo từng bài) → đi vào từng lần nộp để xem kết quả đầy đủ và nhận xét. Sinh viên cũng thấy đồ thị và đánh giá chung
của mình.

## 2. Mục tiêu / Không làm / Thất bại nếu

**Mục tiêu**
- Trang Thống kê sinh viên (giảng viên): điểm cao nhất từng bài, đồ thị nhiều đường, đánh giá chung, lịch sử nộp.
- Trang chi tiết một lần nộp (giảng viên): giống trang Kết quả của sinh viên + khung nhận xét nổi, thu nhỏ được.
- Phía sinh viên: đồ thị nhiều đường + đánh giá chung (chỉ đọc) trên trang Lịch sử nộp bài.

**Không làm**
- Chấm điểm theo tiêu chí / rubric (đã bỏ). Không đụng tới bảng `Rubric`.
- Đồ thị chỉ vẽ **% độ chính xác** (`accuracy`), không vẽ cao độ/nhịp riêng.
- Không đổi `ReviewPage` (hàng đợi nhận xét) và `StudentSubmissionsPage` (từ luồng bài tập).
- Không hiện nhận xét từng bài nộp cho sinh viên trên trang Kết quả (ngoài phạm vi).
- Không thêm thư viện đồ thị.

**Thất bại nếu**
- Giảng viên lớp khác (hoặc sinh viên khác) xem được kết quả / thống kê của sinh viên không thuộc lớp mình.
- Khung nhận xét che mất nội dung không thể đọc được (phải thu nhỏ được) hoặc làm mất chữ đang gõ khi lưu.
- Đồ thị khó đọc khi một sinh viên có nhiều bài / nhiều lần nộp (phải lọc được về 1 đường).

## 3. Ràng buộc

- FE theo `BVC-FE/docs/RULES.md` (layout `features/{name}/pages|components|hooks|api|types|utils`, form RHF + zod theo
  mẫu `LoginForm`, token màu `bvc-*`). BE theo `BVC-BE/CLAUDE.md` (route → controller → service → repository,
  `validateRequest`, Prisma migration).
- Đồ thị tự vẽ SVG như các đồ thị hiện có; zoom/kéo dùng lại `features/practice/utils/chartView.ts`
  (`zoomView`, `panView`, `isZoomed`) và `ChartFullscreen` / `useFullscreenChartHeight`.
- Quyền nhận xét giữ đúng quy tắc hiện tại (`canComment`: khoá khi lớp đã kết thúc hoặc sinh viên không còn trong lớp).

## 4. Các cách đã cân nhắc

| Cách | Mô tả | Đánh đổi |
| --- | --- | --- |
| **A. API thống kê riêng (đã chọn)** | BE thêm API thống kê trả gọn dữ liệu đồ thị cho cả giảng viên và sinh viên; bảng `StudentEvaluation`; mở API kết quả cho giảng viên của lớp | Thêm ~3 API + 1 migration; FE chỉ 1 request, 1 component đồ thị dùng chung |
| B. FE tự gom | FE gọi API bài nộp theo từng bài tập rồi tự dựng đồ thị | N request/lớp; phía sinh viên không có API tương đương nên vẫn phải thêm BE → không tiết kiệm |

Chọn A vì phía sinh viên đằng nào cũng cần API mới, và một API dùng chung giữ đồ thị hai phía giống nhau.

## 5. BE

### 5.1 Bảng mới `StudentEvaluation`

```prisma
// Đánh giá chung của giảng viên về một sinh viên trong một lớp; sửa là ghi đè (không lưu lịch sử).
model StudentEvaluation {
  id         String   @id @default(uuid())
  classId    String   @map("class_id")
  studentId  String   @map("student_id")
  lecturerId String   @map("lecturer_id")   // người sửa gần nhất
  content    String   @db.VarChar(2000)
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")
  class      Class    @relation(fields: [classId], references: [id], onDelete: Cascade)
  student    User     @relation("StudentEvaluationStudent", fields: [studentId], references: [id])
  lecturer   User     @relation("StudentEvaluationLecturer", fields: [lecturerId], references: [id])

  @@unique([classId, studentId])
  @@map("student_evaluations")
}
```

Mỗi cặp (lớp, sinh viên) có một bản. Mọi giảng viên của lớp (chủ lớp + đồng giảng viên trong `ClassLecturer`) đều sửa
được; `lecturerId` là người sửa gần nhất.

### 5.2 API

**`GET /classes/:classId/students/:studentId/stats`** - giảng viên của lớp. 403 nếu không phải giảng viên lớp; 404 nếu
sinh viên chưa từng là thành viên lớp (vẫn cho xem sinh viên đã bị xoá khỏi lớp, nhưng `canEvaluate=false`).

**`GET /me/stats?classId=`** - sinh viên, chỉ của chính mình. Bỏ `classId` → lớp đang `ACTIVE` gần nhất của sinh
viên; sinh viên không ở lớp nào → `assignments: []`, `evaluation: null`.

Cả hai trả cùng một dạng:

```ts
interface StudentStatsDTO {
  student: { id: string; fullName: string; studentCode: string | null };
  class: { id: string; name: string; cohort: string; status: ClassStatus };
  evaluation: { content: string; lecturerName: string; updatedAt: string } | null;
  canEvaluate: boolean;            // luôn false ở API sinh viên
  assignments: Array<{
    id: string; title: string; kind: AssignmentKind;
    bestAccuracy: number | null;   // null nếu chưa có lần nộp COMPLETED
    attemptCount: number;
    attempts: Array<{              // tất cả lần nộp, tăng dần theo thời gian
      submissionId: string; attemptNo: number; submittedAt: string;
      status: SubmissionStatus; accuracy: number | null;
      hasComment: boolean;
    }>;
  }>;
}
```

- `assignments`: các bài tập không phải `DRAFT` của lớp, theo thứ tự `SOLO, ENSEMBLE, BONUS, OTHER` rồi ngày đăng.
  Gồm cả bài sinh viên chưa nộp (`attempts: []`).
- `accuracy` cùng đơn vị với `accuracy` đang trả ở `GET /assignments/:id/students/:studentId/submissions` (builder
  kiểm tra và giữ nhất quán; FE hiển thị dạng %).
- Thứ tự `attemptNo` dùng cùng cách tính với API bài nộp hiện tại.

**`PUT /classes/:classId/students/:studentId/evaluation`** - giảng viên lớp. Body `{ content: string }` (trim, 1–2000
ký tự). Upsert. Trả `evaluation` như trên. Khoá (409 hoặc 403, theo cách `saveComment` đang báo lỗi khoá) khi lớp đã
kết thúc hoặc sinh viên không còn trong lớp - cùng quy tắc với `canComment`.

### 5.3 Mở API kết quả cho giảng viên

`GET /practice/submissions/:id/result | /history | /pitch-chart` hiện chỉ cho chủ bài nộp
(`PracticeResultService.findOwned`). Đổi điều kiện thành: **chủ bài nộp, hoặc giảng viên của lớp chứa bài tập của bài
nộp đó** (dùng `ClassAccessService` sẵn có nếu phù hợp). Bài luyện tự do (không có `assignmentId`) vẫn chỉ chủ bài nộp
xem được. `class-rank` giữ nguyên (chỉ sinh viên).

`/submissions/:id/audio` đã dùng chung `auth` - builder xác nhận giảng viên lớp nghe được (màn hiện tại đang nghe được).

Khi người gọi là giảng viên, `result` trả thêm:

```ts
lecturerReview?: {
  comment: { content: string; updatedAt: string } | null;
  canComment: boolean;
  student: { id: string; fullName: string; studentCode: string | null };
  classId: string;
}
```

Lưu nhận xét dùng API sẵn có `PUT /submissions/:id/comment`.

## 6. FE

### 6.1 Component đồ thị dùng chung `AccuracyLinesChart`

Đặt ở `features/practice/components/` (cả hai phía dùng). Nhận `assignments` từ `StudentStatsDTO`.

```
┌ Độ chính xác qua các lần nộp ─────────── [Tất cả bài ▾] [－][＋][⤢] ┐
│ 100% ┤                    ●───●                                    │
│  80% ┤        ●──●───●───╱      ● ── Bài 1 (SOLO)                  │
│  60% ┤   ●───╱   ○───○───○        ○ ── Bài 2 (ENSEMBLE)            │
│  40% ┤                                                             │
│      └──┬───┬───┬───┬───┬───┬──                                    │
│        L1  L2  L3  L4  L5  L6     (trục X = lần nộp)                │
│  ■ Bài 1  ■ Bài 2  ■ Bài 3   ← chú thích, bấm để ẩn/hiện            │
└────────────────────────────────────────────────────────────────────┘
```

- Trục X = số lần nộp (1, 2, 3…) của từng bài; trục Y = % độ chính xác. Mỗi bài một đường, màu riêng.
- Chỉ vẽ lần nộp có `accuracy` (lần lỗi/đang xử lý bỏ qua). Bài chưa có lần nào không vẽ, vẫn có trong bộ lọc
  (disabled).
- Bộ lọc: chọn "Tất cả bài" hoặc một bài → chỉ một đường. Bấm chú thích để ẩn/hiện từng đường.
- Zoom bằng con lăn / nút −/+ và kéo để di chuyển (theo cách `PitchContourCard` làm, dùng `chartView`); nút đặt lại
  khi đang zoom. Nút ⤢ mở `ChartFullscreen`.
- Di chuột / chạm vào điểm → tooltip (`ChartTooltip`): tên bài, lần nộp, thời gian, %.
- Phía giảng viên: bấm vào điểm → mở trang chi tiết lần nộp đó.

### 6.2 Trang Thống kê sinh viên (giảng viên)

Route giữ nguyên `/teacher/classes/:classId/students/:studentId` (đã được tab Thành viên và "Sinh viên cần chú ý"
trỏ tới), thay nội dung `StudentHistoryPage` bằng `StudentStatsPage`. Giữ cách lấy `backPath` từ `location.state`.

```
← Nguyễn Văn A                                   SV001 · Lớp DNH103 · K68
┌ Điểm cao nhất ─────────────────────────────────────────────────────┐
│ [SOLO Bài 1  92%  4 lần] [ENSEMBLE Bài 2  78%  2 lần] [BONUS … — ] │
└────────────────────────────────────────────────────────────────────┘
┌ AccuracyLinesChart ────────────────────────────────────────────────┐
└────────────────────────────────────────────────────────────────────┘
┌ Đánh giá chung ────────────────────┐ ┌ Lịch sử nộp bài [Bài: Tất cả ▾]┐
│ textarea (2000)        0 / 2000    │ │ Bài 1 · Lần 4 · 12/11 09:30    │
│ Sửa lần cuối: GV B, 13/11          │ │   92% · Đã chấm · 💬 Đã nhận xét│
│                [Lưu đánh giá]      │ │ Bài 1 · Lần 3 · …          →   │
└────────────────────────────────────┘ └────────────────────────────────┘
```

- Thẻ điểm cao nhất: mỗi bài một thẻ (`StatCard` hoặc tương tự); bấm thẻ = lọc đồ thị + danh sách về bài đó.
- Lịch sử nộp: mới nhất trước, lọc theo bài (chung trạng thái lọc với đồ thị). Mỗi dòng: bài, lần, thời gian, %,
  trạng thái, đã/chưa nhận xét. Bấm → trang chi tiết. Lần nộp chưa `COMPLETED` vẫn liệt kê, bấm vào cũng mở trang
  chi tiết (xem 6.3).
- Đánh giá chung: form RHF + zod (mẫu `SubmissionCard`), `readOnly` + thông báo khoá khi `canEvaluate=false`. Lưu
  thành công → toast, giữ nguyên chữ.
- Desktop: đánh giá và lịch sử nằm cạnh nhau; mobile: xếp dọc.

### 6.3 Trang chi tiết lần nộp (giảng viên)

Route mới: `/teacher/classes/:classId/students/:studentId/submissions/:submissionId` →
`TeacherSubmissionResultPage`.

- Dùng lại các thẻ của `ResultsPage`: `ResultOverviewCard`, `AiFeedbackCard`, `PitchContourCard`,
  `ResultAudioPlayers`, `ProgressHistoryCard`, cùng bố cục lưới. **Bỏ**: `ClassRankCard`, `SegmentAttemptsCard`,
  `SubmissionSharing`, nút "Luyện tập lại", và chuyển hướng sang màn xử lý. Dùng khung trang giảng viên
  (`TeacherScreen` + `TeacherPageHeader`, back về trang thống kê), không dùng `StudentShell`.
- Bài nộp chưa `COMPLETED`: hiện trạng thái (đang xử lý / bị từ chối / lỗi) + nghe lại + khung nhận xét; không có
  thẻ điểm.
- Nên tách phần lưới thẻ của `ResultsPage` thành một component dùng chung để hai trang không lệch nhau.

**Khung nhận xét nổi** (`FloatingCommentPanel`):

```
Mở (desktop: fixed, góc phải dưới, rộng ~380px)     Thu nhỏ
┌ Nhận xét · Lần 4 ─────────── [–] ┐               ┌──────────────────────┐
│ textarea                          │               │ 💬 Nhận xét (đã gửi) ▴│
│                       120 / 2000  │               └──────────────────────┘
│              [Cập nhật nhận xét]  │
└───────────────────────────────────┘
```

- `position: fixed`, luôn trên màn hình khi cuộn. Nút thu nhỏ → còn một thanh nhỏ; bấm để mở lại. Trạng thái
  mở/thu nhỏ nhớ trong `localStorage` (bọc try/catch).
- Mobile: thanh ngang dính đáy màn hình, mở ra thành tấm đáy (tối đa ~60% chiều cao).
- Chữ đang gõ không mất khi thu nhỏ / mở lại hay sau khi lưu.
- Trang thêm `padding-bottom` đủ để khung (khi thu nhỏ) không che nội dung cuối trang.
- Lưu qua `PUT /submissions/:id/comment`; khoá theo `lecturerReview.canComment` với thông báo
  `COMMENT_LOCKED_MESSAGE` sẵn có.

### 6.4 Phía sinh viên

Trang `SubmissionHistoryPage` (`/practice/submissions`) thêm ở đầu trang (trên bộ lọc), gọi `GET /me/stats`:
- Thẻ "Đánh giá của giảng viên" (chỉ đọc, ẩn khi `evaluation=null`): nội dung, tên giảng viên, ngày cập nhật.
- `AccuracyLinesChart` (không có bấm-để-mở; tooltip vẫn có). Ẩn khi chưa có bài nào có điểm.
- Sinh viên ở nhiều lớp: dropdown chọn lớp cạnh tiêu đề thẻ; mặc định lớp `ACTIVE` gần nhất.
- Lỗi tải thống kê chỉ ảnh hưởng hai thẻ này, phần lịch sử bên dưới vẫn chạy.

## 7. Quyết định của người dựng (đánh dấu là đề xuất của Claude, người dùng có thể sửa)

- Giữ nguyên route `/teacher/classes/:classId/students/:studentId` thay vì thêm route mới.
- Mọi giảng viên của lớp sửa chung một đánh giá; lưu người sửa gần nhất.
- Vẫn xem được thống kê của sinh viên đã bị xoá khỏi lớp (chỉ đọc).
- Trang chi tiết bỏ xếp hạng lớp, luyện đoạn, chia sẻ, "Luyện tập lại".
- Trục X của đồ thị là số lần nộp (không phải thời gian thật) để các bài so được với nhau.
- `ReviewPage`, `StudentSubmissionsPage` giữ nguyên.

## 8. Để lại cho người dựng

- Tên file/hook cụ thể, cách tách lưới thẻ của `ResultsPage`.
- Bảng màu cho các đường (lấy từ token `bvc-*`, đủ phân biệt ~6 bài; quá 6 thì lặp màu + kiểu nét).
- Mã lỗi khoá cụ thể cho API đánh giá (theo `saveComment`).
- Test: BE service (quyền xem kết quả, quyền/khoá đánh giá, dạng dữ liệu thống kê); FE: `AccuracyLinesChart` (lọc,
  ẩn đường), `StudentStatsPage`, `FloatingCommentPanel` (thu nhỏ/mở, giữ chữ).
