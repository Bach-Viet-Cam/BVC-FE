# Thống kê sinh viên & nhận xét bài nộp - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Giảng viên xem thống kê một sinh viên (điểm cao nhất, đồ thị độ chính xác nhiều đường, đánh giá chung, lịch sử nộp) và xem kết quả đầy đủ từng lần nộp kèm khung nhận xét nổi; sinh viên thấy đồ thị + đánh giá chung ở trang Lịch sử nộp bài.

**Architecture:** BE thêm một bộ tính thống kê thuần (`StudentStatsCalculator`) dùng chung cho API giảng viên và API sinh viên, bảng `StudentEvaluation` + API upsert, và nới quyền 3 API kết quả cho giảng viên của lớp. FE thêm một component đồ thị SVG dùng chung (`AccuracyLinesChart`), trang `StudentStatsPage` thay `StudentHistoryPage`, trang `TeacherSubmissionResultPage` dùng lại lưới thẻ kết quả tách ra từ `ResultsPage`, và hai thẻ mới trên `SubmissionHistoryPage`.

**Tech Stack:** BE: Express + Prisma + zod (`validateRequest`), test `node:test` qua `npm test` (tsx). FE: React + react-router + RHF/zod + Tailwind v4 token `bvc-*`, test Vitest + Testing Library.

**Spec:** `BVC-FE/docs/superpowers/specs/2026-11-14-student-stats-design.md`

## Global Constraints

- **Không commit.** `BVC-BE/CLAUDE.md`: chỉ commit khi người dùng yêu cầu rõ ràng. Mỗi task kết thúc bằng chạy test, không có bước commit.
- Không tự viết file migration; sửa `schema.prisma` rồi chạy `npx prisma migrate dev --name add-student-evaluations`. Không chạy `prisma db push`.
- Mọi message BE bằng tiếng Việt có dấu đầy đủ. Mọi chữ FE bằng tiếng Việt.
- BE: file mới export đúng một class, tên PascalCase có hậu tố tầng (`...Service.ts`, `...Repository.ts`, `...Controller.ts`, `...Validation.ts`, `...DTO.ts`); đọc `BVC-BE/.agents/rules/coding-convention.md` trước task BE đầu tiên.
- FE: theo `BVC-FE/docs/RULES.md`; chỉ dùng token màu `bvc-*` có sẵn; không thêm thư viện đồ thị.
- Nhận xét / đánh giá: 1–2000 ký tự sau trim. Khoá khi `class.status !== 'ACTIVE'` hoặc sinh viên không còn là thành viên đang hoạt động → `AppError.conflict(..., { code: 'MSG-08' })` (giống `SubmissionCommentService.saveComment`).
- Đồ thị chỉ vẽ độ chính xác (`accuracy`, cùng đơn vị 0–100 như API bài nộp hiện tại). Không rubric.
- Thứ tự bài tập: `SOLO, ENSEMBLE, BONUS, OTHER`, rồi `publishedAt` tăng dần; bỏ `DRAFT` và bài đã xoá (`deletedAt`).

## Review Focus

1. **Giảng viên lớp khác gọi API kết quả / thống kê của sinh viên lớp mình không dạy** → phải 404 (không lộ tồn tại). Test ở Task 4 (`getResult` với giảng viên lạ) và Task 2 (stats dùng `assertOwnedClass`).
2. **Bài luyện tự do (không có `assignmentId`)** bị giảng viên mở bằng id → 404. Test ở Task 4.
3. **Lần nộp `FAILED`/`REJECTED`/`PROCESSING` có `accuracy = null`** → không vẽ điểm, không tính vào `bestAccuracy`, nhưng vẫn có trong `attempts` và danh sách lịch sử. Test ở Task 1 và Task 6.
4. **Lưu nhận xét/đánh giá khi đang gõ** → phản hồi lưu xong không làm mất chữ, thu nhỏ khung không mất chữ. Test ở Task 8 (`FloatingCommentPanel` giữ chữ khi thu nhỏ/mở).
5. **Sinh viên chưa ở lớp nào / lớp không có bài** → `/me/stats` trả rỗng, FE ẩn hai thẻ, trang lịch sử vẫn chạy. Test ở Task 2 và Task 9.

---

## BE (`D:\BVC\BVC-BE`)

### Task 1: Bộ tính thống kê thuần `StudentStatsCalculator`

**Files:**
- Create: `src/modules/classes/service/StudentStatsCalculator.ts`
- Test: `src/modules/classes/service/StudentStatsCalculator.test.ts`
- Modify: `src/types/ClassTypes.d.ts` (thêm các type dưới vào namespace `Backend`)

