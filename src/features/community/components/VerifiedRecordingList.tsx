import { useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Music2, ChevronDown } from "lucide-react";
import { verifiedApi } from "@/features/community/api/verifiedApi";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { AuthenticatedAudio } from "@/shared/components/bvc/AuthenticatedAudio";
import { SectionTitle } from "@/shared/components/bvc/SectionTitle";
import { useAuth } from "@/shared/context/AuthContext";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

interface VerifiedRecordingListProps {
  pieceId: string;
  instrumentId: string;
  sourceSheetMusicId?: string;
}

function SignedInRecordings({ pieceId, instrumentId, sourceSheetMusicId }: VerifiedRecordingListProps) {
  const [page, setPage] = useState(1);
  const result = useAsyncData(
    () => verifiedApi.library(pieceId, instrumentId, page, sourceSheetMusicId),
    `library-verified:${pieceId}:${instrumentId}:${sourceSheetMusicId ?? "all"}:${page}`
  );
  const totalPages = Math.max(1, Math.ceil((result.data?.total ?? 0) / (result.data?.pageSize ?? 6)));

  return (
    <section className="flex min-w-0 flex-col gap-4 border-t border-bvc-border pt-6" aria-label="Bản thu tham khảo">
      <div className="flex flex-col gap-1.5">
        <SectionTitle>Bản thu tham khảo</SectionTitle>
        <p className="max-w-[65ch] text-sm leading-relaxed text-bvc-muted">
          Bản biểu diễn của sinh viên, được giảng viên xác minh.
        </p>
      </div>
      {result.isLoading ? (
        <p role="status" className="py-4 text-sm text-bvc-muted">
          Đang tải bản thu tham khảo...
        </p>
      ) : result.error ? (
        <div role="alert" className="flex flex-col items-start gap-3 py-4">
          <p className="text-sm text-bvc-muted">Không tải được bản thu tham khảo. {result.error}</p>
          <ActionButton variant="secondary" onClick={result.reload}>
            Thử lại
          </ActionButton>
        </div>
      ) : !result.data?.items.length ? (
        <p className="rounded-bvc-xl bg-bvc-surface p-5 text-sm text-bvc-muted">
          Chưa có bản thu đã xác minh cho bản nhạc này.
        </p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {result.data.items.map((item) => (
            <li
              key={item.id}
              className="flex min-w-0 flex-col gap-4 rounded-bvc-lg border border-bvc-border bg-white p-5"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-bvc-surface text-bvc-ink">
                  <Music2 size={20} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-[17px] font-semibold text-bvc-ink">{item.performerDisplayName}</h3>
                  <p className="mt-1 text-sm text-bvc-muted">
                    {item.instrument.name}
                    {item.cohort ? ` · ${item.cohort}` : ""}
                  </p>
                </div>
                <BadgeCheck size={18} className="mt-1 shrink-0 text-bvc-accent" aria-label="Giảng viên đã xác minh" />
              </div>
              <AuthenticatedAudio
                key={item.id}
                endpoint={`/library/verified-recordings/${item.id}/audio`}
                label={`Nghe bản thu của ${item.performerDisplayName}`}
              />
              <details className="group border-t border-bvc-border pt-3 text-sm">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-bvc-muted [&::-webkit-details-marker]:hidden">
                  Chi tiết bản thu
                  <ChevronDown
                    size={16}
                    aria-hidden
                    className="transition-transform group-open:rotate-180 motion-reduce:transition-none"
                  />
                </summary>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 pb-3 text-sm">
                  <dt className="text-bvc-muted">Bài nhạc</dt>
                  <dd className="min-w-0 break-words">{item.pieceTitle}</dd>
                  <dt className="text-bvc-muted">Xác minh bởi</dt>
                  <dd className="min-w-0 break-words">{item.verifiedByDisplayName}</dd>
                  <dt className="text-bvc-muted">Ngày xác minh</dt>
                  <dd>{new Date(item.verifiedAt).toLocaleDateString("vi-VN")}</dd>
                  {item.accuracy !== null && (
                    <>
                      <dt className="text-bvc-muted">Độ chính xác AI</dt>
                      <dd className="tabular-nums">{Number(item.accuracy.toFixed(1))}%</dd>
                    </>
                  )}
                </dl>
                <Link
                  to={`/library/${item.pieceId}/sheets/${item.sourceSheetMusicId}`}
                  className="inline-flex min-h-11 items-center text-sm font-medium text-bvc-ink underline underline-offset-4"
                >
                  Xem bản nhạc
                </Link>
              </details>
            </li>
          ))}
        </ul>
      )}
      {totalPages > 1 && (
        <nav aria-label="Phân trang bản thu tham khảo" className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-bvc-muted">
            Trang{" "}
            <span className="font-bvc-mono">
              {page} / {totalPages}
            </span>
          </span>
          <div className="flex gap-2">
            <ActionButton
              variant="secondary"
              disabled={page <= 1 || result.isLoading}
              onClick={() => setPage(page - 1)}
            >
              Trước
            </ActionButton>
            <ActionButton
              variant="secondary"
              disabled={page >= totalPages || result.isLoading}
              onClick={() => setPage(page + 1)}
            >
              Sau
            </ActionButton>
          </div>
        </nav>
      )}
    </section>
  );
}

export function VerifiedRecordingList(props: VerifiedRecordingListProps) {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <SignedInRecordings
      key={`${props.pieceId}:${props.instrumentId}:${props.sourceSheetMusicId ?? "all"}`}
      {...props}
    />
  );
}
