import { useState } from "react";
import { Check, Music } from "lucide-react";
import { ListState } from "@/features/classes/components/ListState";
import { useClassList } from "@/features/classes/hooks/useClassList";
import { useClassRoadmap } from "@/features/classes/hooks/useClassRoadmap";
import { type RoadmapWeekStatus } from "@/features/classes/types/roadmapTypes";
import { WEEK_STATUS_LABELS, buildExerciseRows, formatWeekRange } from "@/features/classes/utils/roadmapFormat";
import { DesktopPageHeader } from "@/shared/components/bvc";

const WEEK_CARD_CLASSES: Record<RoadmapWeekStatus, string> = {
  CURRENT: "border-bvc-accent bg-bvc-accent-tint",
  PAST: "border-bvc-border bg-bvc-surface",
  UPCOMING: "border-bvc-border bg-white",
};

const STATUS_DOT_CLASSES: Record<RoadmapWeekStatus, string> = {
  PAST: "bg-bvc-ok",
  CURRENT: "bg-bvc-warn",
  UPCOMING: "bg-bvc-bar-strong",
};

const NO_CLASS_MESSAGE = "Bạn chưa có lớp nào.";
const FINISHED_NO_ROADMAP_MESSAGE = "Lớp đã kết thúc và không có lộ trình.";
const NO_ROADMAP_MESSAGE = "Lớp chưa có lộ trình. Lộ trình sẽ được gắn khi quản trị viên tạo lộ trình cho nhạc cụ này.";

// Read-only roadmap of a class; the lecturer edits nothing here (roadmaps are managed by the admin).
export function RoadmapPage() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const classList = useClassList({ status: "ALL" });
  const classes = classList.result?.items ?? [];
  const selectedClass =
    classes.find((cls) => cls.id === selectedClassId) ??
    classes.find((cls) => cls.status === "ACTIVE") ??
    classes[0] ??
    null;
  const {
    classRoadmap,
    isLoading: isRoadmapLoading,
    error: roadmapError,
    reload: reloadRoadmap,
  } = useClassRoadmap(selectedClass?.id ?? null);

  const roadmap = classRoadmap?.roadmap ?? null;
  const exerciseRows = roadmap ? buildExerciseRows(roadmap.weeks) : [];
  const emptyMessage = !selectedClass
    ? NO_CLASS_MESSAGE
    : selectedClass.status === "ENDED"
      ? FINISHED_NO_ROADMAP_MESSAGE
      : NO_ROADMAP_MESSAGE;

  return (
    <>
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopPageHeader
          breadcrumb={selectedClass ? `${selectedClass.name} · ${selectedClass.cohort}` : "Lộ trình học tập"}
          title="Lộ trình học tập 6 tuần"
          actions={
            <select
              aria-label="Chọn lớp"
              value={selectedClass?.id ?? ""}
              onChange={(event) => setSelectedClassId(event.target.value)}
              disabled={classes.length === 0}
              className="h-[44px] max-w-[320px] rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:outline-none"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} · {cls.cohort}
                </option>
              ))}
            </select>
          }
        />

        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-[22px_32px_26px]">
          <ListState
            isLoading={classList.isLoading || isRoadmapLoading}
            error={classList.error ?? roadmapError}
            isEmpty={!roadmap}
            emptyMessage={emptyMessage}
            onRetry={() => {
              classList.reload();
              reloadRoadmap();
            }}
            skeletonCount={4}
          >
            {roadmap && (
              <>
                <div className="grid grid-cols-6 gap-[14px]">
                  {roadmap.weeks.map((week) => (
                    <div
                      key={week.weekNumber}
                      aria-current={week.status === "CURRENT" ? "true" : undefined}
                      className={`flex flex-col gap-[10px] rounded-[20px] border p-[14px] ${WEEK_CARD_CLASSES[week.status]}`}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-bvc-muted">
                          Tuần {week.weekNumber}
                        </span>
                        {week.status === "PAST" && (
                          <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-bvc-ok">
                            <Check size={11} color="white" />
                          </span>
                        )}
                        {week.status === "CURRENT" && <span className="size-[7px] rounded-full bg-bvc-accent" />}
                      </div>

                      <div
                        className={`text-[13px] font-bold ${week.status === "CURRENT" ? "text-bvc-accent-text" : "text-bvc-ink"}`}
                      >
                        {week.title}
                      </div>
                      <span className="font-mono text-[11.5px] text-bvc-muted">{formatWeekRange(week)}</span>

                      <p className="whitespace-pre-line text-[12px] leading-[1.5] text-bvc-muted">{week.content}</p>

                      {week.exercises.map((exercise) => (
                        <div key={exercise.pieceId} className="flex items-center gap-[6px]">
                          <Music size={14} className="shrink-0 text-bvc-muted" />
                          <span className="text-[12px] font-semibold text-bvc-ink">{exercise.title}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col overflow-hidden rounded-[20px] border border-bvc-border bg-white">
                  <div className="border-b border-bvc-border px-[20px] py-[14px]">
                    <span className="text-[15px] font-extrabold tracking-[-0.025em]">Bài luyện ngón theo tuần</span>
                    <span className="ml-[10px] text-[12.5px] text-bvc-muted">Phiên bản v{roadmap.version}</span>
                  </div>

                  <div className="grid h-[40px] grid-cols-[0.5fr_2fr_1fr_1fr] items-center gap-[14px] border-b border-bvc-border bg-bvc-surface px-[20px] text-[12px] font-bold uppercase tracking-[0.08em] text-bvc-muted">
                    <span>Tuần</span>
                    <span>Bài luyện ngón</span>
                    <span>Loại</span>
                    <span>Trạng thái</span>
                  </div>

                  {exerciseRows.length === 0 ? (
                    <p className="flex min-h-[44px] items-center px-[20px] text-[13px] text-bvc-muted">
                      Lộ trình chưa gắn bài luyện ngón nào.
                    </p>
                  ) : (
                    exerciseRows.map((row) => (
                      <div
                        key={row.key}
                        className="grid h-[44px] grid-cols-[0.5fr_2fr_1fr_1fr] items-center gap-[14px] border-b border-bvc-line px-[20px] text-[13px] last:border-0"
                      >
                        <span className="font-mono text-bvc-muted">{row.weekNumber}</span>
                        <span className="text-bvc-ink">
                          {row.title}
                          {!row.isAvailable && (
                            <span className="ml-[8px] rounded-[8px] bg-bvc-accent-tint px-[8px] py-[2px] text-[11.5px] text-bvc-accent-text">
                              Không còn khả dụng
                            </span>
                          )}
                        </span>
                        <span className="text-bvc-muted">Luyện ngón</span>
                        <span className="flex items-center gap-[6px] text-bvc-ink">
                          <span className={`size-[7px] shrink-0 rounded-full ${STATUS_DOT_CLASSES[row.status]}`} />
                          {WEEK_STATUS_LABELS[row.status]}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </ListState>
        </div>
      </main>
    </>
  );
}
