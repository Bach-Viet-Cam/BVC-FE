import { AttentionStudentRow } from "@/features/classes/components/AttentionStudentRow";
import { type AttentionStudent } from "@/features/classes/utils/teacherHomeFormat";

const TOP_COUNT = 5;

interface AttentionStudentsCardProps {
  students: AttentionStudent[];
  onOpenStudent: (student: AttentionStudent) => void;
  onShowAll: () => void;
}

// Home: top students at risk / behind across the running classes; the full list has its own page.
export function AttentionStudentsCard({ students, onOpenStudent, onShowAll }: AttentionStudentsCardProps) {
  return (
    <section className="flex min-w-0 flex-col rounded-[20px] border border-bvc-border bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-bvc-border px-[20px] py-[14px]">
        <span className="flex items-center gap-[8px] text-[15px] font-extrabold tracking-[-0.025em]">
          <span className="size-[7px] shrink-0 rounded-full bg-bvc-warn" />
          Sinh viên cần chú ý
          <span className="font-mono text-[13px] font-semibold text-bvc-muted">{students.length}</span>
        </span>
        <button
          type="button"
          onClick={onShowAll}
          className="flex min-h-[36px] cursor-pointer items-center rounded-[12px] border border-bvc-border-strong bg-white px-[14px] text-[13px] font-semibold text-bvc-ink"
        >
          Xem tất cả
        </button>
      </div>

      {students.length === 0 ? (
        <p className="flex min-h-[52px] items-center px-[20px] text-[14px] text-bvc-muted">
          Không có sinh viên nào cần chú ý.
        </p>
      ) : (
        <ul className="m-0 list-none p-0">
          {students.slice(0, TOP_COUNT).map((student) => (
            <AttentionStudentRow
              key={`${student.classId}:${student.userId}`}
              student={student}
              onOpen={onOpenStudent}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
