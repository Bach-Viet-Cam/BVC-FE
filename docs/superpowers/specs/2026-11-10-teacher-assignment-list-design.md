# Teacher assignment list (M03-07) — design spec

Date: 2026-11-10 · Scope: FE `features/classes` + BE `modules/assignments` (lecturer assignment API) and `modules/classes` (semester helper) · Reference: `UI/M03-07 Danh sách bài tập-html`

## 1. Goal

Rebuild the main content of `/teacher/assignments` to match the M03-07 mockup, and add the one capability the mockup needs that does not exist yet: **assigning assignments to several classes at once**.

Success criteria:

- The page has the mockup's header, two tabs ("Theo lớp", "Theo bài tập chung") and the "Gán bài tập cho lớp" popup.
- Every class shown or selectable on this page belongs to the **current semester**; when none can be shown the UI tells the lecturer why.
- Existing M03 rules still hold: no grading, unlimited submissions, at most one SOLO and one ENSEMBLE per class, edits are versioned.

## 2. Decisions (agreed in brainstorming)

| #   | Decision                                                                                                                                                                |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | "Assign to class" = **clone**: each class keeps its own assignment (own progress, submissions, versions). No schema change.                                             |
| D2  | Drop the "Tuần" column. Table has 6 columns.                                                                                                                            |
| D3  | Drop the Lớp / Loại / Trạng thái filters; keep only the search box. The accordion-per-class replaces the Lớp filter.                                                    |
| D4  | Deep link `?class=<id>` (used by the class page) opens and scrolls to that class's accordion.                                                                           |
| D5  | Clicking a row goes to the existing detail page `/teacher/assignments/:id`. The mockup's right-hand detail drawer is **not** built.                                     |
| D6  | "Tạo bài tập" keeps the existing create dialog.                                                                                                                         |
| D7  | Clones are created `PUBLISHED` and notify the class's students through the existing publish flow.                                                                       |
| D8  | "Theo bài tập chung" groups by `sheetMusicId`; assignments without a sheet are not listed in that tab.                                                                  |
| D9  | Assign is partial-success: invalid (class, assignment) pairs are **skipped and reported**, valid ones are created.                                                      |
| D10 | Every class query on this page is limited to the **current semester** (section 5). Assignments of past semesters are not shown and cannot be used as copy sources here. |

## 3. Frontend

### 3.1 Page layout (`AssignmentListPage`)

- Header (mockup values): title "Danh sách bài tập", search input (280px, "Tên bài tập"), outlined button "Gán bài tập cho lớp", filled button "Tạo bài tập", and a chip "Học kỳ: <tên> (dd/mm – dd/mm)" when a current semester exists.
- Tabs under the header: "Theo lớp (n)" and "Theo bài tập chung (n)" (n = number of classes / sheet groups).
- Body background and card radii/colors follow the mockup, mapped to the existing `bvc-*` Tailwind tokens (no new colors). Responsive behaviour follows the existing lecturer shell rules (web-first; keep the current phone layout usable — accordions stack, tables collapse to stacked rows).

### 3.2 Tab "Theo lớp"

- One accordion per class: name, "n SV · n bài tập · n đang mở", total practice count on the right.
- Expanded body is a table: **Bài tập** (title + sheet title as subline) · **Loại** · **Đã luyện** (`submittedCount / memberCount` SV + progress bar) · **Luyện tập** (`n lượt`) · **Trạng thái** (dot + Nháp / Đang mở / Đã đóng) · chevron.
- Row click → detail page. Closed rows use muted text. Freshly assigned rows show the "Vừa gán" badge (client state until reload).
- Search matches assignment title and auto-opens classes that have matches; classes with no match are hidden. Empty class shows "Lớp này chưa có bài tập nào."
- `?class=<id>` opens and scrolls to that accordion.

### 3.3 Tab "Theo bài tập chung"

- One row per sheet group: sheet thumbnail, title, assignment kinds, "n bài tập dùng sheet" + names, class chips, practice progress and count.
- Row click → the first assignment in the group's detail page.

### 3.4 Popup "Gán bài tập cho lớp"

- Base UI `Dialog` from the shared kit, two columns.
- Left "Bài tập": search, kind chips with counts, multi-select list. Each item shows title, sheet, "Đang gán cho: …" class chips. Items are **assignment groups** keyed by (title, kind, sheetMusicId), sourced from the lecturer's current-semester classes.
- Right "Lớp nhận bài": current-semester ACTIVE classes, multi-select, with per-class note (e.g. already has this assignment / already has a SOLO).
- Footer: summary ("n bài × n lớp"), Hủy, Gán. Warning banner when the selection contains pairs that will be skipped.
- On success: toast "Đã gán n bài, bỏ qua m", list reloads, new rows get "Vừa gán". Skipped pairs and reasons are listed in the dialog result before closing.

### 3.5 Empty states (current semester)

When the API returns `emptyReason`, the list area, the popup's class column and the disabled "Gán bài tập cho lớp" button (tooltip) show the matching message:

