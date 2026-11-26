import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import { ChallengeStatusBadge } from "@/features/community/components/ChallengeStatusBadge";
import { useStudentChallenges } from "@/features/community/hooks/useStudentChallenges";
import { formatWeekRange } from "@/features/community/utils/challengeFormat";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { Pagination } from "@/shared/components/bvc/Pagination";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { PageTitle } from "@/shared/components/bvc/PageTitle";

// M04 Thử thách cộng đồng (sinh viên)
export function ChallengesPage() {
  const { items, page, totalPages, setPage, isLoading, error, reload } = useStudentChallenges();

  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-5 px-[18px] pt-5 pb-10 md:px-14 md:pt-8">
        <PageTitle>Thử thách cộng đồng</PageTitle>

        {isLoading && items.length === 0 ? (
          <div className="flex justify-center py-20">
            <span className="size-6 animate-spin rounded-full border-2 border-bvc-accent border-t-transparent" />
          </div>
        ) : error ? (
          <EmptyState
            icon={<Trophy className="size-8" strokeWidth={1.5} />}
            title={error}
            actions={
              <button type="button" onClick={reload} className={actionButtonClass("primary", "md")}>
                Thử lại
              </button>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Trophy className="size-8" strokeWidth={1.5} />}
            title="Chưa có thử thách nào"
            actions={
              <Link to="/community/leaderboard" className={actionButtonClass("primary", "md", "hover:text-white")}>
                Xem bảng xếp hạng
              </Link>
            }
          />
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((challenge) => (
                <li key={challenge.id}>
                  <Link
                    to={`/community/challenges/${challenge.id}`}
                    className="flex h-full flex-col gap-3 rounded-2xl border border-bvc-border bg-white p-4 transition-colors hover:bg-bvc-surface"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-[16px] leading-snug font-semibold text-bvc-ink">{challenge.title}</h2>
                      <ChallengeStatusBadge status={challenge.displayStatus} />
                    </div>
                    <p className="text-[13px] text-bvc-muted">
                      {[challenge.piece?.title, challenge.instrument?.name].filter(Boolean).join(" · ")}
                    </p>
                    <div className="mt-auto flex items-center justify-between text-[12.5px] text-bvc-muted">
                      {challenge.startsAt && challenge.endsAt ? (
                        <span>{formatWeekRange(challenge.startsAt, challenge.endsAt)}</span>
                      ) : (
                        <span />
                      )}
                      <span>
                        {challenge.usedSubmissions}/{challenge.maxSubmissions} lượt
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </StudentShell>
  );
}
