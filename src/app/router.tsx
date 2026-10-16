import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DevNav } from "@/shared/components/DevNav";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { NotFoundPage } from "@/shared/pages/NotFoundPage";
import { ForbiddenPage } from "@/shared/pages/ForbiddenPage";
import { DashboardPage } from "@/shared/pages/DashboardPage";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import { AppLayout } from "@/shared/components/AppLayout";
import { DesktopLayout } from "@/shared/components/DesktopLayout";
import { MobileLayout } from "@/shared/components/MobileLayout";
import { ROLES } from "@/shared/constants/roles";

// Mobile — practice
import { PracticePage } from "@/features/practice/pages/PracticePage";
import { TunerPage } from "@/features/practice/pages/TunerPage";
import { MetronomePage } from "@/features/practice/pages/MetronomePage";
import { RecordingPage } from "@/features/practice/pages/RecordingPage";
import { AnalysisPage } from "@/features/practice/pages/AnalysisPage";
import { ErrorDetailPage } from "@/features/practice/pages/ErrorDetailPage";
import { SectionPage } from "@/features/practice/pages/SectionPage";
import { ComparePage } from "@/features/practice/pages/ComparePage";
import { HistoryPage } from "@/features/practice/pages/HistoryPage";
import { QualityCheckPage } from "@/features/practice/pages/QualityCheckPage";
import { ModesPage } from "@/features/practice/pages/ModesPage";
import { SongAnalysisPage } from "@/features/music-library/pages/SongAnalysisPage";

// Mobile — home
import { HomePage } from "@/features/home/pages/HomePage";
import { ProfilePage } from "@/features/home/pages/ProfilePage";

// Mobile — library
import { LibraryPage } from "@/features/music-library/pages/LibraryPage";
import { SongDetailPage } from "@/features/music-library/pages/SongDetailPage";
import { SheetPage } from "@/features/music-library/pages/SheetPage";
import { SavedPage } from "@/features/music-library/pages/SavedPage";
import { SongUploadPage } from "@/features/music-library/pages/SongUploadPage";

// Mobile — classes
import { AssignmentPage } from "@/features/classes/pages/AssignmentPage";
import { MyAssignmentsPage } from "@/features/classes/pages/MyAssignmentsPage";

// Mobile — ensemble & rental
import { EnsemblePage } from "@/features/ensemble/pages/EnsemblePage";
import { EnsemblePlaybackPage } from "@/features/ensemble/pages/EnsemblePlaybackPage";
import { RentalPage } from "@/features/platform/pages/RentalPage";
import { NotificationsPage } from "@/features/platform/pages/NotificationsPage";
import { HelpCenterPage } from "@/features/platform/pages/HelpCenterPage";
import { RentalMarketplacePage } from "@/features/platform/pages/RentalMarketplacePage";

// Desktop — teacher / classes
import { TeacherPage } from "@/features/classes/pages/TeacherPage";
import { TeacherHomePage } from "@/features/classes/pages/TeacherHomePage";
import { ClassListPage } from "@/features/classes/pages/ClassListPage";
import { ClassFormPage } from "@/features/classes/pages/ClassFormPage";
import { EnsembleAssignPage } from "@/features/classes/pages/EnsembleAssignPage";
import { RoadmapPage } from "@/features/classes/pages/RoadmapPage";
import { TeacherAssignmentsPage } from "@/features/classes/pages/TeacherAssignmentsPage";
import { ReviewPage } from "@/features/classes/pages/ReviewPage";
import { StudentProgressPage } from "@/features/classes/pages/StudentProgressPage";
import { AssignmentFormPage } from "@/features/classes/pages/AssignmentFormPage";

// Desktop — library management
import { SongManagePage } from "@/features/music-library/pages/SongManagePage";
import { SongFormPage } from "@/features/music-library/pages/SongFormPage";
import { SheetManagePage } from "@/features/music-library/pages/SheetManagePage";

// Desktop — platform
import { AdminPage } from "@/features/platform/pages/AdminPage";
import { CategoriesPage } from "@/features/platform/pages/CategoriesPage";
import { RentalProviderPage } from "@/features/platform/pages/RentalProviderPage";
import { StudentReviewPage } from "@/features/platform/pages/StudentReviewPage";
import { ContentApprovalPage } from "@/features/platform/pages/ContentApprovalPage";
import { UserManagePage } from "@/features/platform/pages/UserManagePage";
import { SystemConfigPage } from "@/features/platform/pages/SystemConfigPage";
import { CategoriesAdminPage } from "@/features/platform/pages/CategoriesAdminPage";
import { MonitoringPage } from "@/features/platform/pages/MonitoringPage";
import { NotificationsManagePage } from "@/features/platform/pages/NotificationsManagePage";

// Community — mobile
import { BonusListPage } from "@/features/community/pages/BonusListPage";
import { BonusDetailPage } from "@/features/community/pages/BonusDetailPage";
import { BonusSubmitPage } from "@/features/community/pages/BonusSubmitPage";
import { LeaderboardPage } from "@/features/community/pages/LeaderboardPage";
import { ChallengesPage } from "@/features/community/pages/ChallengesPage";
import { ChallengeDetailPage } from "@/features/community/pages/ChallengeDetailPage";

