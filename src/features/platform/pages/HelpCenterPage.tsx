import { ChevronDown, ChevronLeft, ChevronRight, Download, Search, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { faqApi } from "@/features/platform/api/faqApi";
import { instrumentApi } from "@/features/platform/api/instrumentApi";
import { FAQ_TOPICS } from "@/features/platform/types/faqTypes";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { PageHero } from "@/shared/components/bvc/PageHero";
import { RoleShell } from "@/shared/components/bvc/RoleShell";
import { INPUT_CLASSES } from "@/shared/components/bvc/fieldStyles";
import { FEEDBACK_FORM_URL } from "@/shared/constants/contact";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { usePageMeta } from "@/shared/hooks/usePageMeta";

export function HelpCenterPage() {
  usePageMeta({
    title: "Câu hỏi thường gặp",
    description: "Giải đáp các câu hỏi thường gặp khi luyện tập, nộp bài và sử dụng nền tảng Bách Việt Cầm.",
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const topic = searchParams.get("topic") ?? "";
  const instrumentId = searchParams.get("instrumentId") ?? "";
  const parsedPage = Number(searchParams.get("page") ?? 1);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const debouncedQuery = useDebouncedValue(q);
  const params = {
    q: debouncedQuery,
    ...(topic ? { topic } : {}),
    ...(instrumentId ? { instrumentId } : {}),
    page,
    pageSize: 20,
  };
  const { data, error, isLoading, reload } = useAsyncData(() => faqApi.list(params), `faqs:${JSON.stringify(params)}`);
  const instruments = useAsyncData(
    async () => (await instrumentApi.list({ status: "active", sortBy: "name", sortDir: "asc" })).data.data,
    "faq-active-instruments"
  );
  const updateFilter = (name: string, value: string) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(name, value);
        else next.delete(name);
        if (name !== "page") next.delete("page");
        return next;
      },
      { replace: name === "q" }
    );
  };
  const hasFilters = Boolean(q || topic || instrumentId);
  const stale = isLoading || q !== debouncedQuery;
  const pageCount = Math.max(1, Math.ceil((data?.total ?? 0) / 20));

  const topicLabel = Object.entries(FAQ_TOPICS).find(([value]) => value === topic)?.[1] ?? "Tất cả câu hỏi";
  const instrumentName = instruments.data?.find((item) => item.id === instrumentId)?.name;

  return (
    <RoleShell title="Câu hỏi thường gặp" hideHeader contentClassName="max-w-[1200px] gap-7 md:gap-8">
      <PageHero title="Câu hỏi thường gặp">
        <label className="flex max-w-[640px] flex-col gap-2">
          <span className="text-sm font-medium text-white">Bạn muốn tìm hiểu điều gì?</span>
          <span className="relative block">
            <Search
              size={19}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-bvc-muted"
              aria-hidden
            />
            <input
              type="search"
              aria-label="Tìm câu hỏi hoặc câu trả lời"
              value={q}
              onChange={(event) => updateFilter("q", event.target.value)}
              placeholder="Nhập từ khóa, ví dụ: nộp bài, thu âm..."
              maxLength={300}
              className={`${INPUT_CLASSES} h-12 border-white bg-white pl-11 text-bvc-ink placeholder:text-bvc-muted`}
            />
          </span>
        </label>
      </PageHero>
      <div className="grid min-w-0 gap-6 lg:grid-cols-[224px_minmax(0,1fr)] lg:gap-8">
        <aside
          aria-label="Lọc câu hỏi"
          className="flex min-w-0 flex-col gap-5 border-b border-bvc-border pb-6 lg:border-r lg:border-b-0 lg:pr-6 lg:pb-0"
        >
          <div className="hidden lg:block">
            <h2 className="mb-3 text-sm font-semibold text-bvc-ink">Chủ đề</h2>
            <div className="flex flex-col gap-1">
              {[["", "Tất cả chủ đề"], ...Object.entries(FAQ_TOPICS)].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={topic === value}
                  onClick={() => updateFilter("topic", value)}
                  className={`min-h-11 rounded-[11px] px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bvc-ink ${topic === value ? "bg-bvc-ink font-semibold text-white" : "text-bvc-muted hover:bg-bvc-surface hover:text-bvc-ink"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <label className="flex flex-col gap-2 text-sm font-semibold text-bvc-ink lg:hidden">
              Chủ đề
              <select
                className={INPUT_CLASSES}
                value={topic}
                onChange={(event) => updateFilter("topic", event.target.value)}
              >
                <option value="">Tất cả chủ đề</option>
                {Object.entries(FAQ_TOPICS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <Link
              to="/install"
              className="flex min-h-11 items-center gap-2.5 rounded-[11px] border border-bvc-border-strong bg-white px-3 py-2.5 text-sm leading-snug font-semibold text-bvc-ink transition-colors hover:bg-bvc-surface hover:text-bvc-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bvc-ink sm:order-last sm:col-span-2 lg:order-none lg:col-span-1"
            >
              <Download size={17} className="shrink-0 text-bvc-accent" aria-hidden />
              Hướng dẫn thêm vào màn hình chính
            </Link>
            <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-bvc-ink">
              Nhạc cụ
              <select
                className={`${INPUT_CLASSES} w-full min-w-0`}
                value={instrumentId}
                onChange={(event) => updateFilter("instrumentId", event.target.value)}
                disabled={Boolean(instruments.error)}
              >
                <option value="">Tất cả nhạc cụ</option>
                {instruments.data?.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <span className="text-xs leading-relaxed font-normal text-bvc-muted">
                Khi chọn nhạc cụ, bạn vẫn thấy các hướng dẫn áp dụng cho tất cả nhạc cụ.
              </span>
            </label>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-bvc-ink underline-offset-4 hover:underline"
            >
              <X size={15} aria-hidden />
              Xóa bộ lọc
            </button>
          )}
          {instruments.error && (
            <p role="alert" className="text-sm text-bvc-accent-text">
              Không tải được danh sách nhạc cụ.{" "}
              <button type="button" onClick={instruments.reload} className="min-h-11 underline underline-offset-4">
                Thử lại
              </button>
            </p>
          )}
        </aside>
        <section aria-labelledby="faq-results-title" aria-busy={stale} className="min-w-0">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="faq-results-title" className="text-xl font-semibold tracking-[-0.02em] text-bvc-ink">
                {q ? "Kết quả tìm kiếm" : topicLabel}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-bvc-muted">
                Chọn một câu hỏi để xem câu trả lời.{instrumentName && ` Đang lọc theo ${instrumentName}.`}
              </p>
            </div>
            <p className="shrink-0 rounded-[9px] bg-bvc-surface px-3 py-2 text-sm text-bvc-muted" aria-live="polite">
              {stale ? "Đang tìm..." : `${data?.total ?? 0} câu hỏi`}
            </p>
          </div>
          {stale ? (
            <p role="status" className="py-12 text-center text-sm text-bvc-muted">
              Đang tìm câu trả lời...
            </p>
          ) : error ? (
            <EmptyState
              title="Chưa tải được câu hỏi"
              description={error}
              actions={<ActionButton onClick={reload}>Thử lại</ActionButton>}
            />
          ) : !data?.items.length ? (
            <EmptyState
              title={hasFilters ? "Không tìm thấy câu hỏi phù hợp" : "Chưa có câu hỏi thường gặp"}
              description={hasFilters ? "Thử từ khóa khác hoặc bỏ bớt bộ lọc." : undefined}
              actions={
                hasFilters ? (
                  <ActionButton variant="secondary" onClick={() => setSearchParams({})}>
                    Xóa bộ lọc
                  </ActionButton>
                ) : undefined
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              {data.items.map((item) => (
                <details
                  key={item.id}
                  name="faq-answers"
                  className="group min-w-0 overflow-hidden rounded-[16px] border border-bvc-border-strong bg-white"
                >
                  <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-4 p-4 text-bvc-ink transition-colors hover:bg-bvc-surface/60 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-bvc-ink sm:px-5 [&::-webkit-details-marker]:hidden">
                    <span className="flex min-w-0 flex-col gap-2">
                      <span className="text-xs leading-relaxed text-bvc-muted">Chủ đề: {FAQ_TOPICS[item.topic]}</span>
                      <span className="text-[16px] leading-relaxed font-semibold break-words">{item.question}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs font-medium text-bvc-muted">
                      <span className="hidden sm:inline">
                        <span className="group-open:hidden">Xem trả lời</span>
                        <span className="hidden group-open:inline">Thu gọn</span>
                      </span>
                      <ChevronDown size={18} className="transition-transform group-open:rotate-180" aria-hidden />
                    </span>
                  </summary>
                  <div className="border-t border-bvc-border bg-bvc-surface/65 p-4 sm:px-5 sm:py-5">
                    <h3 className="mb-2 text-sm font-semibold text-bvc-ink">Trả lời</h3>
                    <p className="max-w-[70ch] text-[15px] leading-[1.8] whitespace-pre-wrap break-words text-bvc-ink">
                      {item.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          )}
          {!stale && !error && data && (data.total > 20 || page > 1) && (
            <nav aria-label="Phân trang câu hỏi" className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <ActionButton
                variant="secondary"
                disabled={page <= 1}
                onClick={() => updateFilter("page", String(page - 1))}
              >
                <ChevronLeft size={16} aria-hidden />
                Trang trước
              </ActionButton>
              <span className="text-sm text-bvc-muted">
                Trang {page} / {pageCount}
              </span>
              <ActionButton
                variant="secondary"
                disabled={page >= pageCount}
                onClick={() => updateFilter("page", String(page + 1))}
              >
                Trang sau
                <ChevronRight size={16} aria-hidden />
              </ActionButton>
            </nav>
          )}
        </section>
      </div>
      <p className="border-t border-bvc-border pt-6 text-sm text-bvc-muted">
        Chưa tìm thấy câu trả lời?{" "}
        <a
          href={FEEDBACK_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-bvc-ink underline underline-offset-4"
        >
          Gửi góp ý cho chúng tôi
        </a>
      </p>
    </RoleShell>
  );
}
