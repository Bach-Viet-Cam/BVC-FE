# Assignment detail drawer — design spec

Date: 2026-11-12 · Scope: FE `features/classes` + BE `modules/assignments` · Reference: `UI/AssignmentList.dc.html` (section "Ngăn chi tiết bài tập", lines ~175–560)

## 1. Intent

The lecturer assignment detail is today a separate page (`TeacherAssignmentDetailPage`, `/teacher/assignments/:assignmentId`) with assignment info on the left and the student list on the right. The mockup replaces it with a **right-hand drawer over the assignment list** with three tabs: "Thống kê luyện tập", "Sheet & media", "Thông tin & cấu hình".

Assignments are per-class clones (previous spec D1): "the same assignment" in three classes is three `Assignment` rows sharing one `sheetMusicId`. The lecturer wants two ways to look at it:

- **Class mode** — one assignment in one class: that class's stats, plus the tools the current page already has (student list → submissions/comment page, publish/close/reopen/delete/edit). Used whenever the lecturer comes from a class context.
- **Sheet mode** — every assignment that uses one sheet, across all the lecturer's classes in the **current semester**: aggregated stats, the per-class breakdown, and exactly the mockup's layout and footer. Used only from the "Theo bài tập chung" tab of `/teacher/assignments`.

## 2. Goals, non-goals, anti-goals

Goals
- The detail page becomes a drawer matching the mockup visually (mapped to existing `bvc-*` tokens, no new colors).
- Both modes have real data: total practices, students who practiced, average practices per student, per-class breakdown (sheet mode), practices over the last 7 days.
- Sheet & media tab shows the real sheet file, reference audio and tutorial video of the assigned sheet music.

Non-goals
- No schema change / migration.
- No grading rubric, metronome, tolerance, recording length or roadmap week (these exist in the mockup but not in the M03 data model — see 4.4).
- No editing across classes in one action.

Anti-goals (a failure even if it "works")
- A lecturer opening the drawer from a class context sees other classes' numbers.
- Sheet mode counting classes outside the current semester or classes the lecturer does not teach.
- Losing access to the per-student submissions page or to close/delete actions in class mode.

## 3. Decisions (agreed with the user)

| #  | Decision |
| -- | -------- |
| U1 | Detail becomes a drawer on `/teacher/assignments`; the separate page layout goes away. |
| U2 | Row in tab **"Theo lớp"** → **class mode**. Row in tab **"Theo bài tập chung"** → **sheet mode**. All-class stats appear **only** in sheet mode. |
| U3 | Sheet mode aggregates every assignment sharing the `sheetMusicId`, in all the lecturer's classes of the current semester. |
| U4 | Class mode keeps the current student list and action buttons (Đăng / Đóng / Mở lại / Xóa / Sửa). Sheet mode uses the mockup footer only: "Chỉnh sửa" + "Gán bài này cho lớp khác". |
| U5 | Coming from a class (`?class=<id>` deep link from the class page), right after creating an assignment, or via an old `/teacher/assignments/:id` link → class mode. |
| U6 | Both FE and BE are in scope. |
| U7 | Sheet mode has no "Chỉnh sửa" button for now (each class has its own copy; editing stays per class in class mode). |

## 4. Frontend

### 4.1 Routing and drawer state (builder's call made here)

- `/teacher/assignments/:assignmentId` renders `AssignmentListPage` with the drawer open in **class mode** for that assignment. This keeps every existing link working unchanged: create dialog redirect, `AssignmentFormPage` back path, `StudentSubmissionsPage` back button, tests.
- Sheet mode: `/teacher/assignments?sheet=<sheetMusicId>` (list page, "Theo bài tập chung" tab active, drawer open).
- Closing the drawer (X, backdrop, Esc) navigates back to `/teacher/assignments`, keeping `?class=` and the active tab. The list does not refetch on open/close.
- An assignment outside the current semester (old link, past class) still opens in class mode over the current list; the drawer works on its own data and does not need a matching list row.
- The active list tab must survive open/close; persist it in the URL (`?tab=sheet`) if needed.
- `TeacherAssignmentDetailPage` is removed; its logic (actions, confirm dialog) moves into the drawer's class-mode footer.
- Row links: `AssignmentClassSection` rows → `/teacher/assignments/:id` (unchanged); `AssignmentSheetTable` rows → `?sheet=<sheetMusicId>` (changed from "first assignment").

### 4.2 Drawer shell

- Backdrop `rgba(18,63,51,0.32)` over the list; panel right-aligned, `1040px` wide on desktop, full width below `lg`. Header, scrolling body, sticky footer as in the mockup.
- Header: overline "Chi tiết bài tập"; title; meta line.
  - Class mode: assignment title; `kind · class name · status dot+label`.
  - Sheet mode: sheet title (`pieceTitle || name`); `kinds in group · n bài tập · n lớp`. No status dot (statuses differ per class).
