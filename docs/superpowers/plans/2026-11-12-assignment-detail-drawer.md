# Assignment Detail Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the lecturer assignment detail page with a right-hand drawer on `/teacher/assignments` that has a class mode (one assignment, one class) and a sheet mode (all current-semester copies of one sheet), backed by new practice-stats data from the BE.

**Architecture:** BE: one pure calculator turns counted submissions + active members into stats; `GET /assignments/:id` is extended for class mode, a new `GET /assignments/sheet-groups/:sheetMusicId` serves sheet mode, and the overview gains per-sheet stats so list rows and the drawer show identical numbers. FE: `AssignmentListPage` owns the drawer; the URL decides the mode (`/teacher/assignments/:assignmentId` → class, `?sheet=<id>` → sheet).

**Tech Stack:** BE Node/Express/Prisma/zod, unit tests `node:test` via `tsx --test`, integration tests Vitest + supertest. FE React + react-router + Tailwind v4 + Base UI kit, Vitest + Testing Library.

**Spec:** `BVC-FE/docs/superpowers/specs/2026-11-12-assignment-detail-drawer-design.md`

## Global Constraints

- No schema change, no migration file, never `npx prisma db push`.
- BE: follow `BVC-BE/.agents/rules/coding-convention.md` — one exported class per file, layer folders, PascalCase + layer suffix. All messages Vietnamese with full diacritics, kept in `AssignmentConstant`.
- FE: follow `BVC-FE/docs/RULES.md` — Vietnamese UI strings in `features/classes/utils/`, reuse `bvc-*` tokens (no new colors), reuse kit primitives (`ui/sheet.tsx` for the drawer).
- **No commits unless the user asks** (BE CLAUDE.md). Each task ends with a checkpoint instead of a commit. If the user asks to commit: never add a Claude co-author trailer or "Generated with Claude Code".
- Work on a new branch `feature/assignment-detail-drawer` created from `uat` in both `BVC-BE` and `BVC-FE`.
- Practice = submission with status not in `AssignmentConstant.uncountedSubmissionStatuses` (REJECTED, FAILED). 7-day series in UTC+7 (offset 420 min).
- Sheet-mode scope = PUBLISHED + CLOSED copies, in the lecturer's classes (owner or co-lecturer, `ClassModel.lecturerClassFilter`) whose `cohort` = current semester name. DRAFT copies are listed but excluded from stats, `byClass` and the class count.
- "Ngưỡng đạt" = `assignment.minAccuracy ?? gradingSettings.minAccuracy`.

## Review Focus

1. A student removed from the class after practicing — counts toward "Tổng lượt luyện tập" (matches the list) but not toward "Sinh viên đã tập". (Task 1 test.)
2. A submission at 17:30 UTC lands on the next Vietnam day in the 7-day chart. (Task 1 test.)
3. A sheet whose only copies are DRAFT — the drawer opens with zero stats and the drafts listed, not 404. (Task 3 test.)
4. Opening `/teacher/assignments/:id` directly when the overview has an `emptyReason` (no current semester) — the drawer still opens over the empty notice. (Task 7 test.)
5. A class-mode assignment without sheet music — media tab shows one empty notice, no crash. (Task 6 test.)

---

### Task 1 (BE): Practice stats calculator

**Files:**
- Create: `BVC-BE/src/modules/assignments/service/AssignmentPracticeStatsCalculator.ts`
- Create: `BVC-BE/src/modules/assignments/service/AssignmentPracticeStatsCalculator.test.ts`
- Modify: `BVC-BE/src/types/AssignmentTypes.d.ts` (add types below)

