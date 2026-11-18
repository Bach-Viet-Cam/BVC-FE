import { type ReactNode } from "react";
import { StatCard } from "@/shared/components/bvc/StatCard";
import { type ClassPractice, type PracticeStats } from "@/features/classes/types/teacherAssignmentTypes";
import {
  PRACTICE_STAT_LABELS,
  PRACTICE_TEXT,
  formatAverage,
  formatPracticedRatio,
  practicedPercent,
} from "@/features/classes/utils/assignmentDetailFormat";
import { formatDayMonth } from "@/features/classes/utils/assignmentOverviewFormat";

interface AssignmentPracticeStatsProps {
  stats: PracticeStats;
  byClass?: ClassPractice[];
  children?: ReactNode;
}

const CHART_HEIGHT = 140;

export function AssignmentPracticeStats({ stats, byClass, children }: AssignmentPracticeStatsProps) {
  const maxCount = Math.max(1, ...stats.last7Days.map((day) => day.count));

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-3">
        <StatCard label={PRACTICE_STAT_LABELS.total} value={stats.totalPractices} />
        <StatCard
          label={PRACTICE_STAT_LABELS.students}
          value={formatPracticedRatio(stats.practicedStudents, stats.memberCount)}
        />
        <StatCard label={PRACTICE_STAT_LABELS.average} value={formatAverage(stats.averagePerStudent)} />
      </div>
      <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-[1.25fr_1fr]">
        <section className="flex min-w-0 flex-col gap-[12px]">
          {byClass ? (
            <>
              <h3 className="m-0 text-[13.5px] font-extrabold">{PRACTICE_TEXT.byClass}</h3>
              <ul className="m-0 flex list-none flex-col gap-[10px] p-0">
                {byClass.map((item) => {
                  const percent = practicedPercent(item.practicedStudents, item.memberCount);
                  return (
                    <li
                      key={item.classId}
                      className="flex flex-col gap-[8px] rounded-bvc-lg border border-bvc-border px-[14px] py-[12px]"
                    >
                      <div className="flex items-baseline gap-[10px] text-[13.5px]">
                        <span className="min-w-0 grow truncate font-semibold">{item.className}</span>
                        <span className="font-bvc-mono text-bvc-muted">
                          {item.practicedStudents} / {item.memberCount} SV
                        </span>
                        <span className="font-bvc-mono font-semibold">{percent}%</span>
                      </div>
                      <div className="h-[6px] overflow-hidden rounded-full bg-bvc-surface">
                        <div className="h-full rounded-full bg-bvc-accent" style={{ width: `${percent}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            children
          )}
        </section>
        <section className="flex min-w-0 flex-col gap-[12px]">
          <h3 className="m-0 text-[13.5px] font-extrabold">{PRACTICE_TEXT.last7Days}</h3>
          <div className="flex items-end gap-[8px] rounded-bvc-lg border border-bvc-border px-[14px] pb-[10px] pt-[14px]">
            {stats.last7Days.map((day) => (
              <div key={day.date} data-testid="practice-bar" className="flex flex-1 flex-col items-center gap-[6px]">
                <span className="font-bvc-mono text-[12px] font-semibold">{day.count}</span>
                <div className="flex items-end" style={{ height: CHART_HEIGHT }}>
                  <div
                    className="w-[22px] rounded-t-[6px] bg-bvc-accent"
                    style={{ height: day.count === 0 ? 3 : Math.max(6, (day.count / maxCount) * CHART_HEIGHT) }}
                  />
                </div>
                <span className="font-bvc-mono text-[11.5px] text-bvc-muted">{formatDayMonth(day.date)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
