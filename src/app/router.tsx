import { FaqManagePage } from "@/features/platform/pages/FaqManagePage";
import { AudioAnalysisTestPage } from "@/features/practice/pages/AudioAnalysisTestPage";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Mobile — practice (M01 Smart Practice Studio)
import { PracticeDemoProvider } from "@/features/practice/context/PracticeDemoContext";
import { RecordPage } from "@/features/practice/pages/RecordPage";
import { TunerPage } from "@/features/practice/pages/TunerPage";
import { MetronomePage } from "@/features/practice/pages/MetronomePage";
import { ProcessingPage } from "@/features/practice/pages/ProcessingPage";
import { ResultsPage } from "@/features/practice/pages/ResultsPage";
import { SegmentPracticePage } from "@/features/practice/pages/SegmentPracticePage";
import { SubmissionHistoryPage } from "@/features/practice/pages/SubmissionHistoryPage";
import { SubmissionComparePage } from "@/features/practice/pages/SubmissionComparePage";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { LandingPage } from "@/features/landing/pages/LandingPage";
import { ScrollToTop } from "@/shared/components/ScrollToTop";
import { CreateRedirect } from "@/shared/components/CreateRedirect";
import { NotFoundPage } from "@/shared/pages/NotFoundPage";
import { ForbiddenPage } from "@/shared/pages/ForbiddenPage";
import { DashboardPage } from "@/shared/pages/DashboardPage";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import { AppLayout } from "@/shared/components/AppLayout";
import { DesktopLayout } from "@/shared/components/DesktopLayout";
import { ROLES } from "@/shared/constants/roles";

// Mobile - home
import { HomePage } from "@/features/home/pages/HomePage";
import { ProfilePage } from "@/features/home/pages/ProfilePage";

// Mobile - library
import { LibraryPage } from "@/features/music-library/pages/LibraryPage";
import { SongDetailPage } from "@/features/music-library/pages/SongDetailPage";
import { SheetPage } from "@/features/music-library/pages/SheetPage";
import { SavedPage } from "@/features/music-library/pages/SavedPage";
import { SongUploadPage } from "@/features/music-library/pages/SongUploadPage";

// Mobile - classes
import { AssignmentPage } from "@/features/classes/pages/AssignmentPage";
import { MyAssignmentsPage } from "@/features/classes/pages/MyAssignmentsPage";

// Mobile - ensemble & platform
import { EnsemblePage } from "@/features/ensemble/pages/EnsemblePage";
import { EnsemblePlaybackPage } from "@/features/ensemble/pages/EnsemblePlaybackPage";
import { NotificationsPage } from "@/features/platform/pages/NotificationsPage";
import { HelpCenterPage } from "@/features/platform/pages/HelpCenterPage";

// Desktop - teacher / classes
import { TeacherHomePage } from "@/features/classes/pages/TeacherHomePage";
import { ClassListPage } from "@/features/classes/pages/ClassListPage";
import { ClassFormPage } from "@/features/classes/pages/ClassFormPage";
import { ReviewPage } from "@/features/classes/pages/ReviewPage";
import { AssignmentFormPage } from "@/features/classes/pages/AssignmentFormPage";
import { ClassDetailPage } from "@/features/classes/pages/ClassDetailPage";
import { ImportStudentsPage } from "@/features/classes/pages/ImportStudentsPage";
import { TeacherAssignmentDetailPage } from "@/features/classes/pages/TeacherAssignmentDetailPage";
import { StudentHistoryPage } from "@/features/classes/pages/StudentHistoryPage";
import { AttentionStudentsPage } from "@/features/classes/pages/AttentionStudentsPage";
import { TodaySubmissionsPage } from "@/features/classes/pages/TodaySubmissionsPage";
import { StudentSubmissionsPage } from "@/features/classes/pages/StudentSubmissionsPage";

// Desktop - library management
import { SongManagePage } from "@/features/music-library/pages/SongManagePage";
import { SongFormPage } from "@/features/music-library/pages/SongFormPage";
import { SheetManagePage } from "@/features/music-library/pages/SheetManagePage";

