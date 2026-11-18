import { useState } from "react";
import { ChevronDown, MessageSquareText, Star } from "lucide-react";
import { aiRatingApi, type AiRatingHistoryItem } from "@/features/platform/api/aiRatingApi";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";
import { PageHero } from "@/shared/components/bvc/PageHero";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { cn } from "@/shared/utils/cn";

const ROLE_FILTERS = [
  { value: "ALL", label: "Tất cả" },
  { value: "STUDENT", label: "Sinh viên" },
  { value: "LECTURER", label: "Giảng viên" },
];
const dateTime = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

interface RatingScoreProps {
  label: string;
  value: number;
}

function RatingScore({ label, value }: RatingScoreProps) {
  return (
    <div className="min-w-0">
      <dt className="mb-1.5 text-xs text-bvc-muted lg:sr-only">{label}</dt>
      <dd aria-label={`${label}: ${value}/5`} className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="flex gap-0.5" aria-hidden>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              strokeWidth={1.6}
              className={star <= value ? "fill-bvc-gold text-bvc-accent-text" : "text-bvc-border-strong"}
            />
          ))}
        </span>
        <span className="text-sm font-semibold tabular-nums">
          {value}
          <span className="font-normal text-bvc-muted">/5</span>
        </span>
      </dd>
    </div>
  );
}

interface RatingHistoryRowProps {
  item: AiRatingHistoryItem;
}

function RatingHistoryRow({ item }: RatingHistoryRowProps) {
  const lecturer = item.raterRole === 2;
  return (
    <li className="min-w-0 py-5 first:pt-0 lg:first:pt-5">
      <div className="grid min-w-0 gap-x-5 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_150px_150px]">
        <div className="flex min-w-0 items-start gap-3">
          <div
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bvc-soft text-sm font-semibold text-bvc-ink"
          >
            {item.raterName.trim().slice(0, 1).toLocaleUpperCase("vi-VN")}
          </div>
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold leading-5">{item.raterName}</p>
            <p className={cn("mt-1 text-xs", lecturer ? "font-medium text-bvc-accent" : "text-bvc-muted")}>
              {lecturer ? "Giảng viên" : "Sinh viên"}
            </p>
            <time dateTime={item.updatedAt} className="mt-1 block text-xs tabular-nums text-bvc-muted">
              {dateTime.format(new Date(item.updatedAt))}
            </time>
          </div>
        </div>
        <div className="min-w-0">
          <p className="break-words font-semibold">{item.submission.piece.title}</p>
          <p className="mt-1 break-words text-sm text-bvc-muted">
            {item.submission.student.username}
            {item.submission.assignment && ` - ${item.submission.assignment.title}`}
          </p>
          <p className="mt-1 text-xs tabular-nums text-bvc-muted">
            Nộp {dateTime.format(new Date(item.submission.createdAt))}
          </p>
        </div>
        <dl className="col-span-1 grid grid-cols-2 gap-4 lg:col-span-2 lg:gap-5">
          <RatingScore label="Độ chính xác" value={item.accuracyStars} />
          <RatingScore label="Hài lòng" value={item.satisfactionStars} />
        </dl>
      </div>
      {lecturer && item.comment && (
        <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-bvc-ink lg:ml-13">
          <MessageSquareText size={16} aria-hidden className="mt-1 shrink-0 text-bvc-muted" />
          <span className="min-w-0 whitespace-pre-wrap break-words">
            <span className="sr-only">Nhận xét giảng viên: </span>
            {item.comment}
          </span>
        </p>
      )}
      <details className="group mt-2 text-sm lg:ml-13">
        <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 rounded-sm text-bvc-muted underline-offset-4 hover:text-bvc-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bvc-ink [&::-webkit-details-marker]:hidden">
          Phản hồi AI
          <ChevronDown
            size={15}
            aria-hidden
            className="transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>
        <div className="mt-1 rounded-bvc-sm bg-bvc-soft p-4">
          <p className="max-w-prose whitespace-pre-wrap break-words leading-7 text-bvc-ink">{item.feedbackText}</p>
          <p className="mt-3 break-all text-xs text-bvc-muted">Mã bài nộp: {item.submissionId}</p>
        </div>
      </details>
    </li>
  );
}

export function AiRatingHistoryPage() {
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("ALL");
  const state = useAsyncData(() => aiRatingApi.history(page, role), `ai-ratings:${page}:${role}`);
  const pages = Math.max(1, Math.ceil((state.data?.total ?? 0) / 20));
  return (
    <TeacherScreen>
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-6 md:px-8">
        <PageHero title="Đánh giá phản hồi AI" description="Lịch sử chấm sao của sinh viên và giảng viên." />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label="Người đánh giá"
            className="flex max-w-full flex-wrap gap-1 rounded-bvc-md bg-bvc-soft p-1"
          >
            {ROLE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={role === filter.value}
                onClick={() => {
                  setRole(filter.value);
                  setPage(1);
                }}
                className={cn(
                  "min-h-11 rounded-bvc-sm px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bvc-ink sm:px-4 motion-reduce:transition-none",
                  role === filter.value ? "bg-bvc-ink text-white" : "text-bvc-muted hover:bg-white hover:text-bvc-ink"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <span aria-live="polite" className="text-sm tabular-nums text-bvc-muted">
            {state.isLoading ? "Đang tải…" : `${state.data?.total ?? 0} đánh giá`}
          </span>
        </div>
        {state.isLoading ? (
          <p role="status" className="py-8 text-sm text-bvc-muted">
            Đang tải đánh giá…
          </p>
        ) : state.error ? (
          <div role="alert" className="flex flex-wrap items-center gap-3 py-8 text-sm">
            <p>{state.error}</p>
            <ActionButton onClick={state.reload}>Thử lại</ActionButton>
          </div>
        ) : !state.data?.items.length ? (
          <div className="flex flex-col items-center gap-3 border-y border-bvc-border py-14 text-bvc-muted">
            <MessageSquareText size={28} strokeWidth={1.4} aria-hidden />
            <p className="text-sm">Chưa có đánh giá phù hợp.</p>
          </div>
        ) : (
          <div>
            <div
              aria-hidden
              className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_150px_150px] gap-5 border-y border-bvc-border bg-bvc-soft/60 py-3 text-xs font-medium text-bvc-muted lg:grid"
            >
              <span>Người đánh giá</span>
              <span>Bài nộp</span>
              <span>Độ chính xác</span>
              <span>Hài lòng</span>
            </div>
            <ul aria-label="Lịch sử đánh giá AI" className="divide-y divide-bvc-border border-b border-bvc-border">
              {state.data.items.map((item) => (
                <RatingHistoryRow key={item.id} item={item} />
              ))}
            </ul>
          </div>
        )}
        {pages > 1 && (
          <nav aria-label="Phân trang đánh giá AI" className="flex items-center justify-between gap-3">
            <span className="text-sm">
              Trang {page}/{pages}
            </span>
            <div className="flex gap-2">
              <ActionButton
                variant="secondary"
                disabled={state.isLoading || page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Trước
              </ActionButton>
              <ActionButton
                variant="secondary"
                disabled={state.isLoading || page >= pages}
                onClick={() => setPage((value) => value + 1)}
              >
                Sau
              </ActionButton>
            </div>
          </nav>
        )}
      </div>
    </TeacherScreen>
  );
}