**Interfaces:**
- Produces:
  ```ts
  interface StatsAssignmentRow { id: string; title: string; kind: AssignmentKind; publishedAt: Date | null }
  interface StatsSubmissionRow { id: string; assignmentId: string; status: SubmissionStatus; accuracy: number | null; createdAt: Date; hasComment: boolean }
  interface StudentStatsAttemptDTO { submissionId: string; attemptNo: number; submittedAt: string; status: SubmissionStatus; accuracy: number | null; hasComment: boolean }
  interface StudentStatsAssignmentDTO { id: string; title: string; kind: AssignmentKind; bestAccuracy: number | null; attemptCount: number; attempts: StudentStatsAttemptDTO[] }
  class StudentStatsCalculator { static build(assignments: StatsAssignmentRow[], submissions: StatsSubmissionRow[]): StudentStatsAssignmentDTO[] }
  ```

- [ ] **Step 1: Viết test thất bại** (`node:test` + `node:assert/strict`, theo mẫu `AssignmentPracticeStatsCalculator.test.ts`)
  - `build orders assignments by kind then publishedAt`: input `[OTHER a3, SOLO a2 (pub 2026-10-02), SOLO a1 (pub 2026-10-01), ENSEMBLE a4]` → ids `['a1','a2','a4','a3']`.
  - `build numbers attempts per assignment in submission order`: 3 lần nộp a1 (createdAt t1<t2<t3, đưa vào lộn xộn) → `attemptNo` `[1,2,3]`, `submittedAt` ISO tăng dần.
  - `build ignores null accuracy for best`: a1 có `[{COMPLETED,70},{FAILED,null},{COMPLETED,85}]` → `bestAccuracy 85`, `attemptCount 3`, attempt 2 có `accuracy null`.
  - `build keeps assignments without submissions`: a2 không có lần nộp → `{ bestAccuracy: null, attemptCount: 0, attempts: [] }`.
  - `build drops submissions of unknown assignments`: submission có `assignmentId 'x'` không nằm trong danh sách → không xuất hiện.
- [ ] **Step 2:** `npx tsx --test src/modules/classes/service/StudentStatsCalculator.test.ts` → FAIL (module không tồn tại).
- [ ] **Step 3:** Cài `StudentStatsCalculator.build`. Thứ tự kind lấy từ hằng `['SOLO','ENSEMBLE','BONUS','OTHER']`; `publishedAt null` xếp sau.
- [ ] **Step 4:** Chạy lại → PASS.

### Task 2: API thống kê (giảng viên + sinh viên)

**Files:**
- Create: `src/modules/classes/repository/StudentStatsRepository.ts`
- Create: `src/modules/classes/service/StudentStatsService.ts`
- Create: `src/modules/classes/service/StudentStatsPolicyService.ts` + `.test.ts`
- Create: `src/modules/classes/controller/StudentStatsController.ts`
- Create: `src/modules/classes/validation/StudentStatsValidation.ts`
- Create: `src/modules/classes/route/StudentStatsRoute.ts` (đăng ký trong `src/modules/classes/index.ts` cạnh các route khác)
- Modify: `src/modules/classes/constant/ClassConstant.ts` (message `STUDENT_NOT_FOUND` nếu chưa có - dùng lại của `AssignmentConstant` nếu import hợp lệ)
- Modify: `src/types/ClassTypes.d.ts` (thêm `StudentStatsDTO`)

**Interfaces:**
- Consumes: `StudentStatsCalculator.build` (Task 1); `ClassAccessService.assertOwnedClass(classId, lecturerId)`; `MemberRepository.findActiveMembership(classId, studentId)`; `SubmissionRepository.findStudentProfile(studentId)` (assignments module).
- Produces:
  ```ts
  interface StudentStatsDTO {
    student: { id: string; fullName: string; studentCode: string | null };
    class: { id: string; name: string; cohort: string; status: ClassStatus };
    evaluation: { content: string; lecturerName: string; updatedAt: string } | null;
    canEvaluate: boolean;
    classes?: Array<{ id: string; name: string; cohort: string; status: ClassStatus }>; // chỉ API sinh viên: các lớp sinh viên đang/đã học, để FE làm dropdown
    assignments: StudentStatsAssignmentDTO[];
  }
  StudentStatsPolicyService.canEvaluate(classStatus: ClassStatus, isActiveMember: boolean): boolean
  StudentStatsPolicyService.pickDefaultClass(classes: Array<{ id: string; status: ClassStatus; startDate: Date }>): string | null // ACTIVE có startDate mới nhất, không có thì lớp có startDate mới nhất
  StudentStatsService.getForLecturer(classId: string, studentId: string, lecturerId: string): Promise<StudentStatsDTO>
  StudentStatsService.getForStudent(studentId: string, classId?: string): Promise<StudentStatsDTO | null> // null khi sinh viên không thuộc lớp nào
  ```
  Routes:
  - `GET /classes/:id/students/:studentId/stats` - `lecturerOnly`
  - `GET /me/stats?classId=` - `studentOnly` (`requireRoles(AuthConstant.roles.STUDENT)`); trả `data: null` khi không có lớp.

