import { ClassProgressBoard } from "@/features/classes/components/ClassProgressBoard";
import { ListState } from "@/features/classes/components/ListState";
import { useStudentProgress } from "@/features/classes/hooks/useStudentProgress";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";
import { Eyebrow } from "@/shared/components/bvc/SectionIntro";
import { PageTitle } from "@/shared/components/bvc/PageTitle";

export function StudentProgressPage() {
  const { classes, classId, setClassId, isLoading, error, reload } = useStudentProgress();

  return (
    <TeacherScreen>
      <header className="flex shrink-0 flex-col gap-[12px] px-[18px] pt-[16px] lg:flex-row lg:items-end lg:justify-between lg:gap-[24px] lg:border-b lg:border-bvc-border lg:px-[32px] lg:pt-[28px] lg:pb-[20px]">
        <div className="flex flex-col gap-[5px]">
          <Eyebrow className="hidden lg:inline-flex">Lớp học</Eyebrow>
          <PageTitle>Tiến độ sinh viên</PageTitle>
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