// Desktop - platform
import { AdminPage } from "@/features/platform/pages/AdminPage";
import { CategoriesPage } from "@/features/platform/pages/CategoriesPage";
import { StudentReviewPage } from "@/features/platform/pages/StudentReviewPage";
import { ContentApprovalPage } from "@/features/platform/pages/ContentApprovalPage";
import { UserManagePage } from "@/features/platform/pages/UserManagePage";
import { SystemConfigPage } from "@/features/platform/pages/SystemConfigPage";
import { InstrumentConfigPage } from "@/features/platform/pages/InstrumentConfigPage";
import { CategoriesAdminPage } from "@/features/platform/pages/CategoriesAdminPage";
import { MonitoringPage } from "@/features/platform/pages/MonitoringPage";
import { NotificationsManagePage } from "@/features/platform/pages/NotificationsManagePage";

// Community - mobile
import { BonusListPage } from "@/features/community/pages/BonusListPage";
import { BonusDetailPage } from "@/features/community/pages/BonusDetailPage";
import { BonusSubmitPage } from "@/features/community/pages/BonusSubmitPage";
import { LeaderboardPage } from "@/features/community/pages/LeaderboardPage";
import { LeaderboardDesktopPage } from "@/features/community/pages/LeaderboardDesktopPage";
import { ChallengesPage } from "@/features/community/pages/ChallengesPage";
import { ChallengeDetailPage } from "@/features/community/pages/ChallengeDetailPage";