- [ ] **Step 1: Test thất bại cho policy** (`StudentStatsPolicyService.test.ts`)
  - `canEvaluate` → `('ACTIVE', true) === true`, `('ACTIVE', false) === false`, `('ENDED', true) === false`.
  - `pickDefaultClass` → `[ENDED 2026-09, ACTIVE 2026-02, ACTIVE 2026-08]` chọn ACTIVE 2026-08; chỉ ENDED → lớp mới nhất; rỗng → `null`.
- [ ] **Step 2:** Chạy test → FAIL.
- [ ] **Step 3:** Cài policy.
- [ ] **Step 4:** Chạy test → PASS.
- [ ] **Step 5:** Cài repository:
  - `findStatsAssignments(classId): Promise<StatsAssignmentRow[]>` - `status != DRAFT`, `deletedAt null`; `title` lấy từ `currentVersion.title`, `kind` từ `currentVersion.kind` (theo cách `AssignmentQueryService` đang đọc).
  - `findStatsSubmissions(studentId, assignmentIds): Promise<StatsSubmissionRow[]>` - `hasComment = comment !== null`.
  - `findStudentClasses(studentId)` - các lớp có `ClassMember` của sinh viên (kể cả đã rời), trả `{id,name,cohort,status,startDate,removedAt}`.
  - `findEvaluation(classId, studentId)` - dùng ở Task 3; tạm trả `null` cho đến khi Task 3 thêm bảng (hoặc làm Task 3 trước Step 5 nếu thuận).
- [ ] **Step 6:** Cài service:
  - `getForLecturer`: `assertOwnedClass`; lấy hồ sơ + membership; 404 `STUDENT_NOT_FOUND` nếu không có hồ sơ hoặc sinh viên chưa từng có `ClassMember` ở lớp này; `canEvaluate = canEvaluate(class.status, membership !== null)`.
  - `getForStudent`: chọn lớp = `classId` (phải thuộc `findStudentClasses`, không thì 404) hoặc `pickDefaultClass`; `canEvaluate: false`; điền `classes`.
- [ ] **Step 7:** Validation (zod theo mẫu `ClassValidation.memberParamsSchema`; `classId` query là uuid tuỳ chọn), controller, route; đăng ký route.
- [ ] **Step 8:** `npm test` → toàn bộ PASS. `npm run build` (hoặc `npx tsc --noEmit`) không lỗi.
- [ ] **Step 9: Kiểm tay** (dev server + token giảng viên/sinh viên có sẵn trong seed): `GET /classes/<id>/students/<sid>/stats` trả đủ trường; giảng viên lớp khác → 404; `GET /me/stats` của sinh viên không có lớp → `data: null`.

### Task 3: Đánh giá chung `StudentEvaluation`

**Files:**
- Modify: `prisma/schema.prisma` (model như spec §5.1; thêm back-relation `studentEvaluations StudentEvaluation[]` vào `Class`, và `@relation("StudentEvaluationStudent")` / `@relation("StudentEvaluationLecturer")` vào `User`)
- Migration: `npx prisma migrate dev --name add-student-evaluations`
- Modify: `StudentStatsRepository.ts` (`findEvaluation`, `upsertEvaluation`)
- Create: `src/modules/classes/service/StudentEvaluationService.ts`
- Modify: `StudentStatsController.ts`, `StudentStatsValidation.ts`, `StudentStatsRoute.ts`
- Modify: `src/modules/classes/constant/ClassConstant.ts` (messages: `EVALUATION_LOCKED: 'Không thể đánh giá vì lớp đã kết thúc hoặc sinh viên không còn trong lớp.'`, `EVALUATION_SAVED: 'Đã lưu đánh giá.'`)

**Interfaces:**
- Consumes: `StudentStatsPolicyService.canEvaluate` (Task 2).
- Produces:
  ```ts
  StudentStatsRepository.findEvaluation(classId, studentId): Promise<{ content: string; updatedAt: Date; lecturer: { username: string } } | null>
  StudentStatsRepository.upsertEvaluation(classId, studentId, lecturerId, content): Promise<same shape>
  StudentEvaluationService.save(classId: string, studentId: string, lecturerId: string, content: string): Promise<{ evaluation: StudentStatsDTO['evaluation']; message: string }>
  ```
  Route: `PUT /classes/:id/students/:studentId/evaluation`, body `{ content }` (zod `.trim().min(1).max(2000)`, message tiếng Việt như `AssignmentValidation.commentSchema`).