// Community — desktop
import { BonusFormPage } from "@/features/community/pages/BonusFormPage";
import { VerifiedContentPage } from "@/features/community/pages/VerifiedContentPage";
import { ChallengeFormPage } from "@/features/community/pages/ChallengeFormPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/403" element={<ForbiddenPage />} />

        {/* Mọi người dùng đã đăng nhập */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Route>

        {/* Sinh viên — màn hình mobile */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
          <Route path="/home" element={<HomePage />} />

          <Route element={<MobileLayout />}>
            <Route path="/assignments" element={<MyAssignmentsPage />} />
            <Route path="/assignment/:assignmentId" element={<AssignmentPage />} />
            <Route path="/ensemble/new" element={<EnsemblePage />} />
            <Route path="/community/bonus" element={<BonusListPage />} />
            <Route path="/community/bonus/:bonusId" element={<BonusDetailPage />} />
          </Route>

          <Route path="/practice/:songId" element={<PracticePage />} />
          <Route path="/practice/:songId/tuner" element={<TunerPage />} />
          <Route path="/practice/:songId/metronome" element={<MetronomePage />} />
          <Route path="/practice/:songId/recording" element={<RecordingPage />} />
          <Route path="/practice/:songId/quality" element={<QualityCheckPage />} />
          <Route path="/practice/:songId/modes" element={<ModesPage />} />
          <Route path="/practice/:songId/analysis/:recordingId" element={<AnalysisPage />} />
          <Route path="/practice/:songId/error/:errorId" element={<ErrorDetailPage />} />
          <Route path="/practice/:songId/section" element={<SectionPage />} />
          <Route path="/practice/:songId/compare" element={<ComparePage />} />
          <Route path="/practice/:songId/history" element={<HistoryPage />} />
          <Route path="/practice/:songId/song-analysis" element={<SongAnalysisPage />} />

          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/upload" element={<SongUploadPage />} />
          <Route path="/library/:songId" element={<SongDetailPage />} />
          <Route path="/library/:songId/sheet" element={<SheetPage />} />
          <Route path="/saved" element={<SavedPage />} />


          <Route path="/ensemble/:sessionId/playback" element={<EnsemblePlaybackPage />} />
          <Route path="/rental" element={<RentalPage />} />
          <Route path="/rental/marketplace" element={<RentalMarketplacePage />} />

          <Route path="/community/bonus/:bonusId/submit" element={<BonusSubmitPage />} />
          <Route path="/community/leaderboard" element={<LeaderboardPage />} />
          <Route path="/community/challenges" element={<ChallengesPage />} />
          <Route path="/community/challenges/:challengeId" element={<ChallengeDetailPage />} />
        </Route>

        {/* Giảng viên — màn hình desktop */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.TEACHER]} />}>
          <Route element={<DesktopLayout />}>
            <Route path="/teacher" element={<TeacherPage />} />
            <Route path="/teacher/home" element={<TeacherHomePage />} />
            <Route path="/teacher/classes" element={<ClassListPage />} />
            <Route path="/teacher/roadmap" element={<RoadmapPage />} />
            <Route path="/teacher/progress" element={<StudentProgressPage />} />
            <Route path="/teacher/assignments" element={<TeacherAssignmentsPage />} />
            <Route path="/songs" element={<SongManagePage />} />
            <Route path="/songs/sheets" element={<SheetManagePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
          </Route>
          <Route path="/teacher/classes/new" element={<ClassFormPage />} />
          <Route path="/teacher/classes/:classId/assign" element={<EnsembleAssignPage />} />
          <Route path="/teacher/review" element={<ReviewPage />} />
          <Route path="/teacher/assignments/new" element={<AssignmentFormPage />} />
          <Route path="/teacher/student-review" element={<StudentReviewPage />} />
          <Route path="/songs/new" element={<SongFormPage />} />
          <Route path="/songs/:songId/edit" element={<SongFormPage />} />
          <Route path="/community/bonus/new" element={<BonusFormPage />} />
          <Route path="/community/challenges/new" element={<ChallengeFormPage />} />
        </Route>

        {/* Quản trị viên — màn hình desktop */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]} />}>
          <Route element={<DesktopLayout />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/users" element={<UserManagePage />} />
            <Route path="/admin/config" element={<SystemConfigPage />} />
            <Route path="/admin/categories" element={<CategoriesAdminPage />} />
            <Route path="/admin/monitoring" element={<MonitoringPage />} />
            <Route path="/admin/notifications" element={<NotificationsManagePage />} />
            <Route path="/community/approval" element={<ContentApprovalPage />} />
          </Route>
          <Route path="/rental/provider" element={<RentalProviderPage />} />
        </Route>

        {/* Giảng viên và quản trị viên */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.SYSTEM_ADMIN]} />}>
          <Route element={<DesktopLayout />}>
            <Route path="/community/verified" element={<VerifiedContentPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <DevNav />
    </BrowserRouter>
  );
}
