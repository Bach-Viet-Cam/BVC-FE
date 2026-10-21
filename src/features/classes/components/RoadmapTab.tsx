import { ListState } from "@/features/classes/components/ListState";
import { RoadmapWeekCard } from "@/features/classes/components/RoadmapWeekCard";
import { useClassRoadmap } from "@/features/classes/hooks/useClassRoadmap";

interface RoadmapTabProps {
  classId: string;
  isClassFinished?: boolean;
}

// Finished classes are never backfilled (spec Q4), so they get their own message (user decision 16/10).
const FINISHED_NO_ROADMAP_MESSAGE = "Lớp đã kết thúc và không có lộ trình.";
const NO_ROADMAP_MESSAGE = "Lớp chưa có lộ trình. Lộ trình sẽ được gắn khi quản trị viên tạo lộ trình cho nhạc cụ này.";

// Read-only roadmap of the class (UC-11): the pinned version, six 7-day weeks.
export function RoadmapTab({ classId, isClassFinished = false }: RoadmapTabProps) {
  const { classRoadmap, isLoading, error, reload } = useClassRoadmap(classId);
  const roadmap = classRoadmap?.roadmap ?? null;

  return (
    <div className="flex grow flex-col gap-[10px] px-[18px] pb-[12px] pt-[14px]">
      <ListState
        isLoading={isLoading}
        error={error}
        isEmpty={!roadmap}
        emptyMessage={isClassFinished ? FINISHED_NO_ROADMAP_MESSAGE : NO_ROADMAP_MESSAGE}
        onRetry={reload}
        skeletonCount={6}
      >
        {roadmap && (
          <>
            <span className="text-[12.5px] text-bvc-muted">Lộ trình · Phiên bản v{roadmap.version}</span>
            <div className="grid gap-[10px] lg:grid-cols-2">
              {roadmap.weeks.map((week) => (
                <RoadmapWeekCard key={week.weekNumber} week={week} />
              ))}
            </div>
          </>
        )}
      </ListState>
    </div>
  );
}