- Tabs in mockup order: Thống kê luyện tập (default) · Sheet & media · Thông tin & cấu hình. Accessible tablist (shared tabs component if one fits).
- Loading / error inside the drawer use the existing `ListState`.

### 4.3 Tab "Thống kê luyện tập"

- Three stat cards: **Tổng lượt luyện tập**, **Sinh viên đã tập** (`practiced / members`), **Lượt trung bình / SV**.
- **Lượt luyện tập 7 ngày gần nhất**: bar chart of 7 calendar days ending today, value above each bar, day label below (mockup style; simple CSS bars, no chart library).
- Sheet mode only: **Sinh viên đã tập theo lớp** — one row per class: name, `practiced / members SV`, percentage, progress bar. Layout: two columns (1.25fr / 1fr) as in the mockup.
- Class mode only: in place of the per-class list, the existing **student list** (`AssignmentStudentRow`, links to `/teacher/assignments/:id/students/:studentId`), with the header "Sinh viên (n)" and the existing empty message.

### 4.4 Tab "Thông tin & cấu hình"

Show only fields the system really has; leave out mockup fields with no data (week, recording length, metronome, tolerance, rubric).

- **Thông tin chung** grid (3 columns): Loại, Trạng thái, Lớp (class mode) / Số lớp (sheet mode), Ngày đăng, Cập nhật lần cuối, Người tạo. Description box below (or "Chưa có mô tả.").
- Class mode **Cấu hình** grid: Tempo (`effectiveBpm` BPM, or "—"), Ngưỡng đạt (`≥ minAccuracy%` from the global grading settings), Nộp tối đa (`maxSubmissions`, or "Không giới hạn"), Phiên bản (`v<version>`).
- Sheet mode **Các bài tập dùng sheet này**: one block per assignment group (title + kind, the grouping key already used by the assign dialog): name, meta (kind), Tempo, Ngưỡng đạt, Nộp tối đa, and "Giao cho:" class chips. If two classes' copies differ in tempo or max submissions, show the values of the group's first assignment and "khác nhau giữa các lớp" (builder's call on exact wording).

### 4.5 Tab "Sheet & media"

- **Sheet nhạc được gán**: preview of the sheet file (image → `<img>`, PDF → first-page embed or a file card with "Mở" link; mockup shows image + "Trang 1 / 2"), file name, type/size meta.
- **Audio mẫu**: native audio player (mockup play/pause control + progress) or "Bài tập này chưa có audio mẫu."
- **Video hướng dẫn**: video player or "Bài tập này chưa có video hướng dẫn."
- No sheet assigned (class mode only, assignments may have no sheet): single empty notice for the whole tab.

### 4.6 Footer

- Class mode: existing actions from `AssignmentInfoPanel` (Sửa → `/teacher/assignments/:id/edit`, Đăng / Đóng / Mở lại, Xóa with the existing `ConfirmDialog`). After delete the drawer closes and the list reloads; after status changes both drawer and list reload.
- Sheet mode: **no "Chỉnh sửa" button for now** (U7). Only the filled button "Gán bài này cho lớp khác" → opens the existing `AssignAssignmentsDialog` with **every assignment group of this sheet** preselected (add an optional preselection prop).

### 4.7 Code organisation (per `docs/RULES.md`)

- New: `AssignmentDetailDrawer` (shell + tabs), `AssignmentPracticeStats`, `AssignmentMediaTab`, `AssignmentInfoTab`, hooks `useSheetGroupDetail`, extended `useTeacherAssignmentDetail`; API wrappers and types in `assignmentsApi.ts` / `teacherAssignmentTypes.ts`. Vietnamese strings in `features/classes/utils/`.
- Reuse `AssignmentStudentRow`, `ConfirmDialog`, `useAssignmentActions`, `AssignmentKindTag`.
- Delete `TeacherAssignmentDetailPage` and its test; move/rewrite the test as drawer tests. Remove `AssignmentInfoPanel` if nothing else uses it after the move (grep).

## 5. Backend (`modules/assignments`)

Definitions (existing conventions):
- **Practice** = a `Submission` of the assignment whose status is not REJECTED/FAILED (`AssignmentConstant.uncountedSubmissionStatuses`), same as `practiceCount` on the overview. **Tổng lượt luyện tập** counts all such submissions (so it equals the list row's `practiceCount`).
- **Members** = active class members (`SubmissionRepository.findActiveMembers`). **Practiced students** = members with ≥1 practice. In sheet mode a student is counted **once per class**, even when the class has several copies (e.g. SOLO and BONUS) of the same sheet; `memberCount` likewise counts each class's members once.
- **Average per student** = total practices ÷ practiced students, 1 decimal; 0 when nobody practiced.
- **Sheet-mode scope** = PUBLISHED and CLOSED copies. DRAFT copies are excluded from stats, `byClass` and the "n lớp" header, but are still listed in "Các bài tập dùng sheet này" with their status.
- **Ngưỡng đạt** = the assignment's own `minAccuracy ?? global grading minAccuracy` (same rule as the student side, `modules/classes/service/AssignmentService.ts`). In sheet mode it gets the same "khác nhau giữa các lớp" handling as tempo / max submissions.
- The list's sheet row (`groupBySheet` in `utils/assignmentOverviewFormat.ts`) is changed to follow the same rules (members once per class, drafts excluded), so the list row and the drawer show the same numbers.
- **Last 7 days** = counts grouped by calendar day in Vietnam time (Asia/Ho_Chi_Minh), today and the 6 days before, zero-filled, using the project's existing date utility.
- **Current semester** = `SemesterPolicyService.findCurrent`, class filter `Class.cohort === semester.name` (as in `getOverview`).

### 5.1 Class mode — extend `GET /assignments/:id`

Add to `AssignmentDetailDTO`:
- `practiceStats: { totalPractices, practicedStudents, memberCount, averagePerStudent, last7Days: { date: 'YYYY-MM-DD', count }[] }` for this assignment only.
- `minAccuracy` (global grading setting), `createdBy: { id, fullName } | null`.
- top-level `media` (null when the assignment has no sheet music): `{ sheet: Media | null, referenceAudio: Media | null, tutorialVideo: Media | null }` where `Media = { url, originalName, mimeType, sizeBytes, durationSec, pageCount }`, URLs from `StorageService.driver.createReadUrl` (same as `MusicLibraryDTO.toReadUrl`).

Access unchanged (`AssignmentAccessService.assertOwnedAssignment`).

### 5.2 Sheet mode — new `GET /assignments/sheet-groups/:sheetMusicId`

Lecturer only, registered before `/:id`. zod-validated uuid.

Scope: non-deleted assignments with this `sheetMusicId` in the caller's current-semester classes (reuse `AssignmentRepository.findClassesWithAssignments(lecturerId, semester.name)` and filter). 404 (Vietnamese message in `AssignmentConstant`) when no semester or no such assignment.

Response:
```
{
  semester: { name, startDate, endDate },
  sheetMusic: AssignmentSheetMusic & { media: {...as 5.1} },
  minAccuracy,
  assignments: [{ ...OverviewAssignment, className, maxSubmissions, effectiveBpm, publishedAt, createdBy }],
  practiceStats: { ...as 5.1, aggregated over all scoped assignments and their classes' members },
  byClass: [{ classId, className, practicedStudents, memberCount }]
}
```

### 5.3 Performance

One `groupBy` / `findMany` per metric over the scoped assignment ids (no per-assignment queries). The 7-day series uses one query filtered on `createdAt >= start of day 6 days ago`.

### 5.4 Constraints

- No migration, no `prisma db push`. Follow `.agents/rules/coding-convention.md` (one class per file, layer folders, PascalCase + suffix). Messages in Vietnamese with full diacritics.
- No commits unless the user asks (BE CLAUDE.md).

## 6. Testing

- BE Vitest: stats calculator (no submissions, rejected/failed excluded, non-members excluded, average rounding, 7-day zero fill and timezone boundary); sheet-group service (semester scoping, other lecturer's classes excluded, 404 cases, byClass); integration test for both endpoints.
- FE Vitest + Testing Library: row in each tab opens the right mode; `/teacher/assignments/:id` opens class mode; close returns to list keeping tab; class mode shows student list + actions, sheet mode shows per-class list + mockup footer; media empty states; delete closes drawer.

## 7. Calls made by the designer (not discussed with the user)

- URL scheme in 4.1 (keep `/:assignmentId` route for class mode, `?sheet=` for sheet mode).
- Mockup fields without data are omitted (4.4); "Ngưỡng đạt" = per-assignment `minAccuracy` falling back to the global setting.
- Average = practices ÷ students who practiced; 7-day series in Vietnam time.
- Sheet mode: students counted once per class; DRAFT copies excluded from stats; the list's sheet row is aligned to the same rules.
- "Gán bài này cho lớp khác" preselects every assignment group of the sheet.
- Old/out-of-semester assignments open in class mode over the current list; closing always returns to `/teacher/assignments`.
- Full-width drawer on phones.
