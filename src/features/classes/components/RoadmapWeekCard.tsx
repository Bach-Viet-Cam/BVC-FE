import { StatusLabel } from "@/features/classes/components/StatusLabel";
import { type ClassRoadmapWeek, type RoadmapWeekStatus } from "@/features/classes/types/roadmapTypes";
import { WEEK_STATUS_LABELS, formatWeekRange } from "@/features/classes/utils/roadmapFormat";
import { cn } from "@/shared/utils/cn";

interface RoadmapWeekCardProps {
  week: ClassRoadmapWeek;
}

const STATUS_TONES: Record<RoadmapWeekStatus, "ok" | "warn" | "muted"> = {
  PAST: "muted",
  CURRENT: "ok",
  UPCOMING: "warn",
};

export function RoadmapWeekCard({ week }: RoadmapWeekCardProps) {
  const isCurrent = week.status === "CURRENT";
  return (
    <article
      aria-current={isCurrent ? "true" : undefined}
      className={cn(
        "flex flex-col gap-[10px] rounded-[18px] border px-[14px] py-[13px]",
        isCurrent ? "border-bvc-ink" : "border-bvc-border"
      )}
    >
      <div className="flex justify-between gap-[10px]">
        <span className="flex min-w-0 flex-col gap-[2px]">
          <span className="text-[15px] font-bold">
            Tuần {week.weekNumber} · {week.title}
          </span>
          <span className="font-bvc-mono text-[12px] text-bvc-muted">{formatWeekRange(week)}</span>
        </span>
        <StatusLabel label={WEEK_STATUS_LABELS[week.status]} tone={STATUS_TONES[week.status]} className="text-[12px]" />
      </div>
      <p className="m-0 whitespace-pre-line text-[13.5px] leading-[1.5]">{week.content}</p>
      {week.exercises.length > 0 && (
        <div className="flex flex-col gap-[6px]">
          <span className="text-[12px] font-semibold text-bvc-muted">Bài luyện ngón</span>
          <ul className="m-0 flex list-none flex-col gap-[4px] p-0">
            {week.exercises.map((exercise) => (
              <li key={exercise.pieceId} className="flex flex-wrap items-center gap-[8px] text-[13.5px]">
                <span>{exercise.title}</span>
                {!exercise.isAvailable && (
                  <span className="rounded-[8px] bg-bvc-accent-tint px-[8px] py-[2px] text-[11.5px] text-bvc-accent-text">
                    Không còn khả dụng
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
