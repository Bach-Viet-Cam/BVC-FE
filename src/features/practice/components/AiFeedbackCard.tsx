import { AlertTriangle, Sparkles } from "lucide-react";
import type { QualityWarning, ResultFeedback } from "@/features/practice/types/practiceResultTypes";
import { feedbackParagraphs } from "@/features/practice/utils/resultFormat";
import { cn } from "@/shared/utils/cn";

interface AiFeedbackCardProps {
  feedback: ResultFeedback;
  warnings: QualityWarning[];
}

// Nhận xét do AI tạo kèm cảnh báo chất lượng bản thu. Khi AI chưa trả lời, BE gửi câu dự phòng: hiện nhạt hơn.
export function AiFeedbackCard({ feedback, warnings }: AiFeedbackCardProps) {
  const paragraphs = feedbackParagraphs(feedback.text);

  return (
    <section className="flex flex-col gap-3 rounded-bvc-xl border border-bvc-border bg-white p-4 md:rounded-[22px] md:p-5.5">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-bvc-soft text-bvc-ink">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <div className="flex flex-col">
          <h2 className="text-sm leading-tight font-bold text-bvc-ink">Đánh giá chi tiết từ AI</h2>
          <span className="text-[11px] font-medium text-bvc-faint">Phân tích bản thu tự động</span>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-col gap-2 rounded-xl border border-bvc-border bg-bvc-soft p-3.5 text-[13px] leading-relaxed text-bvc-muted",
          feedback.isFallback && "italic text-bvc-faint"
        )}
      >
        {paragraphs.map((parts, index) => (
          <p key={index}>
            {parts.map((part, partIndex) =>
              part.strong ? (
                <strong key={partIndex} className="font-semibold text-bvc-ink">
                  {part.text}
                </strong>
              ) : (
                <span key={partIndex}>{part.text}</span>
              )
            )}
          </p>
        ))}
      </div>

      {warnings.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {warnings.map((warning) => (
            <li key={warning.code} className="flex items-start gap-2 text-[12px] leading-snug text-bvc-muted">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-bvc-dot-warn" aria-hidden />
              {warning.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