**Interfaces:**
- Consumes: `AdminStatsPolicyService.buildDailySeries(dates: Date[], days: number, now: Date, offsetMinutes: number): Backend.DailyCount[]` from `modules/platform/service/AdminStatsPolicyService.ts`.
- Produces (types in `AssignmentTypes.d.ts`):
  ```ts
  interface CountedPractice { assignmentId: string; studentId: string; createdAt: Date }
  interface PracticeStatsDTO { totalPractices: number; practicedStudents: number; memberCount: number; averagePerStudent: number; last7Days: DailyCount[] }
  interface ClassPracticeDTO { classId: string; className: string; practicedStudents: number; memberCount: number }
  interface PracticeStatsInput {
    practices: CountedPractice[];                       // already filtered to counted statuses
    assignmentClassIds: Map<string, string>;            // assignmentId -> classId, in-scope assignments only
    membersByClass: Map<string, Set<string>>;           // classId -> active member ids, in-scope classes only
    now: Date;
  }
  ```
  - `static summarize(input: Backend.PracticeStatsInput): Backend.PracticeStatsDTO`
  - `static byClass(input: Backend.PracticeStatsInput, classNames: Map<string, string>): Backend.ClassPracticeDTO[]` (order of `classNames` iteration)

Rules: practices whose `assignmentId` is not in `assignmentClassIds` are ignored. `totalPractices` = all remaining practices. `practicedStudents` = distinct `(classId, studentId)` pairs where the student is in `membersByClass.get(classId)`. `memberCount` = sum of set sizes. `averagePerStudent` = `Math.round(total / practiced * 10) / 10`, 0 when practiced is 0. `last7Days` = `buildDailySeries(dates, 7, now, 420)`. Add `static readonly utcOffsetMinutes = 420` and `static readonly seriesDays = 7` to `AssignmentConstant`.

- [ ] **Step 1: Write failing tests** (`node:test` + `assert/strict`, style of `AssignmentAssignPolicyService.test.ts`):
  - `summarize counts every practice but only members as practiced students` — class c1 members {s1,s2}; practices: s1×2, s3 (not member)×1 on a1→c1 ⇒ `{ totalPractices: 3, practicedStudents: 1, memberCount: 2, averagePerStudent: 3 }`.
  - `counts a student once per class across several copies` — a1,a2 both in c1, s1 practices on both ⇒ `practicedStudents: 1`; same student in c2 via a3 ⇒ `practicedStudents: 2`, `memberCount` = 3 when c1={s1,s2}, c2={s1}.
  - `ignores practices of out-of-scope assignments` — practice on `aX` not in map ⇒ total 0.
  - `average is rounded to one decimal and 0 with no practice` — 7 practices / 3 students ⇒ `2.3`; empty ⇒ `0`.
  - `last7Days has 7 zero-filled days ending today in UTC+7` — `now = 2026-11-12T10:00:00Z`, practice at `2026-11-11T17:30:00Z` ⇒ entry `{ date: '2026-11-12', count: 1 }`, first entry date `'2026-11-06'`, length 7.
  - `byClass returns one row per class` — expected `[{ classId: 'c1', className: 'TRD301', practicedStudents: 1, memberCount: 2 }, …]`.
- [ ] **Step 2:** Run `cd BVC-BE && npx tsx --test src/modules/assignments/service/AssignmentPracticeStatsCalculator.test.ts` — expect FAIL (module not found).
- [ ] **Step 3:** Implement the class and types.
- [ ] **Step 4:** Re-run — expect all PASS. Run `npm run typecheck` (or `npx tsc --noEmit`) — no errors.
- [ ] **Step 5: Checkpoint** (no commit).

### Task 2 (BE): Class mode — extend `GET /assignments/:id`

