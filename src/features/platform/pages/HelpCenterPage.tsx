import { Search, Bot, FileText, ChevronRight, MessageCircle, Send } from "lucide-react";
import { MobileHeader } from "@/shared/components/bvc";

const SUGGESTED_QUESTIONS = [
  "Làm thế nào để nộp bài bonus?",
  "Tại sao recording của tôi không được phân tích?",
  "Cách tính điểm accuracy là gì?",
  "Làm sao vào phòng ensemble của nhóm?",
];

export function HelpCenterPage() {
  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        <MobileHeader
          title="Trợ lý Hỗ trợ"
          rightSlot={
            <button type="button" className="text-[13px] font-semibold text-bvc-muted px-2 min-h-[44px]">
              Chuyển GV
            </button>
          }
        />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto flex flex-col" style={{ scrollbarWidth: "none" }}>
          {/* Search bar */}
          <div className="mx-[14px] mt-3 flex items-center gap-2 rounded-[15px] border border-bvc-border-strong bg-white px-[14px] h-[50px]">
            <Search size={18} className="text-bvc-muted shrink-0" />
            <input
              type="text"
              placeholder="Hỏi bất cứ điều gì..."
              className="flex-1 text-[15px] outline-none placeholder:text-bvc-faint text-bvc-ink bg-transparent"
            />
          </div>

          {/* Suggested questions */}
          <div className="px-[14px] mt-4">
            <div className="text-[12px] font-bold uppercase tracking-[0.1em] text-bvc-muted mb-2">
              Câu hỏi thường gặp
            </div>
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                className="border border-bvc-border-strong rounded-[14px] px-4 py-[10px] text-[13px] text-bvc-ink mb-2 w-full text-left cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat messages */}
          <div className="px-[14px] mt-4 flex flex-col gap-3 pb-2">
            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-[75%] bg-bvc-ink text-white rounded-[16px_16px_4px_16px] px-[14px] py-[10px] text-[14px]">
                Tại sao recording của tôi không được phân tích?
              </div>
            </div>

            {/* AI response */}
            <div className="flex justify-start">
              <div className="max-w-[80%] flex flex-col gap-1">
                {/* Bot avatar + first bubble */}
                <div className="flex items-end gap-2">
                  <div className="size-[28px] rounded-full bg-bvc-surface border border-bvc-border flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-bvc-ink" />
                  </div>
                  <div className="bg-bvc-surface rounded-[4px_16px_16px_16px] px-[14px] py-[10px] text-[14px] text-bvc-ink">
                    Có một số lý do phổ biến:
                  </div>
                </div>

                {/* Follow-up bubble */}
                <div className="ml-[36px] bg-bvc-surface rounded-[16px] px-[14px] py-[10px] text-[13px] text-bvc-muted whitespace-pre-line">
                  {"1. File quá lớn (> 50 MB)\n2. Định dạng không được hỗ trợ\n3. Hàng đợi AI đang bận — thử lại sau 5 phút"}
                </div>

                {/* Source chip */}
                <div className="ml-[36px] self-start border border-bvc-border rounded-[9px] px-2 py-1 text-[11px] text-bvc-muted flex items-center gap-1">
                  <FileText size={11} className="shrink-0" />
                  Quy định môn học · mục 3.2
                </div>
              </div>
            </div>
          </div>

          {/* Escalation card */}
          <div className="mx-[14px] my-3 border border-bvc-border rounded-[18px] p-[13px] flex items-center gap-3">
            <div className="size-[40px] rounded-full border border-bvc-border-strong flex items-center justify-center shrink-0">
              <MessageCircle size={18} className="text-bvc-ink" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[13px] font-bold text-bvc-ink">Câu hỏi vượt phạm vi?</span>
              <span className="text-[12px] text-bvc-muted">Chuyển sang Mentor hoặc giảng viên</span>
            </div>
            <ChevronRight size={18} className="text-bvc-muted shrink-0" />
          </div>
        </div>

        {/* Sticky input bar */}
        <div className="shrink-0 px-[14px] pb-5 pt-3 border-t border-bvc-line flex items-center gap-2">
          <input
            type="text"
            placeholder="Nhập câu hỏi..."
            className="flex-1 h-[46px] rounded-[14px] border border-bvc-border-strong px-4 text-[14px] placeholder:text-bvc-faint text-bvc-ink outline-none"
          />
          <button
            type="button"
            className="size-[46px] rounded-[14px] bg-bvc-ink flex items-center justify-center shrink-0"
            aria-label="Gửi"
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
