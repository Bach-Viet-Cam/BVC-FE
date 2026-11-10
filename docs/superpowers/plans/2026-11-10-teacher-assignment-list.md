# Teacher Assignment List (M03-07) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/teacher/assignments` main content to match the M03-07 mockup, add bulk "assign to classes" (clone), and limit every class on the page to the current semester with clear empty-state reasons.

**Architecture:** BE adds one read model `GET /assignments/overview` (current-semester classes + their assignments + semester + `emptyReason`) and one write endpoint `POST /assignments/assign` whose decisions live in a pure planner (`AssignmentAssignPolicyService.plan`). FE replaces the card grid with two tabs (per-class accordions, per-sheet table) and a two-column assign dialog, all fed by the overview response and filtered client-side.

**Tech Stack:** BE: Express, Prisma, zod, `node:test` (`npm test`). FE: React, Vite, Tailwind v4 `bvc-*` tokens, Base UI kit, Vitest + Testing Library.

**Spec:** `BVC-FE/docs/superpowers/specs/2026-11-10-teacher-assignment-list-design.md`
**Mockup (values to replicate):** `UI/M03-07 Danh sách bài tập-html/AssignmentList.dc.html` (inline `style=` attributes; map hex colors to existing `bvc-*` tokens, see `BVC-FE/docs/STRUCTURE.md` token table; skip the mockup's "SCR-M03-07 · UC-15" eyebrow and the right-hand detail drawer).

## Global Constraints

- BE commits only on branch `feature/m03-classes-members` (BE repo is currently on `uat`: run `git switch feature/m03-classes-members` first; if the branch does not exist, stop and ask). **Never commit on `uat`.** BVC-FE is not a git repo: FE tasks have no commit step.
- No Prisma migration, no CI/CD/workflow edits, no shared-DB changes.
- Follow `BVC-FE/docs/RULES.md` and `BVC-BE/CLAUDE.md`/`AGENTS.md`; all user-facing strings are Vietnamese and live in constants/utils, not inline in components.
- Current semester = semester in `SystemConfig` `class.semesters` with `startDate <= today <= endDate` (inclusive, today via `DateTimeUtil.todayInVietnam(now)`), **no fallback** to the nearest semester. Class membership of a semester = `Class.cohort === semester.name`.
- Group key for "same assignment" = `(title.trim().toLowerCase(), kind, sheetMusicId ?? null)`, identical on BE and FE.
- Skip reasons (exact codes): `NOT_CLASS_LECTURER`, `NOT_CURRENT_SEMESTER`, `CLASS_NOT_ACTIVE`, `SHEET_UNAVAILABLE`, `ALREADY_ASSIGNED`, `KIND_SLOT_TAKEN`. Empty reasons: `NO_SEMESTER_CONFIGURED`, `NO_CURRENT_SEMESTER`, `NO_CLASSES_IN_SEMESTER`.
- Table has 6 columns (Bài tập, Loại, Đã luyện, Luyện tập, Trạng thái, chevron); no "Tuần" column; no Lớp/Loại/Trạng thái filters; search box only.
- Existing `GET /assignments` and its callers (`StudentHistoryPage`, `ReviewPage`) must keep working unchanged.

## Review Focus

1. Today equals a semester's start or end date → still the current semester (inclusive boundaries). Tested in Task 1.
2. Two SOLO sources (or the same source twice) assigned to one class in one request → only the first is created, the rest skipped (`KIND_SLOT_TAKEN` / `ALREADY_ASSIGNED`). Tested in Task 3.
3. "No semester configured", "today outside every semester" and "lecturer has no class this semester" show three different messages, and the assign button is disabled in all three. Tested in Tasks 1, 7, 10.
4. Assignment with no sheet music: appears in its class accordion, absent from the sheet tab, no crash on grouping. Tested in Tasks 5 and 8.
5. Source id of another lecturer / deleted assignment is never copied and never leaked; if no source is readable the request is 404. Tested in Task 4.

---

## Backend (repo `BVC-BE`, run commands from `BVC-BE/`)

### Task 1: Current-semester resolver and empty-reason policy

**Files:**

- Create: `src/modules/classes/service/SemesterPolicyService.ts`, `src/modules/classes/service/SemesterPolicyService.test.ts`
- Modify: `src/types/AssignmentTypes.d.ts` (add types below inside the existing `Backend` namespace)

**Interfaces:**

- Produces (types): `Backend.OverviewEmptyReason = 'NO_SEMESTER_CONFIGURED' | 'NO_CURRENT_SEMESTER' | 'NO_CLASSES_IN_SEMESTER'`
- Produces: `SemesterPolicyService.findCurrent(semesters: Backend.Semester[], now: Date): Backend.Semester | null` and `SemesterPolicyService.resolveEmptyReason(input: { semesters: Backend.Semester[]; current: Backend.Semester | null; classCount: number }): Backend.OverviewEmptyReason | null`

- [ ] **Step 1: Write failing tests** in `SemesterPolicyService.test.ts` (`node:test` + `assert/strict`, style of `EnsemblePolicyService.test.ts`):
  - `findCurrent` returns the semester when today is strictly inside; returns it when `now` is exactly the `startDate` day and exactly the `endDate` day (use `new Date('2026-09-01T05:00:00Z')`-style instants that are those days in Vietnam time); returns `null` the day after `endDate`; returns `null` for `[]`; does **not** fall back to the nearest semester.
  - `resolveEmptyReason`: `semesters: []` → `'NO_SEMESTER_CONFIGURED'`; semesters present, `current: null` → `'NO_CURRENT_SEMESTER'`; `current` set, `classCount: 0` → `'NO_CLASSES_IN_SEMESTER'`; `current` set, `classCount: 2` → `null`.
- [ ] **Step 2: Run** `npx tsx --test src/modules/classes/service/SemesterPolicyService.test.ts` → FAIL (module missing).
- [ ] **Step 3: Implement** `SemesterPolicyService` as a static class; `findCurrent` uses the same string comparison as `ClassService.pickDefaultSemester` (`DateTimeUtil.todayInVietnam(now)` vs `startDate`/`endDate`) but returns `null` instead of falling back. Leave `ClassService.pickDefaultSemester` untouched.
- [ ] **Step 4: Run** the same command → PASS; run `npm run typecheck` → no errors.
- [ ] **Step 5: Commit** `git add src/modules/classes/service/SemesterPolicyService*.ts src/types/AssignmentTypes.d.ts && git commit -m "feat(m03): current-semester resolver and empty-reason policy"`

### Task 2: `GET /assignments/overview`

**Files:**

- Modify: `src/types/AssignmentTypes.d.ts`, `src/modules/assignments/repository/AssignmentRepository.ts`, `src/modules/assignments/repository/SubmissionRepository.ts`, `src/modules/assignments/dto/AssignmentDTO.ts`, `src/modules/assignments/service/AssignmentQueryService.ts`, `src/modules/assignments/controller/AssignmentController.ts`, `src/modules/assignments/route/AssignmentRoute.ts`, `src/modules/assignments/validation/AssignmentValidation.ts`
- Test: `src/modules/assignments/dto/AssignmentDTO.test.ts`

**Interfaces:**

- Consumes: `SemesterPolicyService` (Task 1); `SystemConfigService.getSemesters()`; `ClassModel.lecturerClassFilter(lecturerId)`; `AssignmentModel.assignmentSelect`.
- Produces (types in `Backend`):
  - `OverviewAssignmentDTO { id; classId; title; kind: AssignmentKind; status: AssignmentStatus; version: number; sheetMusicId: string | null; sheetTitle: string | null; practiceCount: number; submittedCount: number; memberCount: number; updatedAt: string }`
  - `OverviewClassDTO { id; name; status: ClassStatus; memberCount: number; assignments: OverviewAssignmentDTO[] }`
  - `AssignmentOverviewDTO { semester: Semester | null; emptyReason: OverviewEmptyReason | null; classes: OverviewClassDTO[] }`
- Produces: `AssignmentQueryService.getOverview(lecturerId: string, now?: Date): Promise<Backend.AssignmentOverviewDTO>`; `AssignmentDTO.toOverviewAssignment(record: Backend.AssignmentRecord, counts: { practiceCount: number; submittedCount: number; memberCount: number }): Backend.OverviewAssignmentDTO` (`sheetTitle` = `currentVersion.sheetMusic.piece.title`, falling back to `sheetMusic.name`; both `null` when no sheet).
- Produces repo: `AssignmentRepository.findClassesWithAssignments(lecturerId: string, cohort: string): Promise<Array<{ classRecord fields id,name,status; assignments: Backend.AssignmentRecord[] }>>` (non-deleted assignments, ordered `updatedAt desc`, classes ordered by name); `SubmissionRepository.countPracticesByAssignment(assignmentIds: string[]): Promise<Map<string, number>>` counting submissions whose status is not in `AssignmentConstant.uncountedSubmissionStatuses`.

- [ ] **Step 1: Write failing test** `AssignmentDTO.test.ts`: `toOverviewAssignment` maps a record with a sheet to `sheetMusicId`, `sheetTitle = piece.title`, passes counts through; a record with `currentVersion.sheetMusic = null` yields `sheetMusicId: null, sheetTitle: null`.
- [ ] **Step 2: Run** `npx tsx --test src/modules/assignments/dto/AssignmentDTO.test.ts` → FAIL.
- [ ] **Step 3: Implement** the DTO mapper, repo methods and `getOverview`: read semesters → `findCurrent` → if `null`, return `{ semester: null, emptyReason: resolveEmptyReason(...), classes: [] }` without querying classes; else query classes by cohort, member counts via `SubmissionRepository.findActiveMembers`, submitter counts via `findCountedSubmitters` (same per-class active-member filtering as `listAssignments`), practice counts via the new method; `emptyReason` from the policy with `classCount = classes.length`.
- [ ] **Step 4: Validation + route + controller**: `AssignmentValidation.overviewSchema` (empty body/params/query like `emptyQuery`); `AssignmentController.getOverview` → `ApiResponse.sendSuccessResponse(response, { data })` (mirror `listAssignments`); route `assignmentRouter.get('/overview', validateRequest(overviewSchema), ...lecturerOnly, wrap(AssignmentController.getOverview))` registered **before** `'/:id'`.
- [ ] **Step 5: Run** `npx tsx --test src/modules/assignments/dto/AssignmentDTO.test.ts` → PASS; `npm run typecheck` and `npm run lint` → clean. If a dev DB is available, start the server and `GET /assignments/overview` as a lecturer; expect `200` with `semester`, `emptyReason`, `classes` keys.
- [ ] **Step 6: Commit** `git add -A src/modules/assignments src/types/AssignmentTypes.d.ts && git commit -m "feat(m03): assignment overview endpoint scoped to current semester"`

### Task 3: Assign planner (pure policy)

**Files:**

- Create: `src/modules/assignments/service/AssignmentAssignPolicyService.ts`, `src/modules/assignments/service/AssignmentAssignPolicyService.test.ts`
- Modify: `src/types/AssignmentTypes.d.ts`

**Interfaces:**

- Produces (types): `Backend.AssignSkipReason` (union of the six codes in Global Constraints); `Backend.AssignPlanSource { id: string; title: string; kind: AssignmentKind; sheetMusicId: string | null }`; `Backend.AssignPlanTarget { id: string; cohort: string; status: ClassStatus; instrumentId: string; isLecturer: boolean; existing: Array<{ title: string; kind: AssignmentKind; sheetMusicId: string | null }> }`; `Backend.AssignPlan { toCreate: Array<{ sourceId: string; classId: string }>; skipped: Array<{ assignmentId: string; classId: string; reason: AssignSkipReason }> }`
- Produces: `AssignmentAssignPolicyService.plan(input: { sources: AssignPlanSource[]; targets: AssignPlanTarget[]; currentSemesterName: string | null; selectableSheets: Set<string> }): AssignPlan` where `selectableSheets` holds `` `${sheetMusicId}:${instrumentId}` `` keys.
- Produces: `AssignmentAssignPolicyService.groupKey(item: { title: string; kind: AssignmentKind; sheetMusicId: string | null }): string`.

Rule order for each (target, source), first match wins: `NOT_CLASS_LECTURER` (`!isLecturer`) → `NOT_CURRENT_SEMESTER` (`currentSemesterName === null || cohort !== currentSemesterName`) → `CLASS_NOT_ACTIVE` (`status !== 'ACTIVE'`) → `SHEET_UNAVAILABLE` (source has a sheet and key not in `selectableSheets`) → `ALREADY_ASSIGNED` (same `groupKey` in `existing`) → `KIND_SLOT_TAKEN` (kind in `AssignmentConstant.singleKinds` and `existing` has that kind). Iterate targets in input order, sources in input order; each created pair is appended to that target's working `existing` so later pairs in the same request see it. Do not mutate the caller's arrays.

- [ ] **Step 1: Write failing tests** (one `it` each): creates a pair for a clean active current-semester class; each of the six skip reasons in isolation; precedence — a same-group SOLO already in the class yields `ALREADY_ASSIGNED` (not `KIND_SLOT_TAKEN`); a different SOLO already in the class yields `KIND_SLOT_TAKEN`; BONUS/OTHER are unlimited (two different BONUS sources both created); **in-batch**: two SOLO sources into one class → first in `toCreate`, second `KIND_SLOT_TAKEN`; the same source listed twice → second `ALREADY_ASSIGNED`; `currentSemesterName: null` → every pair `NOT_CURRENT_SEMESTER`; title comparison is trim + case-insensitive.
- [ ] **Step 2: Run** `npx tsx --test src/modules/assignments/service/AssignmentAssignPolicyService.test.ts` → FAIL.
- [ ] **Step 3: Implement** the service per the rule order above.
- [ ] **Step 4: Run** same command → PASS; `npm run typecheck` clean.
- [ ] **Step 5: Commit** `git add -A src/modules/assignments/service src/types/AssignmentTypes.d.ts && git commit -m "feat(m03): assign planner policy"`

### Task 4: `POST /assignments/assign`

**Files:**

- Modify: `src/modules/assignments/validation/AssignmentValidation.ts`, `src/modules/assignments/constant/AssignmentConstant.ts`, `src/modules/assignments/repository/AssignmentRepository.ts`, `src/modules/assignments/service/AssignmentService.ts`, `src/modules/assignments/controller/AssignmentController.ts`, `src/modules/assignments/route/AssignmentRoute.ts`, `src/types/AssignmentTypes.d.ts`
- Test: `src/modules/assignments/validation/AssignmentValidation.test.ts` (extend)

**Interfaces:**

- Consumes: `AssignmentAssignPolicyService.plan` / `groupKey` (Task 3), `SemesterPolicyService.findCurrent` (Task 1), `ClassRepository.findClassById`, `ClassAccessService.isClassLecturer`, `AssignmentRepository.isSheetMusicSelectable`, `AssignmentRepository.createAssignment` / `createVersionAndMakeCurrent`, `AssignmentService.notifyMembers` / `audit`, `AssignmentDTO.toBaseDTO`.
- Produces: `AssignmentValidation.assignSchema` (body `{ assignmentIds: string[1..50] of recordId, classIds: string[1..50] of recordId }`, de-duplicated by transform; params/query empty); `AssignmentRepository.findClassAssignmentKeys(classId: string): Promise<Array<{ title: string; kind: Backend.AssignmentKind; sheetMusicId: string | null }>>` (non-deleted, from `currentVersion`); `AssignmentService.assignToClasses(lecturerId: string, input: { assignmentIds: string[]; classIds: string[] }, now?: Date): Promise<Backend.AssignResultDTO>` with `AssignResultDTO { created: Backend.AssignmentBaseDTO[]; skipped: Backend.AssignPlan['skipped'] }`; constants `AssignmentConstant.messages.ASSIGNED` (= `saved('Gán')`) and `auditActions.ASSIGN`.

- [ ] **Step 1: Write failing validation tests** in `AssignmentValidation.test.ts`: `assignSchema` rejects empty `assignmentIds`, empty `classIds`, > 50 ids, non-string ids; accepts valid input and de-duplicates repeated ids.
- [ ] **Step 2: Run** `npx tsx --test src/modules/assignments/validation/AssignmentValidation.test.ts` → FAIL on the new cases.
- [ ] **Step 3: Implement the schema, constants, repo method** and `assignToClasses`: (a) load each source via `AssignmentRepository.findById`; keep only non-deleted sources whose class passes `ClassAccessService.isClassLecturer`; if none remain throw `AppError.notFound(messages.ASSIGNMENT_NOT_FOUND)` (no distinction between "not yours" and "missing"); (b) load each target via `ClassRepository.findClassById` (ignore unknown ids by skipping them as `NOT_CLASS_LECTURER`), build `AssignPlanTarget` including `existing` from `findClassAssignmentKeys`; (c) resolve current semester name; (d) build `selectableSheets` for every distinct (source sheet × target instrument); (e) call `plan`; (f) for each `toCreate` pair run its **own** transaction: create PUBLISHED assignment (`deadline: class.endDate`, `publishedAt: now`), version 1 from the source's current version (title, description, kind, sheetMusicId, requiredBpm), audit `ASSIGN` with `{ sourceId }`, `notifyMembers(... notifications.PUBLISHED_TITLE ...)`; a failure in one pair must not roll back earlier pairs — catch, record the pair in `skipped` is **not** allowed, rethrow so the client sees a 5xx rather than a silent partial write. Return `created` DTOs via `loadBaseDTO`.
- [ ] **Step 4: Controller + route**: `AssignmentController.assignToClasses` → `sendSuccessResponse(response, { data, message: AssignmentConstant.messages.ASSIGNED })`; route `assignmentRouter.post('/assign', validateRequest(AssignmentValidation.assignSchema), ...lecturerOnly, wrap(AssignmentController.assignToClasses))`.
- [ ] **Step 5: Run** `npm test` (whole BE suite), `npm run typecheck`, `npm run lint` → all pass/clean. If a dev DB is available, `POST /assignments/assign` with one source and two classes; expect `created` for the valid class and a `skipped` entry with reason for the other.
- [ ] **Step 6: Commit** `git add -A src && git commit -m "feat(m03): bulk assign assignments to current-semester classes"`

---

## Frontend (repo `BVC-FE`, run commands from `BVC-FE/`; no commits)

### Task 5: Types, API and pure formatting utilities

**Files:**

- Modify: `src/features/classes/types/teacherAssignmentTypes.ts`, `src/features/classes/api/assignmentsApi.ts`
- Create: `src/features/classes/utils/assignmentOverviewFormat.ts`
- Test: `src/features/classes/__tests__/assignmentOverviewFormat.test.ts`

**Interfaces:**

- Produces types: `OverviewEmptyReason`, `AssignSkipReason` (same codes as BE); `OverviewSemester { name; startDate; endDate }`; `OverviewAssignment` (fields of BE `OverviewAssignmentDTO`); `OverviewClass { id; name; status: ClassStatus; memberCount; assignments: OverviewAssignment[] }`; `AssignmentOverview { semester: OverviewSemester | null; emptyReason: OverviewEmptyReason | null; classes: OverviewClass[] }`; `AssignPayload { assignmentIds: string[]; classIds: string[] }`; `AssignResult { created: AssignmentBase[]; skipped: { assignmentId: string; classId: string; reason: AssignSkipReason }[] }`.
- Produces API: `assignmentsApi.getOverview(): Promise<AxiosResponse<ApiResponse<AssignmentOverview>>>` → `GET /assignments/overview`; `assignmentsApi.assignToClasses(payload: AssignPayload)` → `POST /assignments/assign`.
- Produces utils (`assignmentOverviewFormat.ts`):
  - `assignmentGroupKey(item: { title: string; kind: AssignmentKind; sheetMusicId: string | null }): string` (same normalization as BE)
  - `filterOverviewClasses(classes: OverviewClass[], query: string): OverviewClass[]` (case/diacritic-insensitive title match; with a non-empty query drops classes without matches and keeps only matching assignments; empty query returns input)
  - `groupBySheet(classes: OverviewClass[]): SheetGroup[]` where `SheetGroup { sheetMusicId; sheetTitle; assignments: OverviewAssignment[]; classNames: string[]; kinds: AssignmentKind[]; submittedCount; memberCount; practiceCount }`; assignments with `sheetMusicId === null` are excluded; sorted by `practiceCount` desc
  - `groupAssignmentSources(classes: OverviewClass[]): SourceGroup[]` where `SourceGroup { key; representativeId; title; kind; sheetTitle; status; holderClassIds: string[]; holderClassNames: string[] }` (one per group key; `representativeId` = most recently updated member)
  - `summarizeClass(c: OverviewClass): { assignmentCount: number; openCount: number; practiceCount: number }` (`openCount` = PUBLISHED)
  - `emptyReasonMessage(reason: OverviewEmptyReason, ctx: { semester: OverviewSemester | null; today: Date }): string` using the three exact messages from the spec §3.5 (`dd/mm/yyyy` for today)
  - `ASSIGN_SKIP_LABELS: Record<AssignSkipReason, string>` (Vietnamese reasons, e.g. `KIND_SLOT_TAKEN` → "Lớp đã có bài cùng loại (Độc tấu/Hòa tấu)")

- [ ] **Step 1: Write failing tests** `assignmentOverviewFormat.test.ts`: group key equal for `"Lý ngựa ô "`/`"lý ngựa ô"` same kind+sheet, different for different kind; `filterOverviewClasses` with "ngua" matches "Lý ngựa ô" and drops non-matching classes; `groupBySheet` merges two classes' assignments of one sheet into one group with both class names, **excludes** an assignment with `sheetMusicId: null`, sums counts; `groupAssignmentSources` lists both holder classes for a cloned assignment; `summarizeClass` counts; `emptyReasonMessage` returns the exact three strings (assert with `today = new Date(2026, 10, 10)` → contains `10/11/2026`).
- [ ] **Step 2: Run** `npx vitest run src/features/classes/__tests__/assignmentOverviewFormat.test.ts` → FAIL.
- [ ] **Step 3: Add types/API and implement the utils.**
- [ ] **Step 4: Run** same command → PASS; `npm run typecheck` → clean.

### Task 6: Data hooks

**Files:**

- Create: `src/features/classes/hooks/useAssignmentOverview.ts`, `src/features/classes/hooks/useAssignToClasses.ts`

**Interfaces:**

- Consumes: `assignmentsApi.getOverview/assignToClasses`, `useApiQuery`, `parseApiError` (`utils/mapApiErrors`).
- Produces: `useAssignmentOverview(): { overview: AssignmentOverview | null; isLoading: boolean; error: string | null; reload: () => void }` (error text "Tải dữ liệu thất bại. Vui lòng thử lại." as in `useAssignmentList`); `useAssignToClasses(): { assign: (payload: AssignPayload) => Promise<{ result: AssignResult; message: string } | { error: ParsedApiError }>; isAssigning: boolean }` (same shape/pattern as `useSaveAssignment`, fallback error "Gán bài tập thất bại. Vui lòng thử lại.").

- [ ] **Step 1: Implement both hooks** following `useAssignmentList.ts` and `useSaveAssignment.ts`.
- [ ] **Step 2: Run** `npm run typecheck` and `npm run lint` → clean. (Behavior is covered through component tests in Tasks 7-10, which mock `assignmentsApi`.)

### Task 7: Semester notice and class accordion (tab "Theo lớp")

**Files:**

- Create: `src/features/classes/components/SemesterEmptyNotice.tsx`, `src/features/classes/components/AssignmentClassSection.tsx`
- Test: `src/features/classes/__tests__/AssignmentClassSection.test.tsx`

**Interfaces:**

- Consumes: `OverviewClass`, `summarizeClass`, `emptyReasonMessage` (Task 5); existing `StatusLabel`-style status dot or a new inline dot using tokens; `ASSIGNMENT_KIND_LABELS`.
- Produces: `<SemesterEmptyNotice reason={OverviewEmptyReason} semester={OverviewSemester | null} />` (role `status`, shows `emptyReasonMessage(...)`); `<AssignmentClassSection cls={OverviewClass} open={boolean} onToggle={() => void} highlightIds={Set<string>} />` — header button (`aria-expanded`) with name, "n SV · n bài tập · n đang mở", total practice count ("n lượt luyện tập"); when open, a 6-column table (grid at `lg`, stacked rows below `lg`) whose rows are `Link`s to `/teacher/assignments/:id` showing title + sheet title subline, kind label, `submittedCount / memberCount SV` with a progress bar, `n lượt`, status (Nháp / Đang mở / Đã đóng with dot), chevron; closed rows muted; ids in `highlightIds` show a "Vừa gán" badge; a class with no assignments shows "Lớp này chưa có bài tập nào." Replicate spacing/radius (20px card, 72px header, 12px uppercase header row) from the mockup using `bvc-*` tokens. Root element carries `id={`class-${cls.id}`}` for deep-link scrolling.

- [ ] **Step 1: Write failing tests:** closed section hides the table, `onToggle` fires on header click; open section renders 6 column headers (and no "Tuần"), a row links to `/teacher/assignments/a1`, shows `3 / 20 SV` and `5 lượt`; "Vừa gán" appears only for highlighted ids; empty class message; `SemesterEmptyNotice` renders each of the three messages for its reason.
- [ ] **Step 2: Run** `npx vitest run src/features/classes/__tests__/AssignmentClassSection.test.tsx` → FAIL.
- [ ] **Step 3: Implement both components.**
- [ ] **Step 4: Run** same command → PASS; `npm run typecheck && npm run lint` clean.

### Task 8: Sheet table (tab "Theo bài tập chung")

**Files:**

- Create: `src/features/classes/components/AssignmentSheetTable.tsx`
- Test: `src/features/classes/__tests__/AssignmentSheetTable.test.tsx`

**Interfaces:**

- Consumes: `SheetGroup` (Task 5).
- Produces: `<AssignmentSheetTable groups={SheetGroup[]} />` — card with title "Bài tập theo sheet nhạc", meta "n sheet nhạc · n bài tập", and the explanatory note from the mockup; columns Sheet nhạc (decorative score icon + title + "n bài tập"), Loại bài chips, Bài tập dùng sheet (count + names, truncated), Giao cho lớp chips, Đã luyện (progress), Luyện tập; each row is a `Link` to the first assignment's detail page; empty list shows "Chưa có bài tập nào gắn sheet nhạc."

- [ ] **Step 1: Write failing tests:** two groups render two rows; a row links to its first assignment; class chips and counts shown; empty message when `groups=[]`.
- [ ] **Step 2: Run** `npx vitest run src/features/classes/__tests__/AssignmentSheetTable.test.tsx` → FAIL.
- [ ] **Step 3: Implement the component**; **Step 4: Run** → PASS; typecheck + lint clean.

### Task 9: Assign dialog

**Files:**

- Create: `src/features/classes/components/AssignAssignmentsDialog.tsx`
- Test: `src/features/classes/__tests__/AssignAssignmentsDialog.test.tsx`

**Interfaces:**

- Consumes: `OverviewClass[]`, `groupAssignmentSources`, `assignmentGroupKey`, `ASSIGN_SKIP_LABELS`, `SemesterEmptyNotice` (Tasks 5, 7), `useAssignToClasses` (Task 6), shared `Dialog` and `toast` from `shared/components/ui`.
- Produces: `<AssignAssignmentsDialog open={boolean} onClose={() => void} classes={OverviewClass[]} emptyReason={OverviewEmptyReason | null} semester={OverviewSemester | null} onAssigned={(created: AssignmentBase[]) => void} />`.

Behavior: left column — header "n / total đã chọn" with select-all toggle, search "Tìm theo tên bài", kind filter chips with counts (Tất cả / Độc tấu / Hòa tấu / Bonus / Bài tập khác), multi-select list of `SourceGroup`s showing title, sheet, kind, status and "Đang gán cho: …" chips; right column — "Lớp nhận bài" list of ACTIVE classes only with "n / total đã chọn" and select-all, each row noting "Đã có bài này" when it already holds a selected group or "Đã có bài Độc tấu/Hòa tấu" when a selected SOLO/ENSEMBLE source would collide; when `emptyReason` is set the right column shows `SemesterEmptyNotice` and the Gán button is disabled. Footer: summary "n bài × n lớp", Hủy, Gán (disabled until ≥1 bài and ≥1 lớp, or while `isAssigning`). Submitting sends `representativeId`s + class ids; on success: `toast` "Đã gán {created.length} bài, bỏ qua {skipped.length}", call `onAssigned(created)`; if `skipped` is non-empty keep the dialog open showing a list "Bỏ qua: {class} — {bài}: {label}" (labels from `ASSIGN_SKIP_LABELS`) plus a "Đóng" button, otherwise close; on `{ error }` show the message in an `role="alert"` banner.

- [ ] **Step 1: Write failing tests** (mock `assignmentsApi.assignToClasses`): Gán disabled until one bài and one lớp selected; the class column lists only ACTIVE classes; selecting a group already held by a class shows "Đã có bài này" on that class; submit sends `{ assignmentIds: ['a1'], classIds: ['c2'] }`; skipped response keeps the dialog open and lists the Vietnamese reason; success with no skips closes (`onClose` called) and calls `onAssigned`; `emptyReason="NO_CURRENT_SEMESTER"` renders the notice and Gán stays disabled; kind chip filters the left list; search narrows it.
- [ ] **Step 2: Run** `npx vitest run src/features/classes/__tests__/AssignAssignmentsDialog.test.tsx` → FAIL.
- [ ] **Step 3: Implement the dialog**; **Step 4: Run** → PASS; typecheck + lint clean.

### Task 10: Compose the page and remove the old grid

**Files:**

- Modify: `src/features/classes/components/AssignmentList.tsx`, `src/features/classes/pages/AssignmentListPage.tsx`, `src/features/classes/__tests__/AssignmentList.test.tsx`
- Delete (after `grep -rn` confirms no other importer): `src/features/classes/components/AssignmentCard.tsx`, `FilterSelect.tsx` and `SearchInput.tsx` only if unused elsewhere

**Interfaces:**

- Consumes: Tasks 5-9; existing `ActionButton`, `useCreateDialog("assignment", ["classId", "kind"] as const)`, `AssignmentCreateDialog`, `ListState`, `useDebouncedValue`, `ASSIGNMENT_CLASS_PARAM`.
- Produces: `AssignmentList({ canCreate }: { canCreate: boolean })` (same props as today) rendering: toolbar (search 280px "Tên bài tập" + semester chip "Học kỳ: {name} ({dd/mm} – {dd/mm})" when `overview.semester` + outlined `Gán bài tập cho lớp` button, disabled with `title={reason message}` when `emptyReason` is set + filled `Tạo bài tập` via the existing create dialog), tablist (`role="tablist"`, tabs "Theo lớp" with class count and "Theo bài tập chung" with sheet-group count, persisted only in component state), tab panels built from `filterOverviewClasses` / `groupBySheet`, `SemesterEmptyNotice` instead of the panels when `emptyReason` is set, a "Không có bài tập nào khớp “{q}”." message when search matches nothing, `ListState` for loading/error. Open state per class is local; searching opens every remaining class; `?class=<id>` (read from `useSearchParams`) opens that class and `scrollIntoView` on `#class-<id>` after data loads. After `onAssigned`, call `reload()` and pass the created ids as `highlightIds`. `AssignmentListPage` keeps `TeacherScreen` + `PageTitle` (text becomes "Danh sách bài tập").

- [ ] **Step 1: Rewrite `AssignmentList.test.tsx`** (mock `assignmentsApi.getOverview`; keep the file's existing mock style): renders both tabs with counts; class accordion opens and shows rows; switching to "Theo bài tập chung" shows sheet rows and omits a no-sheet assignment; search "ngựa" opens matching classes and hides others; no-match message; `?class=c1` opens class c1 and calls `scrollIntoView` (stub `Element.prototype.scrollIntoView`); each `emptyReason` renders its message, hides tabs and disables the "Gán bài tập cho lớp" button; semester chip text; `canCreate={false}` hides both action buttons.
- [ ] **Step 2: Run** `npx vitest run src/features/classes/__tests__/AssignmentList.test.tsx` → FAIL.
- [ ] **Step 3: Implement the composition**, update the page title, delete unused old components.
- [ ] **Step 4: Full gate:** `npm run typecheck && npm run lint && npm run format:check && npm test && npm run build` → all green (run `npm run format` / `lint:fix` first if formatting fails).
- [ ] **Step 5: Visual check** (`npm run dev`, log in as a lecturer, open `/teacher/assignments` at ≥1440px and at phone width): compare against the mockup for header, tabs, accordion, table, popup; confirm the three empty states by temporarily changing the system semester config in a dev environment only (do not touch shared DB; if no dev DB, state this was not verified).