- [ ] **Step 1:** Sửa schema, chạy migrate → migration mới được tạo, `npx prisma generate` chạy kèm.
- [ ] **Step 2:** Cài repository + service: `assertOwnedClass` (404 nếu không phải giảng viên lớp); khoá theo `canEvaluate` → `AppError.conflict(EVALUATION_LOCKED, { code: 'MSG-08' })`; upsert theo `@@unique([classId, studentId])`, ghi `lecturerId` = người lưu.
- [ ] **Step 3:** Nối `findEvaluation` vào `StudentStatsService` (cả hai API) → `evaluation = { content, lecturerName: lecturer.username, updatedAt: ISO }`.
- [ ] **Step 4:** `npm test` + `npx tsc --noEmit` → PASS.
- [ ] **Step 5: Kiểm tay:** PUT lần 1 tạo, PUT lần 2 ghi đè (cùng id), lớp `ENDED` → 409 `MSG-08`; `GET .../stats` và `/me/stats` thấy đánh giá.

### Task 4: Mở API kết quả cho giảng viên lớp

**Files:**
- Modify: `src/modules/practice/model/PracticeModel.ts` (`resultSelect`: `assignment.class` thêm `id, status, ownerId, coLecturers: { select: { lecturerId: true } }`; thêm `comment: { select: { content: true, updatedAt: true } }`, `student: { select: { id: true, username: true, studentCode: true } }`)
- Modify: `src/modules/practice/repository/PracticeResultRepository.ts` (thêm `findResultById(id)`)
- Modify: `src/modules/practice/service/PracticeResultService.ts`
- Modify: `src/modules/practice/dto/PracticeResultDTO.ts` (`toResult` nhận `lecturerReview` tuỳ chọn)
- Modify: `src/modules/practice/controller/PracticeResultController.ts` (truyền viewer)
- Modify: kiểu `Practice.ResultRecord` / `Practice.ResultDTO` trong `src/types/`
- Test: `src/modules/practice/service/PracticeResultService.test.ts`

**Interfaces:**
- Produces:
  ```ts
  type ResultViewer = { userId: string; role: UserRole };
  PracticeResultService.getResult(viewer: ResultViewer, submissionId: string): Promise<Practice.ResultDTO>
  PracticeResultService.getHistory(viewer: ResultViewer, submissionId: string)
  PracticeResultService.getPitchChart(viewer: ResultViewer, submissionId: string)
  // getClassRank giữ (studentId, submissionId)
  Practice.ResultDTO.lecturerReview?: { comment: { content: string; updatedAt: string } | null; canComment: boolean; student: { id: string; fullName: string; studentCode: string | null }; classId: string }
  ```
  Thêm dependency tiêm vào constructor: `isActiveMember?: (classId: string, studentId: string) => Promise<boolean>` (mặc định gọi `MemberRepository.findActiveMembership`).
  Quy tắc truy cập (`private findViewable`): chủ bài nộp → được; ngược lại, nếu `viewer.role` là giảng viên **và** bài nộp có `assignment` **và** `ClassAccessService.isClassLecturer(assignment.class, viewer.userId)` → được; còn lại 404 `SUBMISSION_NOT_FOUND`. `lecturerReview` chỉ gắn khi người xem không phải chủ bài nộp; `canComment = class.status === 'ACTIVE' && isActiveMember`.

- [ ] **Step 1: Test thất bại** (thêm vào `PracticeResultService.test.ts`, dùng fake repository như các test hiện có):
  - `getResult lets the class lecturer view and returns lecturerReview`: record của `student`, class `ownerId 'lec'` → `getResult({userId:'lec', role: TEACHER}, id)` có `lecturerReview.canComment === true`, `lecturerReview.student.id === 'student'`.
  - `getResult hides lecturerReview from the owner`: `getResult({userId:'student', role: STUDENT})` → `lecturerReview === undefined`.
  - `getResult rejects a lecturer of another class` → `rejects` với 404.
  - `getResult rejects lecturers on free practice` (record `assignment: null`) → 404.
  - `getResult locks comment when class ended` (`status 'ENDED'`) → `canComment === false`.
  - `getPitchChart allows the class lecturer` → không ném lỗi.
