import { Sparkles } from "lucide-react";
import { RESULT_MOCK } from "@/features/practice/constants/resultsMockData";

// Nhận xét chi tiết do AI tạo (dữ liệu mẫu)
export function AiFeedbackCard() {
  const { version, paragraphs } = RESULT_MOCK.aiFeedback;

  return (
    <section className="flex flex-col gap-3 rounded-bvc-xl border border-bvc-border bg-white p-4 md:rounded-[22px] md:p-5.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-bvc-soft text-bvc-ink">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <div className="flex flex-col">
            <h2 className="text-sm leading-tight font-bold text-bvc-ink">Đánh giá chi tiết từ AI</h2>
            <span className="text-[11px] font-medium text-bvc-faint">Phân tích bản thu tự động</span>
          </div>
        </div>
        <span className="rounded-full bg-bvc-soft px-2 py-0.5 text-[11px] font-semibold text-bvc-ink">{version}</span>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-bvc-border bg-bvc-soft p-3.5 text-[13px] leading-relaxed text-bvc-muted">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.strong}>
            {paragraph.lead}
            <strong className="font-semibold text-bvc-ink">{paragraph.strong}</strong>
            {paragraph.tail}
          </p>
        ))}
      </div>
    </section>
  );
}