| `emptyReason`            | Message                                                           |
| ------------------------ | ----------------------------------------------------------------- |
| `NO_SEMESTER_CONFIGURED` | Chưa có học kỳ nào được cấu hình. Vui lòng liên hệ quản trị viên. |
| `NO_CURRENT_SEMESTER`    | Hôm nay (dd/mm/yyyy) không nằm trong học kỳ nào đã cấu hình.      |
| `NO_CLASSES_IN_SEMESTER` | Bạn chưa có lớp nào trong học kỳ <tên>.                           |

Strings live in `features/classes/utils/` (RULES.md), not inline.

### 3.6 Code organisation (per `docs/RULES.md` §13)

- New components: `AssignmentClassSection`, `AssignmentSheetTable`, `AssignAssignmentsDialog`, `SemesterEmptyNotice`.
- New hook `useAssignToClasses` (loading/error state), `api/` wrapper for `POST /assignments/assign`, types in `types/teacherAssignmentTypes.ts`.
- `AssignmentList` is rewritten around the tabs. Remove `AssignmentCard` and `ClassAssignmentSections` if nothing else uses them (verify with grep). Forms use the plain `register()` + `Input` pattern; this feature has no RHF form beyond existing dialogs.
- Update `__tests__/AssignmentList.test.tsx`; add tests for popup selection, skipped report and each empty state.

## 4. Backend (`modules/assignments`, `modules/classes`)

### 4.1 `POST /assignments/assign` (lecturer only)

Body: `{ assignmentIds: string[], classIds: string[] }` (zod, non-empty, bounded).

For each (source assignment × target class), in one transaction per pair or batch:

- Create a new assignment in the target class copying `title`, `description`, `kind`, `sheetMusicId`, `requiredBpm` from the source's current version; version 1; status `PUBLISHED`; `createdById` = caller.
- Notify the class's students using the existing publish notification path.

Skipped (not errors), with `reason`:

- `NOT_CURRENT_SEMESTER` — class not in the current semester.
- `CLASS_NOT_ACTIVE` — class status is not ACTIVE.
- `NOT_CLASS_LECTURER` — caller does not teach the class (or source is not theirs to read).
- `ALREADY_ASSIGNED` — class already has a non-deleted assignment in the same group (title + kind + sheetMusicId).
- `SHEET_UNAVAILABLE` — the source's sheet music is not selectable for the target class's instrument (reuse `assertSheetMusicSelectable` rule A15).
- `KIND_SLOT_TAKEN` — class already has a SOLO/ENSEMBLE and the clone is the same kind (reuse the existing 1+1 policy in `AssignmentPolicyService`).

Response: `{ created: AssignmentListItem[], skipped: { classId, assignmentId, reason }[] }`. Whole request fails (4xx) only for malformed input or when no source assignment is readable by the caller.

### 4.2 Current semester

- `ClassService.resolveCurrentSemester(now)`: from `SystemConfigService.getSemesters()` return the semester with `startDate <= today <= endDate`, else `null`. **No fallback** to the nearest semester (unlike `pickDefaultSemester`, which stays unchanged for the class form). Date handling via `DateTimeUtil`.
- Class filter = `Class.cohort` equals the semester name.

### 4.3 Overview endpoint (replaces changes to `GET /assignments`)

`GET /assignments/overview` (lecturer only, registered before `/:id`) is the single read model for the page **and** the popup. `GET /assignments` stays unchanged, so `StudentHistoryPage` and `ReviewPage` are untouched.

Response: `{ semester: {name,startDate,endDate} | null, emptyReason: EmptyReason | null, classes: OverviewClass[] }` where `OverviewClass = { id, name, status, memberCount, assignments: OverviewAssignment[] }` and `OverviewAssignment = { id, classId, title, kind, status, version, sheetMusicId|null, sheetTitle|null, practiceCount, submittedCount, memberCount, updatedAt }`. Only the lecturer's classes whose `cohort` equals the current semester name are returned. Search, tab grouping, sheet grouping and popup filtering are done client-side (data is bounded to one semester of one lecturer, no pagination).

`practiceCount` = submissions of the assignment whose status is not REJECTED/FAILED (existing "n lần nộp" convention).

### 4.4 Constraints

- No schema migration and no CI/CD or shared-DB changes.
- All work on branch `feature/m03-classes-members` in BE and FE.
- Messages in BE constants (`ClassConstant`), following the existing `MSG-xx` style where applicable.

## 5. Testing

- BE Vitest: `resolveCurrentSemester` (inside range, boundary dates, outside → null, empty config); assign service (copy fields, each skip reason, partial success, permission, notification call); list endpoint semester filtering and `emptyReason`.
- FE Vitest + Testing Library: tabs render grouped data, search auto-open, `?class=` deep link, popup multi-select and result report, the three empty states, disabled assign button.

## 6. Out of scope

Detail drawer from the mockup; true many-to-many assignment/class linkage; editing assignments across classes; showing or copying past-semester assignments; roadmap week column.

## 7. Open assumptions to confirm during review

- Group key for "already assigned" and for popup grouping is (title, kind, sheetMusicId).
- Clones copy the source's _current_ version content only (no history).
- Sheet thumbnail in the sheet tab is the mockup's decorative score icon (no real image).