- [ ] **Step 2:** `npx tsx --test src/modules/practice/service/PracticeResultService.test.ts` → FAIL.
- [ ] **Step 3:** Cài như Interfaces; sửa controller truyền `{ userId: request.auth!.user.userId, role: request.auth!.user.role }` cho 3 API. Sửa các test cũ đang gọi `getResult('student', ...)` sang dạng viewer.
- [ ] **Step 4:** `npm test` + `npx tsc --noEmit` → PASS.
- [ ] **Step 5: Kiểm tay:** giảng viên lớp gọi `/practice/submissions/<id>/result|history|pitch-chart` → 200; `/submissions/<id>/audio` → 200 (nếu 403/404 thì nới quyền theo cùng quy tắc trong `VerifiedController.audio`).

---

## FE (`D:\BVC\BVC-FE`)

### Task 5: Types, API, hooks

**Files:**
- Create: `src/features/practice/types/studentStatsTypes.ts` (dùng chung hai phía)
- Modify: `src/features/practice/types/practiceResultTypes.ts` (`PracticeResult.lecturerReview?`)
- Create: `src/features/practice/api/studentStatsApi.ts`
- Create: `src/features/practice/hooks/useMyStats.ts`
- Create: `src/features/classes/hooks/useStudentStats.ts`

**Interfaces:**
- Produces:
  ```ts
  // studentStatsTypes.ts - khớp StudentStatsDTO của BE (Task 2/3)
  export interface StudentStatsAttempt { submissionId: string; attemptNo: number; submittedAt: string; status: SubmissionStatus; accuracy: number | null; hasComment: boolean }
  export interface StudentStatsAssignment { id: string; title: string; kind: AssignmentKind; bestAccuracy: number | null; attemptCount: number; attempts: StudentStatsAttempt[] }
  export interface StudentEvaluation { content: string; lecturerName: string; updatedAt: string }
  export interface StatsClass { id: string; name: string; cohort: string; status: "ACTIVE" | "ENDED" }
  export interface StudentStats { student: {...}; class: StatsClass; evaluation: StudentEvaluation | null; canEvaluate: boolean; classes?: StatsClass[]; assignments: StudentStatsAssignment[] }

  studentStatsApi.getForLecturer(classId, studentId) → GET /classes/:classId/students/:studentId/stats
  studentStatsApi.getMine(classId?: string) → GET /me/stats
  studentStatsApi.saveEvaluation(classId, studentId, content) → PUT .../evaluation, ApiResponse<{ evaluation: StudentEvaluation }>

  useStudentStats(classId, studentId): { stats: StudentStats | null; isLoading; error: string | null; reload }
  useMyStats(classId: string | null): same shape (null = để BE chọn lớp mặc định)
  ```
  Hook theo mẫu `useStudentSubmissions` (`useApiQuery` + `parseApiError`). `SubmissionStatus`/`AssignmentKind` import từ `features/classes/types/teacherAssignmentTypes` nếu RULES cho phép import chéo feature, không thì định nghĩa lại union trong `studentStatsTypes.ts`.

- [ ] **Step 1:** Viết types + api + hooks.
- [ ] **Step 2:** `npm run typecheck` → PASS.

### Task 6: `AccuracyLinesChart`

**Files:**
- Create: `src/features/practice/utils/accuracyLines.ts`
- Create: `src/features/practice/components/AccuracyLinesChart.tsx`
- Test: `src/features/practice/__tests__/accuracyLines.test.ts`, `src/features/practice/__tests__/AccuracyLinesChart.test.tsx`

**Interfaces:**
- Consumes: `StudentStatsAssignment` (Task 5); `ChartView`, `zoomView`, `panView`, `clampView`, `isZoomed` từ `utils/chartView.ts` (dùng trục `t` = số lần nộp, `m` = % độ chính xác); `ChartFullscreen`, `useFullscreenChartHeight`, `ChartTooltip`, `useChartPointer`.
- Produces:
  ```ts
  export interface AccuracySeries { assignmentId: string; title: string; kind: AssignmentKind; color: string; points: Array<{ submissionId: string; attemptNo: number; accuracy: number; submittedAt: string }> }
  export function buildAccuracySeries(assignments: StudentStatsAssignment[]): AccuracySeries[]   // bỏ attempt có accuracy null; bỏ bài không còn điểm nào; màu theo thứ tự
  export function baseAccuracyView(series: AccuracySeries[]): ChartView  // t0 = 0.5, t1 = maxAttemptNo + 0.5, m0 = floor xuống bội 10 của (min - 10) trong [0,50], m1 = 100
  export const SERIES_COLORS: string[]   // 6 biến CSS/token bvc-*; i >= 6 → lặp màu + strokeDasharray "4 3"

  interface AccuracyLinesChartProps {
    assignments: StudentStatsAssignment[];
    selectedAssignmentId: string | null;          // null = tất cả
    onSelectAssignment: (id: string | null) => void;
    onPointClick?: (submissionId: string) => void; // chỉ giảng viên
  }
  ```