// Community - desktop
import { VerifiedContentPage } from "@/features/community/pages/VerifiedContentPage";
import { ChallengeFormPage } from "@/features/community/pages/ChallengeFormPage";
import { AssignmentListPage } from "@/features/classes/pages/AssignmentListPage";
import { LecturerChallengesPage } from "@/features/community/pages/LecturerChallengesPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/403" element={<ForbiddenPage />} />

        {/* M02 - thư viện mở cho cả khách; khách bấm Lưu thì được mời đăng nhập */}
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/library/:songId" element={<SongDetailPage />} />
        <Route path="/library/:songId/sheets/:sheetId" element={<SheetPage />} />

        {/* Mọi người dùng đã đăng nhập */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dev/audio-analysis" element={<AudioAnalysisTestPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Route>

        {/* Sinh viên - màn hình mobile */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
          <Route path="/home" element={<HomePage />} />

          <Route path="/assignments" element={<MyAssignmentsPage />} />
          <Route path="/assignment/:assignmentId" element={<AssignmentPage />} />
          <Route path="/community/bonus" element={<BonusListPage />} />
          <Route path="/community/bonus/:bonusId" element={<BonusDetailPage />} />

          {/* Hòa tấu tự dựng khung responsive (EnsembleFrame) */}
          <Route path="/ensemble/new" element={<EnsemblePage />} />

          {/* M01 — tiến trình xử lý chạy nền nên các màn luyện tập dùng chung một provider */}
          <Route element={<PracticeDemoProvider />}>
            <Route path="/practice/sheets/:sheetId/record" element={<RecordPage />} />
            <Route path="/practice/sheets/:sheetId/tuner" element={<TunerPage />} />
            <Route path="/practice/sheets/:sheetId/metronome" element={<MetronomePage />} />
            <Route path="/practice/submissions/:submissionId/processing" element={<ProcessingPage />} />
            {/* UC-03 - luyện lại một đoạn; đặt trước :submissionId để không bị nhầm với trang kết quả */}
            <Route path="/practice/submissions/:submissionId/segment" element={<SegmentPracticePage />} />
            <Route path="/practice/submissions/:submissionId" element={<ResultsPage />} />
            {/* SCR-01, SCR-02 - lịch sử và so sánh bài nộp (mockup) */}
            <Route path="/practice/submissions" element={<SubmissionHistoryPage />} />
            <Route path="/practice/submissions/compare" element={<SubmissionComparePage />} />
          </Route>

          {/* Library */}
          <Route path="/library/upload" element={<SongUploadPage />} />
          <Route path="/saved" element={<SavedPage />} />

          <Route path="/ensemble/:sessionId/playback" element={<EnsemblePlaybackPage />} />

          <Route path="/community/bonus/:bonusId/submit" element={<BonusSubmitPage />} />
          <Route path="/community/leaderboard" element={<LeaderboardPage />} />
          <Route path="/community/challenges" element={<ChallengesPage />} />
          <Route path="/community/challenges/:challengeId" element={<ChallengeDetailPage />} />
        </Route>

        {/* Giảng viên - màn hình desktop */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.TEACHER]} />}>
          <Route element={<DesktopLayout />}>
            <Route path="/teacher" element={<Navigate to="/teacher/home" replace />} />
            <Route path="/teacher/home" element={<TeacherHomePage />} />
            <Route path="/teacher/attention-students" element={<AttentionStudentsPage />} />
            <Route path="/teacher/today-submissions" element={<TodaySubmissionsPage />} />
            <Route path="/teacher/classes" element={<ClassListPage />} />
            <Route path="/teacher/roadmap" element={<Navigate to="/teacher/classes" replace />} />
            <Route path="/teacher/progress" element={<Navigate to="/teacher/classes" replace />} />
            <Route path="/teacher/assignments" element={<AssignmentListPage />} />
            <Route path="/teacher/challenges" element={<LecturerChallengesPage />} />
            <Route
              path="/teacher/challenges/new"
              element={<CreateRedirect to="/teacher/challenges" name="challenge" />}
            />
            <Route path="/teacher/challenges/:id/edit" element={<ChallengeFormPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            {/* M03 classes & members: web-first inside the lecturer shell */}
            {/* Tạo mới mở bằng modal: đường dẫn ".../new" cũ chuyển về trang danh sách và mở sẵn modal */}
            <Route path="/teacher/classes/new" element={<CreateRedirect to="/teacher/classes" name="class" />} />
            <Route path="/teacher/classes/:classId" element={<ClassDetailPage />} />
            <Route path="/teacher/classes/:classId/edit" element={<ClassFormPage />} />
            <Route
              path="/teacher/classes/:classId/members/new"
              element={<CreateRedirect to="/teacher/classes/:classId" name="member" />}
            />
            <Route path="/teacher/classes/:classId/import" element={<ImportStudentsPage />} />
            <Route path="/teacher/classes/:classId/students/:studentId" element={<StudentHistoryPage />} />
            <Route
              path="/teacher/assignments/new"
              element={<CreateRedirect to="/teacher/assignments" name="assignment" />}
            />
            <Route path="/teacher/assignments/:assignmentId/edit" element={<AssignmentFormPage />} />
            <Route path="/teacher/assignments/:assignmentId" element={<TeacherAssignmentDetailPage />} />
            <Route path="/teacher/assignments/:assignmentId/students/:studentId" element={<StudentSubmissionsPage />} />
            <Route path="/teacher/review" element={<ReviewPage />} />
            <Route path="/teacher/student-review" element={<StudentReviewPage />} />
          </Route>

          {/* M02 - quản lý bài hát (trang tự bọc TeacherShell) */}
          <Route path="/songs" element={<SongManagePage />} />
          <Route path="/songs/new" element={<CreateRedirect to="/songs" name="song" />} />
          <Route path="/songs/:songId/edit" element={<SongFormPage />} />
          <Route path="/songs/:songId/sheets" element={<SheetManagePage />} />

          {/* Community - desktop */}
          {/* Bonus tạo bằng form bài tập chung (chọn loại Bonus) */}
          <Route path="/community/bonus/new" element={<CreateRedirect to="/teacher/assignments" name="assignment" />} />
        </Route>

        {/* Quản trị viên - màn hình desktop */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]} />}>
          <Route element={<DesktopLayout />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/users" element={<UserManagePage />} />
            <Route path="/admin/faqs" element={<FaqManagePage />} />
            <Route path="/admin/config" element={<SystemConfigPage />} />
            <Route path="/admin/instruments" element={<InstrumentConfigPage />} />
            <Route path="/admin/categories" element={<CategoriesAdminPage />} />
            <Route path="/admin/monitoring" element={<MonitoringPage />} />
            <Route path="/admin/notifications" element={<NotificationsManagePage />} />
            <Route path="/community/approval" element={<ContentApprovalPage />} />
            {/* M03 roadmap & grading - System Admin */}
            <Route path="/admin/roadmaps" element={<Navigate to="/admin/instruments?tab=roadmap" replace />} />
            <Route path="/admin/grading-settings" element={<Navigate to="/admin/config" replace />} />
          </Route>
        </Route>

        {/* Giảng viên và quản trị viên */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.SYSTEM_ADMIN]} />}>
          <Route element={<DesktopLayout />}>
            <Route path="/community/verified" element={<VerifiedContentPage />} />
            <Route path="/leaderboard" element={<LeaderboardDesktopPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
