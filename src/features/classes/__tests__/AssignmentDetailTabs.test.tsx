import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AssignmentInfoTab } from "@/features/classes/components/AssignmentInfoTab";
import { AssignmentMediaTab } from "@/features/classes/components/AssignmentMediaTab";
import { AssignmentPracticeStats } from "@/features/classes/components/AssignmentPracticeStats";
import {
  type AssignmentDetail,
  type AssignmentMedia,
  type PracticeStats,
  type SheetGroupAssignment,
  type SheetGroupDetail,
} from "@/features/classes/types/teacherAssignmentTypes";

const stats: PracticeStats = {
  totalPractices: 3,
  practicedStudents: 1,
  memberCount: 2,
  averagePerStudent: 2.3,
  last7Days: Array.from({ length: 7 }, (_, index) => ({ date: `2026-11-0${index + 1}`, count: index })),
};

const file = { url: "https://x/f", originalName: "sheet.png", mimeType: "image/png", sizeBytes: 2048, durationSec: null, pageCount: null };

const detail: AssignmentDetail = {
  id: "a1",
  classId: "c1",
  className: "TRD301",
  classStatus: "ACTIVE",
  status: "PUBLISHED",
  version: 2,
  title: "Bài 1",
  description: null,
  kind: "SOLO",
  sheetMusic: null,
  requiredBpm: null,
  effectiveBpm: 80,
  maxSubmissions: null,
  publishedAt: null,
  closedAt: null,
  updatedAt: "2026-11-01T00:00:00Z",
  students: [],
  practiceStats: stats,
  minAccuracy: 70,
  createdBy: { id: "u1", fullName: "Cô Lan" },
  media: null,
};

function copy(id: string, className: string, effectiveBpm: number): SheetGroupAssignment {
  return {
    id,
    classId: `c-${id}`,
    className,
    title: "Bài 1",
    kind: "SOLO",
    status: "PUBLISHED",
    version: 1,
    sheetMusicId: "s1",
    sheetTitle: "Sheet",
    practiceCount: 0,
    submittedCount: 0,
    memberCount: 0,
    updatedAt: "2026-11-01T00:00:00Z",
    maxSubmissions: 3,
    effectiveBpm,
    minAccuracy: 70,
    publishedAt: null,
    createdBy: null,
  };
}

function sheetGroup(assignments: SheetGroupAssignment[]): SheetGroupDetail {
  return {
    semester: { name: "HK1", startDate: "2026-09-01", endDate: "2027-01-01" },
    sheetMusic: { id: "s1", name: "Sheet", pieceId: "p", pieceTitle: "Piece", defaultBpm: null, isAvailable: true },
    media: { sheet: null, referenceAudio: null, tutorialVideo: null },
    assignments,
    practiceStats: stats,
    byClass: [],
  };
}

describe("AssignmentPracticeStats", () => {
  it("renders stat cards, 7 bars and class rows", () => {
    render(
      <AssignmentPracticeStats
        stats={stats}
        byClass={[{ classId: "c1", className: "TRD301", practicedStudents: 12, memberCount: 32 }]}
      />
    );
    expect(screen.getByText("Tổng lượt luyện tập").nextElementSibling).toHaveTextContent("3");
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getByText("2,3")).toBeInTheDocument();
    expect(screen.getAllByTestId("practice-bar")).toHaveLength(7);
    expect(screen.getByText("01/11")).toBeInTheDocument();
    expect(screen.getByText("TRD301")).toBeInTheDocument();
    expect(screen.getByText("12 / 32 SV")).toBeInTheDocument();
  });

  it("renders children instead of the class list when byClass is absent", () => {
    render(
      <AssignmentPracticeStats stats={stats}>
        <p>Danh sách sinh viên</p>
      </AssignmentPracticeStats>
    );
    expect(screen.getByText("Danh sách sinh viên")).toBeInTheDocument();
    expect(screen.queryByText("Sinh viên đã tập theo lớp")).not.toBeInTheDocument();
  });
});

describe("AssignmentMediaTab", () => {
  it("shows the no-sheet notice when media is null", () => {
    render(<AssignmentMediaTab media={null} />);
    expect(screen.getByText("Bài tập này chưa gắn sheet nhạc.")).toBeInTheDocument();
  });

  it("shows empty copy for missing audio and video", () => {
    render(<AssignmentMediaTab media={{ sheet: file, referenceAudio: null, tutorialVideo: null }} />);
    expect(screen.getByAltText("sheet.png")).toBeInTheDocument();
    expect(screen.getByText("Bài tập này chưa có audio mẫu.")).toBeInTheDocument();
    expect(screen.getByText("Bài tập này chưa có video hướng dẫn.")).toBeInTheDocument();
  });

  it("renders a PDF as a link and tolerates null urls", () => {
    const media: AssignmentMedia = {
      sheet: { ...file, mimeType: "application/pdf", originalName: "a.pdf" },
      referenceAudio: { ...file, url: null, originalName: "ref.mp3", mimeType: "audio/mpeg" },
      tutorialVideo: null,
    };
    const { container } = render(<AssignmentMediaTab media={media} />);
    const link = screen.getByRole("link", { name: "Mở" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.getByText("ref.mp3")).toBeInTheDocument();
    expect(container.querySelector("audio")).toBeNull();
  });
});

describe("AssignmentInfoTab", () => {
  it("class mode shows config values", () => {
    render(<AssignmentInfoTab mode="class" assignment={detail} />);
    expect(screen.getByText("Không giới hạn")).toBeInTheDocument();
    expect(screen.getByText("80 BPM")).toBeInTheDocument();
    expect(screen.getByText("≥ 70%")).toBeInTheDocument();
    expect(screen.getByText("v2")).toBeInTheDocument();
    expect(screen.getByText("Chưa có mô tả.")).toBeInTheDocument();
  });

  it("sheet mode flags copies with different tempo", () => {
    render(<AssignmentInfoTab mode="sheet" group={sheetGroup([copy("1", "Lớp A", 80), copy("2", "Lớp B", 90)])} />);
    const block = screen.getByTestId("sheet-assignment-group");
    expect(within(block).getByText("(khác nhau giữa các lớp)")).toBeInTheDocument();
    expect(within(block).getByText("Lớp A")).toBeInTheDocument();
    expect(within(block).getByText("Lớp B")).toBeInTheDocument();
  });

  it("sheet mode does not flag identical copies", () => {
    render(<AssignmentInfoTab mode="sheet" group={sheetGroup([copy("1", "Lớp A", 80), copy("2", "Lớp B", 80)])} />);
    expect(screen.queryByText("(khác nhau giữa các lớp)")).not.toBeInTheDocument();
  });
});
