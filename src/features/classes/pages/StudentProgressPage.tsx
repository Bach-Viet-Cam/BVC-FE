import { ClassProgressBoard } from "@/features/classes/components/ClassProgressBoard";
import { ListState } from "@/features/classes/components/ListState";
import { useStudentProgress } from "@/features/classes/hooks/useStudentProgress";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";

export function StudentProgressPage() {
  const { classes, classId, setClassId, isLoading, error, reload } = useStudentProgress();

  return (
    <TeacherScreen>
      <header className="flex shrink-0 flex-col gap-[12px] px-[18px] pt-[16px] lg:flex-row lg:items-end lg:justify-between lg:gap-[24px] lg:border-b lg:border-bvc-border-strong lg:px-[32px] lg:pb-[18px] lg:pt-[26px]">
        <div className="flex flex-col gap-[5px]">
          <span className="hidden text-[12px] font-bold uppercase tracking-[0.14em] text-bvc-muted lg:block">
            Lớp học
          </span>
          <h1 className="m-0 text-[25px] font-extrabold tracking-[-0.025em] lg:font-bvc-display lg:text-[29px]">
            Tiến độ sinh viên
          </h1>
        </div>
        {classes.length > 0 && (
          <select
            aria-label="Lớp"
            value={classId ?? ""}
            onChange={(event) => setClassId(event.target.value)}
            className="h-[44px] w-full cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:outline-none lg:w-auto lg:min-w-[200px]"
          >
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        )}
      </header>

      <div className="flex flex-1 flex-col p-[16px_18px_24px] lg:p-[22px_32px_26px]">
        <ListState
          isLoading={isLoading}
          error={error}
          isEmpty={classes.length === 0 || !classId}
          emptyMessage="Bạn chưa phụ trách lớp nào."
          onRetry={reload}
        >
          {classId && <ClassProgressBoard classId={classId} />}
        </ListState>
      </div>
    </TeacherScreen>
  );
}