- [ ] **Step 1: Test thất bại** (`accuracyLines.test.ts`):
  - `buildAccuracySeries skips null accuracy`: a1 attempts `[70, null, 85]` → points attemptNo `[1, 3]`.
  - `buildAccuracySeries drops assignments without scores`: a2 `attempts: []` → không có series a2.
  - `baseAccuracyView spans attempts and floors min`: max attemptNo 6, min 63 → `{ t0: 0.5, t1: 6.5, m0: 50, m1: 100 }`; min 85 → `m0: 50`; min 25 → `m0: 10`.
- [ ] **Step 2:** `npx vitest run src/features/practice/__tests__/accuracyLines.test.ts` → FAIL.
- [ ] **Step 3:** Cài `accuracyLines.ts`.
- [ ] **Step 4:** Test → PASS.
- [ ] **Step 5: Test component thất bại** (`AccuracyLinesChart.test.tsx`):
  - hiển thị chú thích cho mỗi bài có điểm; bài không có điểm hiện trong ô lọc nhưng `disabled`.
  - chọn một bài trong ô lọc → `onSelectAssignment('a1')` được gọi; khi `selectedAssignmentId='a1'` chỉ có 1 `path` đường (query `[data-series]`).
  - bấm chú thích bài 2 → đường bài 2 bị ẩn (`[data-series="a2"]` không còn).
  - có `onPointClick`: bấm điểm (`[data-point]`) → gọi với `submissionId`.
  - nút "Toàn màn hình" mở dialog (`role="dialog"`/`<dialog open>`).
- [ ] **Step 6:** Test → FAIL.
- [ ] **Step 7:** Cài component: SVG theo kích thước của `PitchContourCard`; thanh công cụ gồm ô lọc ("Tất cả bài" + từng bài), nút −/+ (`zoomView` quanh tâm), "Đặt lại" khi `isZoomed`, nút ⤢ (`ChartFullscreen`); lăn chuột zoom quanh con trỏ, kéo để `panView` (sao chép cách `PitchContourCard` gắn sự kiện). Nhãn trục X "Lần 1, Lần 2…", trục Y "%". Tooltip: tên bài · Lần N · thời gian (`formatAttemptTime`) · %. Trạng thái ẩn đường giữ trong state cục bộ. `aria-label` cho mọi nút.
- [ ] **Step 8:** `npx vitest run src/features/practice/__tests__` + `npm run lint` → PASS.

### Task 7: `StudentStatsPage` (giảng viên)

**Files:**
- Create: `src/features/classes/pages/StudentStatsPage.tsx`
- Create: `src/features/classes/components/BestScoreStrip.tsx`
- Create: `src/features/classes/components/StudentEvaluationForm.tsx`
- Create: `src/features/classes/components/StudentAttemptList.tsx`
- Create: `src/features/classes/hooks/useSaveEvaluation.ts`
- Modify: `src/app/router.tsx` (route `/teacher/classes/:classId/students/:studentId` → `StudentStatsPage`)
- Delete: `src/features/classes/pages/StudentHistoryPage.tsx` (sau khi kiểm không còn import; `StudentSubmissionGrid` vẫn dùng ở `StudentSubmissionsPage`)
- Test: `src/features/classes/__tests__/StudentStatsPage.test.tsx`, `src/features/classes/__tests__/StudentEvaluationForm.test.tsx`

**Interfaces:**
- Consumes: `useStudentStats`, `studentStatsApi.saveEvaluation` (Task 5); `AccuracyLinesChart` (Task 6); `TeacherScreen`, `TeacherPageHeader`, `ListState`, `StatusLabel`, `formatPercent`, `formatVietnamDateTime`, `ASSIGNMENT_KIND_LABELS`, `SUBMISSION_STATUS_LABELS`.
- Produces: path helper `buildTeacherSubmissionPath(classId, studentId, submissionId)` trong `src/features/classes/utils/studentStatsFormat.ts` → `/teacher/classes/${classId}/students/${studentId}/submissions/${submissionId}` (Task 8 dùng).
  ```ts
  BestScoreStrip({ assignments, selectedAssignmentId, onSelect })
  StudentEvaluationForm({ evaluation: StudentEvaluation | null, canEvaluate: boolean, onSave: (content: string) => Promise<ApiFieldError[] | null> })
  StudentAttemptList({ assignments, selectedAssignmentId, onOpen: (submissionId: string) => void })
  useSaveEvaluation(classId, studentId, onSaved: () => void): (content: string) => Promise<ApiFieldError[] | null>  // toast thành công/lỗi, theo mẫu useCommentHandler
  ```

