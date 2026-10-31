import { type TodaySubmissions } from "@/features/classes/utils/teacherHomeFormat";

function KindCount({ label, count, memberCount }: { label: string; count: number | null; memberCount: number }) {
  return (
    <div className="flex w-[92px] shrink-0 flex-col items-end gap-[2px]">
      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-bvc-muted">{label}</span>
      {count === null ? (
        <span className="text-[13px] text-bvc-muted" title="Lớp chưa có bài tập đang mở">
          -
        </span>
      ) : (
        <span className="font-mono text-[15px] font-semibold text-bvc-ink">
          {count}
          <span className="text-[12px] font-normal text-bvc-muted">/{memberCount}</span>
        </span>
      )}
    </div>
  );
}

// One running class: how many students submitted the solo / ensemble assignment today.
export function TodaySubmissionRow({ row }: { row: TodaySubmissions }) {
  return (
    <li className="flex min-h-[56px] items-center gap-3 border-b border-bvc-line px-[20px] py-[8px] last:border-0">
      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <span className="truncate text-[14px] font-semibold text-bvc-ink">{row.className}</span>
        <span className="truncate text-[12.5px] text-bvc-muted">
          {row.cohort} · {row.memberCount} sinh viên
        </span>
      </div>
      <KindCount label="Độc tấu" count={row.solo} memberCount={row.memberCount} />
      <KindCount label="Hòa tấu" count={row.ensemble} memberCount={row.memberCount} />
    </li>
  );
}
