import { Link, useParams } from "react-router-dom";
import { AudioLines } from "lucide-react";
import { ensembleApi } from "@/features/ensemble/api/ensembleApi";
import { type EnsembleSessionDetail } from "@/features/ensemble/types/ensembleTypes";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { formatDateTime } from "@/shared/utils/formatDate";

const STATUS_LABELS: Record<EnsembleSessionDetail["status"], string> = {
  RECORDING: "Đang thu",
  COMPLETED: "Đã lưu",
  FAILED: "Lỗi xử lý",
};

// Nghe lại một phiên hòa tấu đã lưu (GET /ensemble-sessions/:id): bản thu của sinh viên + thông tin phiên
export function EnsemblePlaybackPage() {
  const { sessionId = "" } = useParams();
  const {
    data: session,
    isLoading,
    error,
  } = useAsyncData(
    () => ensembleApi.getSession(sessionId).then(({ data }) => data.data),
    `ensemble-session:${sessionId}`,
    "Tải phiên hòa tấu thất bại. Vui lòng thử lại."
  );

  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[880px] flex-1 flex-col gap-5 px-[18px] pt-5 pb-10 md:px-10 md:pt-8">
        <h1 className="text-[27px] leading-tight font-extrabold tracking-[-0.025em] text-bvc-ink md:text-[40px] md:tracking-[-0.03em]">
          Nghe lại bản hòa tấu
        </h1>

        {isLoading && !session && <p className="text-sm text-bvc-muted">Đang tải phiên hòa tấu...</p>}

        {error && (
          <EmptyState
            icon={<AudioLines className="size-8" strokeWidth={1.5} />}
            title="Không mở được phiên hòa tấu"
            description={error}
            actions={
              <Link to="/library" className={actionButtonClass("primary", "md", "hover:text-white")}>
                Về thư viện
              </Link>
            }
          />
        )}

        {session && (
          <>
            <div className="flex flex-col gap-4 rounded-[20px] border border-bvc-border bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[13px] text-bvc-muted">Lưu lúc {formatDateTime(session.createdAt)}</span>
                <span className="rounded-full bg-bvc-accent-tint px-[10px] py-[3px] text-[12px] font-bold text-bvc-accent-text">
                  {STATUS_LABELS[session.status]}
                </span>
              </div>
              {session.recordingUrl ? (
                <audio controls src={session.recordingUrl} className="w-full">
                  <track kind="captions" />
                </audio>
              ) : (
                <p className="m-0 text-sm text-bvc-muted">Phiên này chưa có bản thu.</p>
              )}
            </div>

            <dl className="m-0 grid grid-cols-2 gap-3">
              <div className="rounded-[16px] bg-bvc-surface p-4">
                <dt className="text-[12.5px] text-bvc-muted">Tempo mục tiêu</dt>
                <dd className="m-0 mt-1 font-bvc-mono text-[20px] font-extrabold text-bvc-ink">
                  {session.targetBpm} BPM
                </dd>
              </div>
              <div className="rounded-[16px] bg-bvc-surface p-4">
                <dt className="text-[12.5px] text-bvc-muted">Thuộc bài tập</dt>
                <dd className="m-0 mt-1 text-[15px] font-bold text-bvc-ink">
                  {session.assignmentId ? "Có" : "Luyện tự do"}
                </dd>
              </div>
            </dl>

            <Link
              to={`/library/${session.pieceId}`}
              className={actionButtonClass("secondary", "md", "w-full sm:w-fit")}
            >
              Về trang bài hát
            </Link>
          </>
        )}
      </div>
    </StudentShell>
  );
}