- [ ] **Step 1: Test thất bại** `StudentEvaluationForm.test.tsx`:
  - `canEvaluate=false` → textarea `readonly`, không có nút "Lưu đánh giá", hiện "Không thể đánh giá vì lớp đã kết thúc hoặc sinh viên không còn trong lớp."
  - gửi rỗng → "Đánh giá không được để trống."; 2001 ký tự → "Đánh giá không được vượt quá 2000 ký tự."
  - có `evaluation` → hiện "Sửa lần cuối: {lecturerName}, {ngày}" và nút "Cập nhật đánh giá".
- [ ] **Step 2: Test thất bại** `StudentStatsPage.test.tsx` (mock `studentStatsApi`, theo mẫu test page khác trong `__tests__`):
  - hiện tên sinh viên + "SV001 · {lớp} · {khoá}" ở header.
  - mỗi bài một thẻ điểm cao nhất; bài chưa nộp hiện "-" và "0 lần".
  - bấm thẻ bài 1 → danh sách lịch sử chỉ còn dòng bài 1.
  - danh sách lịch sử mới nhất trước; dòng có nhận xét hiện "Đã nhận xét".
  - bấm một dòng → điều hướng tới `buildTeacherSubmissionPath(...)`.
- [ ] **Step 3:** Chạy → FAIL.
- [ ] **Step 4:** Cài các component + page theo bố cục spec §6.2 (desktop: đánh giá và lịch sử hai cột `lg:grid-cols-2`; mobile xếp dọc). Trạng thái lọc `selectedAssignmentId` nằm ở page, dùng chung cho thẻ điểm, đồ thị, danh sách. `backPath` lấy từ `location.state.from` như trang cũ; truyền `state: { from: currentPath }` khi mở trang chi tiết. Form đánh giá theo mẫu `SubmissionCard` (key theo `evaluation.updatedAt` để không reset khi đang gõ).
- [ ] **Step 5:** `npx vitest run src/features/classes/__tests__` + `npm run typecheck` + `npm run lint` → PASS.

### Task 8: Trang chi tiết lần nộp + khung nhận xét nổi

**Files:**
- Create: `src/features/practice/components/ResultCardsGrid.tsx` (tách lưới thẻ từ `ResultsPage`)
- Modify: `src/features/practice/pages/ResultsPage.tsx` (dùng `ResultCardsGrid`)
- Create: `src/features/classes/pages/TeacherSubmissionResultPage.tsx`
- Create: `src/features/classes/components/FloatingCommentPanel.tsx`
- Modify: `src/app/router.tsx` (route `/teacher/classes/:classId/students/:studentId/submissions/:submissionId`, trong nhóm giảng viên)
- Test: `src/features/classes/__tests__/FloatingCommentPanel.test.tsx`, `src/features/practice/__tests__/ResultCardsGrid.test.tsx`

**Interfaces:**
- Consumes: `practiceResultApi.getResult|getHistory|getPitchChart`, `useResultPart`; `PracticeResult.lecturerReview` (Task 5); `useCommentHandler` / `assignmentsApi` lưu nhận xét (`PUT /submissions/:id/comment`, đã có); `COMMENT_LOCKED_MESSAGE`; `buildTeacherSubmissionPath` (Task 7).
- Produces:
  ```ts
  ResultCardsGrid({ submissionId, data: PracticeResult, chart: ResultPartState<PitchChart>, history?: ResultPartState<ResultHistory>, classRank?: ResultPartState<ClassRank | null>, showSegments: boolean })
  FloatingCommentPanel({ submissionLabel: string, comment: { content: string; updatedAt: string } | null, canComment: boolean, onSave: (content: string) => Promise<ApiFieldError[] | null> })
  ```
  `localStorage` key `bvc.teacherCommentPanel.collapsed` (`"1"`/`"0"`), đọc/ghi trong try/catch.

- [ ] **Step 1: Test thất bại** `ResultCardsGrid.test.tsx`: không truyền `classRank` → không có "Vị trí trong lớp"; `showSegments=false` → không render `SegmentAttemptsCard`. (Mock con nặng nếu cần.)
- [ ] **Step 2: Test thất bại** `FloatingCommentPanel.test.tsx`:
  - gõ "Tốt" → bấm "Thu nhỏ nhận xét" → textarea biến mất, thanh "Nhận xét" hiện → bấm mở lại → textarea vẫn là "Tốt".
  - thu nhỏ ghi `localStorage` `"1"`; render lại khởi đầu thu nhỏ.
  - `localStorage.getItem` ném lỗi → vẫn render mở, không crash.
  - `canComment=false` → `readonly` + `COMMENT_LOCKED_MESSAGE`, không có nút gửi.
  - `onSave` trả `[{ field: 'content', message: 'x' }]` → hiện "x".