**Files:**
- Modify: `BVC-BE/src/modules/assignments/model/AssignmentModel.ts` — add `minAccuracy: true`, `createdBy: { select: { id: true, username: true } }` to `assignmentSelect`.
- Modify: `BVC-BE/src/types/AssignmentTypes.d.ts` — `AssignmentRecord` gains `minAccuracy: number | null; createdBy: { id: string; username: string } | null`; new `MediaFileDTO`, `AssignmentMediaDTO`; `AssignmentDetailDTO` gains fields below.
- Modify: `BVC-BE/src/modules/assignments/repository/SubmissionRepository.ts` — add `findCountedPractices`.
- Modify: `BVC-BE/src/modules/assignments/repository/AssignmentRepository.ts` — add `findSheetMedia`.
- Modify: `BVC-BE/src/modules/assignments/dto/AssignmentDTO.ts` — add `toMediaDTO`.
- Modify: `BVC-BE/src/modules/assignments/service/AssignmentQueryService.ts:90-110` (`getAssignmentDetail`).
- Test: `BVC-BE/tests/integration/assignmentQueries.test.ts`

**Interfaces:**
- Consumes: Task 1 calculator.
- Produces:
  ```ts
  interface MediaFileDTO { url: string | null; originalName: string; mimeType: string; sizeBytes: number; durationSec: number | null; pageCount: number | null }
  interface AssignmentMediaDTO { sheet: MediaFileDTO | null; referenceAudio: MediaFileDTO | null; tutorialVideo: MediaFileDTO | null }
  interface AssignmentDetailDTO extends AssignmentBaseDTO {
    students: AssignmentStudentDTO[];
    practiceStats: PracticeStatsDTO;
    minAccuracy: number;
    createdBy: { id: string; fullName: string } | null;
    media: AssignmentMediaDTO | null;   // null when the assignment has no sheet music
  }
  ```
  - `SubmissionRepository.findCountedPractices(assignmentIds: string[]): Promise<Backend.CountedPractice[]>` (empty input → `[]`, select `assignmentId, studentId, createdAt`, status filter as `countPracticesByAssignment`).
  - `AssignmentRepository.findSheetMedia(sheetMusicId: string): Promise<{ sheetFile; referenceAudio; tutorialVideo } | null>` selecting `storageKey, originalName, mimeType, sizeBytes, durationSec, pageCount` of each `MediaFile`.
  - `AssignmentDTO.toMediaDTO(media): Promise<Backend.AssignmentMediaDTO>` — URL via `MusicLibraryDTO.toReadUrl` (reuse, do not duplicate storage logic).
  - Note: the spec places media under `sheetMusic.media`; this plan puts it top-level `media` (same content, simpler FE typing). Update the spec line 5.1 accordingly.

- [ ] **Step 1: Write failing integration test** `returns practice stats, threshold, creator and media for one assignment`: class with members Anh, Hân; assignment with sheet music (`TestDatabase.createSheetMusic`); Anh has 2 COMPLETED + 1 REJECTED submission, a removed/non-member student 1 COMPLETED. Expect `practiceStats` `{ totalPractices: 3, practicedStudents: 1, memberCount: 2, averagePerStudent: 3 }`, `last7Days.length === 7`, `minAccuracy` equals the grading setting, `createdBy.id === lecturer.id`, `media.sheet` not null. Second case `media is null without sheet music`.
- [ ] **Step 2:** Run `cd BVC-BE && npx vitest run tests/integration/assignmentQueries.test.ts` (needs the test DB from `docker-compose.dev.yml`) — expect FAIL.
- [ ] **Step 3:** Implement. In `getAssignmentDetail`, build `PracticeStatsInput` with `assignmentClassIds = new Map([[record.id, record.classId]])` and members from the already-loaded `findActiveMembers`; `minAccuracy = record.minAccuracy ?? settings.minAccuracy`; `createdBy` maps `username` → `fullName`.
- [ ] **Step 4:** Re-run the integration file — PASS (existing tests in the file still pass). `npx tsc --noEmit` clean.
- [ ] **Step 5: Checkpoint.**

### Task 3 (BE): Sheet mode — `GET /assignments/sheet-groups/:sheetMusicId`

