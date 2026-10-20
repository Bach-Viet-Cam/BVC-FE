import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DesktopPageHeader, StatCard } from "@/shared/components/bvc";

const SEMESTER_CHIPS = ["Fall 2026", "Spring 2026", "Fall 2025"] as const;

const CLASSES = [
  { code: "TRD301", name: "Nhạc cụ truyền thống", semester: "Fall 2026", students: 28, week: "4/6", status: "active" },
  { code: "TRD201", name: "Nhạc cụ cơ bản", semester: "Fall 2026", students: 32, week: "3/6", status: "active" },
  { code: "TRD401", name: "Hòa tấu nâng cao", semester: "Fall 2026", students: 18, week: "5/6", status: "active" },
  { code: "TRD301B", name: "Nhạc cụ truyền thống", semester: "Spring 2026", students: 25, week: "6/6", status: "done" },
  { code: "TRD201B", name: "Nhạc cụ cơ bản", semester: "Spring 2026", students: 30, week: "6/6", status: "done" },
  { code: "TRD101", name: "Nhập môn nhạc cụ", semester: "Fall 2025", students: 22, week: "6/6", status: "done" },
] as const;

export function ClassListPage() {
  const navigate = useNavigate();
  const [activeSemester, setActiveSemester] = useState<string>("Fall 2026");

  return (
    <>
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopPageHeader
          breadcrumb="Lớp học"
          title="Danh sách lớp học"
          actions={
            <>
              <div className="flex gap-2">
                {SEMESTER_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setActiveSemester(chip)}
                    className={
                      activeSemester === chip
                        ? "cursor-pointer rounded-[11px] bg-bvc-ink px-3 py-1.5 text-[13px] font-bold text-white"
                        : "cursor-pointer rounded-[11px] border border-bvc-border-strong px-3 py-1.5 text-[13px] text-bvc-muted"
                    }
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate("/teacher/classes/new")}
                className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
              >
                Tạo lớp mới
              </button>
            </>
          }
        />

        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-[22px_32px_26px]">
          <div className="grid grid-cols-4 gap-[12px]">
            <StatCard label="Tổng lớp" value="8" />
            <StatCard label="Đang hoạt động" value="3" variant="ok" />
            <StatCard label="Kết thúc" value="5" variant="surface" />
            <StatCard label="Sinh viên" value="78" />
          </div>

          <div className="flex flex-1 flex-col overflow-hidden rounded-[20px] border border-bvc-border bg-white">
            <div className="grid shrink-0 grid-cols-[1.2fr_2fr_1.2fr_0.8fr_1fr_1.1fr_0.8fr] items-center gap-[14px] border-b border-bvc-border bg-bvc-surface px-[20px] text-[12px] font-bold uppercase tracking-[0.08em] text-bvc-muted h-[46px]">
              <span>Mã lớp</span>
              <span>Tên môn</span>
              <span>Học kỳ</span>
              <span>Sĩ số</span>
              <span>Tuần hiện tại</span>
              <span>Trạng thái</span>
              <span>Hành động</span>
            </div>

            {CLASSES.map((cls) => (
              <div
                key={cls.code}
                className="grid grid-cols-[1.2fr_2fr_1.2fr_0.8fr_1fr_1.1fr_0.8fr] items-center gap-[14px] border-b border-bvc-line px-[20px] text-[14px] last:border-0 h-[54px]"
              >
                <span className="font-semibold text-bvc-ink">{cls.code}</span>
                <span className="text-bvc-ink">{cls.name}</span>
                <span className="text-bvc-muted">{cls.semester}</span>
                <span className="font-mono text-bvc-ink">{cls.students}</span>
                <span className="font-mono text-bvc-ink">{cls.week}</span>
                <span className="flex items-center gap-[6px] text-[13px] text-bvc-ink">
                  {cls.status === "active" ? (
                    <>
                      <span className="size-[7px] shrink-0 rounded-full bg-bvc-ok" />
                      Đang học
                    </>
                  ) : (
                    <>
                      <span className="size-[7px] shrink-0 rounded-full bg-bvc-bar-strong" />
                      Kết thúc
                    </>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/teacher/classes/${cls.code.toLowerCase()}`)}
                  className="cursor-pointer text-[13px] font-semibold text-bvc-accent-text"
                >
                  Xem lớp
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