- [ ] **Step 3:** Chạy → FAIL.
- [ ] **Step 4:** Tách `ResultCardsGrid` khỏi `ResultsPage` giữ nguyên bố cục lưới hiện tại (thẻ xếp hạng và `SegmentAttemptsCard` chỉ hiện khi được truyền/bật). `ResultsPage` truyền đủ để giao diện sinh viên không đổi.
- [ ] **Step 5:** Cài `FloatingCommentPanel`: `fixed` - desktop `bottom-6 right-8 w-[380px]` thẻ trắng có viền + bóng; mobile `inset-x-0 bottom-0`, mở ra `max-h-[60dvh]` cuộn được. Form luôn mount (thu nhỏ chỉ ẩn bằng CSS/`hidden`) để giữ chữ. Form RHF + zod giống `SubmissionCard` (2000 ký tự, đếm ký tự). Nút "Gửi nhận xét"/"Cập nhật nhận xét".
- [ ] **Step 6:** Cài `TeacherSubmissionResultPage`: `TeacherScreen` + `TeacherPageHeader` (title = tên sinh viên từ `lecturerReview.student.fullName`, subtitle = "{bài} · Lần {attemptNo} · {thời gian}", back = `location.state.from` hoặc `/teacher/classes/:classId/students/:studentId`). `COMPLETED` → `ResultCardsGrid` với `history`, không `classRank`, `showSegments=false`. Chưa `COMPLETED` → thẻ trạng thái (dùng `SUBMISSION_STATUS_LABELS`) + `AuthenticatedAudio` endpoint `/submissions/:id/audio`. Không redirect sang màn xử lý. Thêm `pb-[120px]` cho vùng nội dung. `FloatingCommentPanel` luôn hiện khi có `lecturerReview`; lưu xong gọi `reload` của result nhưng giữ panel mount (key theo `submissionId`, không theo `updatedAt`).
- [ ] **Step 7:** `npx vitest run` (toàn bộ) + `npm run typecheck` + `npm run lint` → PASS.
- [ ] **Step 8: Kiểm tay trên trình duyệt** (`npm run dev`, tài khoản giảng viên seed): Lớp → Thành viên → bấm sinh viên → bấm điểm trên đồ thị → trang chi tiết; cuộn - khung nhận xét luôn hiện; thu nhỏ/mở; gửi nhận xét → toast, chữ còn; quay lại trang thống kê → dòng đó "Đã nhận xét". Kiểm thêm ở bề rộng 375px. Kiểm trang Kết quả của sinh viên không đổi.

### Task 9: Phía sinh viên trên `SubmissionHistoryPage`

**Files:**
- Create: `src/features/practice/components/MyStatsSection.tsx`
- Modify: `src/features/practice/pages/SubmissionHistoryPage.tsx` (chèn `<MyStatsSection />` ngay dưới `SubmissionPageTitle`, trên thanh lọc)
- Test: `src/features/practice/__tests__/MyStatsSection.test.tsx`

**Interfaces:**
- Consumes: `useMyStats` (Task 5), `AccuracyLinesChart` (Task 6, không truyền `onPointClick`).
- Produces: `MyStatsSection()` - tự quản lớp đang chọn (`useState<string | null>(null)`).

- [ ] **Step 1: Test thất bại:**
  - API trả `null` → section không render gì.
  - có `evaluation` → thẻ "Đánh giá của giảng viên" hiện nội dung, tên giảng viên, ngày; `evaluation=null` → không có thẻ.
  - không bài nào có điểm → không có đồ thị.
  - `classes` có 2 lớp → có ô chọn lớp; đổi lớp → gọi `getMine('<id mới>')`.
  - API lỗi → hiện thông báo lỗi nhỏ + "Thử lại", không chặn phần còn lại của trang.
- [ ] **Step 2:** Chạy → FAIL.
- [ ] **Step 3:** Cài section (thẻ `rounded-bvc-xl border border-bvc-border bg-white p-4 md:p-5.5` như các thẻ practice).
- [ ] **Step 4:** `npx vitest run` + `npm run typecheck` + `npm run lint` + `npm run build` → PASS.
- [ ] **Step 5: Kiểm tay** bằng tài khoản sinh viên seed: `/practice/submissions` thấy đánh giá + đồ thị; lọc/zoom/toàn màn hình chạy; phần lịch sử bên dưới vẫn như cũ.