**Files:**
- Modify: `BVC-BE/src/modules/assignments/validation/AssignmentValidation.ts` — `sheetGroupSchema` (`params: { sheetMusicId: z.string().uuid() }`, empty query).
- Modify: `BVC-BE/src/modules/assignments/route/AssignmentRoute.ts` — register **before** `'/:id'`.
- Modify: `BVC-BE/src/modules/assignments/controller/AssignmentController.ts` — `getSheetGroup`.
- Modify: `BVC-BE/src/modules/assignments/service/AssignmentQueryService.ts` — `getSheetGroup`.
- Modify: `BVC-BE/src/modules/assignments/constant/AssignmentConstant.ts` — message `SHEET_GROUP_NOT_FOUND: 'Không tìm thấy bài tập dùng sheet nhạc này trong học kỳ hiện tại.'`
- Modify: `BVC-BE/src/types/AssignmentTypes.d.ts`
- Test: `BVC-BE/tests/integration/assignmentQueries.test.ts`

**Interfaces:**
- Consumes: Tasks 1–2 (`findCountedPractices`, `findSheetMedia`, `toMediaDTO`, calculator), `AssignmentRepository.findClassesWithAssignments(lecturerId, cohort)`, `SemesterPolicyService.findCurrent`, `SystemConfigService.getSemesters`, `GradingSettingsService.getGradingSettings`.
- Produces:
  ```ts
  interface SheetGroupAssignmentDTO extends OverviewAssignmentDTO {
    className: string; maxSubmissions: number | null; effectiveBpm: number | null; minAccuracy: number;
    publishedAt: string | null; createdBy: { id: string; fullName: string } | null;
  }
  interface SheetGroupDetailDTO {
    semester: Semester;
    sheetMusic: AssignmentSheetMusicDTO;
    media: AssignmentMediaDTO;
    assignments: SheetGroupAssignmentDTO[];   // all non-deleted copies incl. DRAFT, ordered by class name
    practiceStats: PracticeStatsDTO;          // PUBLISHED + CLOSED copies only
    byClass: ClassPracticeDTO[];              // classes having ≥1 PUBLISHED/CLOSED copy
  }
  ```
  - `AssignmentQueryService.getSheetGroup(lecturerId: string, sheetMusicId: string, now: Date = new Date()): Promise<Backend.SheetGroupDetailDTO>` — `AppError.notFound(messages.SHEET_GROUP_NOT_FOUND)` when no current semester or no copy.
  - Copies' per-assignment `practiceCount/submittedCount/memberCount` computed as in `getOverview` (extract a shared private helper rather than duplicating).

- [ ] **Step 1: Write failing integration tests:**
  - `aggregates copies of one sheet across current-semester classes` — two current-semester classes (cohort = current semester name via `TestDatabase.resetSemesters` with a semester covering today), one SOLO copy each; class 3 in another cohort with a copy ⇒ excluded; another lecturer's class ⇒ excluded. Expect `assignments.length === 2`, `byClass.length === 2`, `practiceStats` totals match seeded submissions.
  - `lists draft copies but leaves them out of stats` — only copy is DRAFT ⇒ 200, `assignments[0].status === 'DRAFT'`, `practiceStats.totalPractices === 0`, `memberCount === 0`, `byClass` empty.
  - `returns 404 when no copy exists` and `returns 403/401 for a student token` (match existing auth test style).
- [ ] **Step 2:** Run the integration file — FAIL.
- [ ] **Step 3:** Implement validation, route, controller, service.
- [ ] **Step 4:** Run — PASS; `npx tsc --noEmit` clean; `npm test` (all BE unit tests) PASS.
- [ ] **Step 5: Checkpoint.**

### Task 4 (BE): Overview `sheetStats`

**Files:**
- Modify: `BVC-BE/src/modules/assignments/service/AssignmentQueryService.ts` (`getOverview`), `BVC-BE/src/types/AssignmentTypes.d.ts`
- Test: `BVC-BE/tests/integration/assignmentQueries.test.ts`

**Interfaces:**
- Produces: `AssignmentOverviewDTO.sheetStats: Array<{ sheetMusicId: string; practicedStudents: number; memberCount: number; practiceCount: number }>` — one entry per sheet among PUBLISHED/CLOSED copies, using the Task 1 calculator with the same scope as Task 3 (so for the same sheet, `practiceCount === practiceStats.totalPractices` and `practicedStudents/memberCount` equal Task 3's). Empty array when `emptyReason` is set.

- [ ] **Step 1: Failing test** `overview sheetStats matches the sheet group detail` — seed as Task 3 case 1 plus a BONUS copy in class 1 (same sheet) where the same student practiced; assert overview entry equals `{ practiceCount: X, practicedStudents: Y, memberCount: Z }` from `GET /assignments/sheet-groups/:id`.
- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Implement (one `findCountedPractices` call over all overview assignment ids; reuse `findActiveMembers` result).
- [ ] **Step 4:** Run integration file + `npm test` — PASS.
- [ ] **Step 5: Checkpoint.**

### Task 5 (FE): Types, API, hooks, list-row numbers

**Files:**
- Modify: `BVC-FE/src/features/classes/types/teacherAssignmentTypes.ts`
- Modify: `BVC-FE/src/features/classes/api/assignmentsApi.ts`
- Create: `BVC-FE/src/features/classes/hooks/useSheetGroupDetail.ts`
- Modify: `BVC-FE/src/features/classes/utils/assignmentOverviewFormat.ts` (`groupBySheet`)
- Modify: `BVC-FE/src/features/classes/components/AssignmentList.tsx` (pass `overview.sheetStats`)
- Test: `BVC-FE/src/features/classes/__tests__/assignmentOverviewFormat.test.ts`

**Interfaces:**
- Produces (FE types mirror Tasks 2–4 DTOs, camelCase, same field names): `MediaFileInfo`, `AssignmentMedia`, `PracticeStats` (`last7Days: { date: string; count: number }[]`), `ClassPractice`, `SheetGroupAssignment`, `SheetGroupDetail`, `SheetStat`; `AssignmentDetail` gains `practiceStats`, `minAccuracy`, `createdBy`, `media`; `AssignmentOverview` gains `sheetStats: SheetStat[]`.
- `assignmentsApi.getSheetGroup(sheetMusicId: string)` → `GET /assignments/sheet-groups/${sheetMusicId}`.
- `useSheetGroupDetail(sheetMusicId: string | undefined): { group: SheetGroupDetail | undefined; isLoading: boolean; error: string | null; reload: () => void }` — same shape/pattern as `useTeacherAssignmentDetail`, cache key `sheet-group:<id>`.
- `groupBySheet(classes: OverviewClass[], sheetStats: SheetStat[]): SheetGroup[]` — `submittedCount` renamed to `practicedStudents`; numbers come from `sheetStats` (0 when missing); grouping/kinds/classNames unchanged.

- [ ] **Step 1:** Update `assignmentOverviewFormat.test.ts`: `groupBySheet takes counts from sheetStats` (two copies in one class + one in another; stats `{ practicedStudents: 3, memberCount: 40, practiceCount: 12 }` ⇒ group has exactly those values) and `defaults to zero without a stat`.
- [ ] **Step 2:** `cd BVC-FE && npx vitest run src/features/classes/__tests__/assignmentOverviewFormat.test.ts` — FAIL.
- [ ] **Step 3:** Implement; update `AssignmentSheetTable` to read `practicedStudents`; fix test fixtures that build `AssignmentOverview` / `AssignmentDetail` (add the new fields).
- [ ] **Step 4:** Run the file, then `npm run typecheck` — PASS/clean.
- [ ] **Step 5: Checkpoint.**

### Task 6 (FE): Drawer tab components

**Files:**
- Create: `BVC-FE/src/features/classes/components/AssignmentPracticeStats.tsx`
- Create: `BVC-FE/src/features/classes/components/AssignmentMediaTab.tsx`
- Create: `BVC-FE/src/features/classes/components/AssignmentInfoTab.tsx`
- Create: `BVC-FE/src/features/classes/utils/assignmentDetailFormat.ts` (all Vietnamese labels + formatters)
- Test: `BVC-FE/src/features/classes/__tests__/AssignmentDetailTabs.test.tsx`

**Interfaces:**
- Consumes: Task 5 types; `AssignmentStudentRow`, `StatCard`, `ASSIGNMENT_KIND_LABELS`.
- Produces:
  - `AssignmentPracticeStats({ stats: PracticeStats; byClass?: ClassPractice[]; children?: ReactNode })` — 3 stat cards (`Tổng lượt luyện tập`, `Sinh viên đã tập` as `"<practiced> / <members>"`, `Lượt trung bình / SV` with comma decimal e.g. `2,3`), 7-day CSS bar chart (label `dd/mm`), right column "Lượt luyện tập 7 ngày gần nhất"; left column is "Sinh viên đã tập theo lớp" when `byClass` is given, otherwise `children` (class mode passes the student list).
  - `AssignmentMediaTab({ media: AssignmentMedia | null })` — sections "Sheet nhạc được gán", "Audio mẫu", "Video hướng dẫn"; image mime → `<img>`, PDF → file card with "Mở" link (`target="_blank"`), `<audio controls>` / `<video controls>` from `url`; empty copy exactly `Bài tập này chưa có audio mẫu.` / `Bài tập này chưa có video hướng dẫn.`; `media === null` → single notice `Bài tập này chưa gắn sheet nhạc.`
  - `AssignmentInfoTab(props: { mode: "class"; assignment: AssignmentDetail } | { mode: "sheet"; group: SheetGroupDetail })` — per spec 4.4. Class "Cấu hình": Tempo `"<n> BPM"`/`—`, Ngưỡng đạt `"≥ <n>%"`, Nộp tối đa `<n>`/`Không giới hạn`, Phiên bản `v<n>`. Sheet: one block per `assignmentGroupKey` group with "Giao cho:" chips; when copies differ in tempo/max submissions/threshold append `(khác nhau giữa các lớp)`. Description fallback `Chưa có mô tả.`

- [ ] **Step 1: Failing tests:** stats cards render `3`, `1 / 2`, `2,3`; 7 bars; `byClass` row shows `TRD301` and `12 / 32 SV`; media `null` shows the no-sheet notice; missing audio shows its empty copy; class info shows `Không giới hạn` for `maxSubmissions: null`; sheet info shows `(khác nhau giữa các lớp)` when two copies have different `effectiveBpm`.
- [ ] **Step 2:** `npx vitest run src/features/classes/__tests__/AssignmentDetailTabs.test.tsx` — FAIL.
- [ ] **Step 3:** Implement, matching the mockup (`UI/AssignmentList.dc.html` lines 197–560) with `bvc-*` tokens.
- [ ] **Step 4:** Run — PASS; `npm run lint` clean for the new files.
- [ ] **Step 5: Checkpoint.**

### Task 7 (FE): Drawer shell, routing, modes, actions; remove the old page

**Files:**
- Create: `BVC-FE/src/features/classes/components/AssignmentDetailDrawer.tsx`
- Modify: `BVC-FE/src/features/classes/pages/AssignmentListPage.tsx`, `components/AssignmentList.tsx`
- Modify: `BVC-FE/src/features/classes/components/AssignmentSheetTable.tsx` (row link)
- Modify: `BVC-FE/src/features/classes/components/AssignAssignmentsDialog.tsx` (optional `initialSelectedKeys?: string[]`)
- Modify: `BVC-FE/src/app/router.tsx:193` (`/teacher/assignments/:assignmentId` → `AssignmentListPage`)
- Delete: `pages/TeacherAssignmentDetailPage.tsx`, `__tests__/TeacherAssignmentDetail.test.tsx`; `components/AssignmentInfoPanel.tsx` only if grep shows no other user (move its action buttons into the drawer footer).
- Test: Create `BVC-FE/src/features/classes/__tests__/AssignmentDetailDrawer.test.tsx`; update `AssignmentList.test.tsx`, `AssignmentSheetTable.test.tsx` (sheet row href now `/teacher/assignments?tab=sheet&sheet=<sheetMusicId>`), `AssignAssignmentsDialog.test.tsx`.

**Interfaces:**
- Consumes: Tasks 5–6, `useTeacherAssignmentDetail`, `useAssignmentActions`, `ConfirmDialog`, `SheetPopup` from `ui/sheet.tsx`.
- Produces:
  - `AssignmentDetailDrawer(props: { target: { mode: "class"; assignmentId: string } | { mode: "sheet"; sheetMusicId: string } | null; onClose: () => void; onChanged: () => void; onAssign: (groupKeys: string[]) => void })`.
  - URL contract: list tab from `?tab=sheet` (default class); `ASSIGNMENT_SHEET_PARAM = "sheet"` and `ASSIGNMENT_TAB_PARAM = "tab"` exported from `utils/teacherAssignmentFormat.ts`. Close → `navigate({ pathname: "/teacher/assignments", search: <current params minus "sheet"> })`.
  - Header meta, tabs order/default and footers exactly per spec 4.2/4.6: class mode footer = Sửa link + Đăng/Đóng/Mở lại + Xóa (existing confirm copy from the old page); sheet mode footer = only "Gán bài này cho lớp khác" (no "Chỉnh sửa").
  - After delete: toast, close drawer, `onChanged()` (list reload). After status change: drawer `reload()` + `onChanged()`.

- [ ] **Step 1: Failing tests** (`MemoryRouter` + `Routes` with both `/teacher/assignments` and `/teacher/assignments/:assignmentId`, APIs mocked as in existing tests):
  - `opens class mode from /teacher/assignments/:id` — student row link `/teacher/assignments/a1/students/s1` and buttons "Sửa", "Đóng", "Xóa" present; no "Gán bài này cho lớp khác".
  - `opens sheet mode from ?sheet=` — "Sinh viên đã tập theo lớp" visible, "Gán bài này cho lớp khác" present, no "Chỉnh sửa"/"Xóa".
  - `closing returns to the list and keeps the sheet tab` — open `?tab=sheet&sheet=m1`, click "Đóng chi tiết" ⇒ location `/teacher/assignments?tab=sheet`, sheet tab selected.
  - `deleting closes the drawer and reloads the list` — confirm delete ⇒ drawer gone, overview fetched twice.
  - `opens over the semester empty notice` — overview with `emptyReason: "NO_CURRENT_SEMESTER"` + route `/teacher/assignments/a1` ⇒ drawer title visible.
  - `assign from sheet mode preselects the sheet's groups` — click "Gán bài này cho lớp khác" ⇒ dialog shows those items checked.
- [ ] **Step 2:** `npx vitest run src/features/classes/__tests__/AssignmentDetailDrawer.test.tsx` — FAIL.
- [ ] **Step 3:** Implement; delete the old page/test; grep for `TeacherAssignmentDetailPage` and `AssignmentInfoPanel` — no dangling imports.
- [ ] **Step 4:** `npm test`, `npm run typecheck`, `npm run lint` — all PASS/clean.
- [ ] **Step 5: Manual check** with BE running: from the "Theo lớp" tab, the "Theo bài tập chung" tab, the class page link (`?class=`), and right after creating an assignment; compare one sheet row's numbers with its drawer. Drawer is full width below `lg`.
- [ ] **Step 6: Checkpoint** — report to the user; commit only if asked.
