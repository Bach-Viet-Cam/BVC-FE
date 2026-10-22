import { useState } from "react";
import { X } from "lucide-react";
import { usePracticeDemo } from "@/features/practice/context/PracticeDemoContext";
import type { DemoFlags } from "@/features/practice/types/practiceTypes";
import { cn } from "@/shared/utils/cn";

const TOGGLES_A: { key: keyof DemoFlags; label: string }[] = [
  { key: "expired", label: "Quá hạn / hết lượt nộp" },
  { key: "micDenied", label: "Từ chối quyền micro" },
  { key: "otherProc", label: "Đang có bản nộp khác xử lý" },
  { key: "noPitch", label: "Nhạc cụ không có cao độ" },
];

const TOGGLES_B: { key: keyof DemoFlags; label: string }[] = [
  { key: "weakNet", label: "Mạng yếu khi tải lên" },
  { key: "qcFail", label: "Kiểm tra chất lượng thất bại" },
  { key: "autoStop", label: "Tự dừng ở cuối bài" },
  { key: "leaveProc", label: "Rời màn hình xử lý" },
];

const INVALID_OPTS = [
  { value: "none", label: "Không" },
  { value: "format", label: "Định dạng" },
  { value: "size", label: "Dung lượng" },
  { value: "duration", label: "Thời lượng" },
] as const;

const AI_OPTS = [
  { value: "none", label: "Không" },
  { value: "once", label: "Lỗi 1 lần" },
  { value: "always", label: "Lỗi liên tục" },
] as const;

const JOB_OPTS = [
  { value: 1, label: "Phân tích" },
  { value: 2, label: "So sánh" },
  { value: 3, label: "Tổng hợp" },
] as const;

function Switch({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "relative block h-[26px] w-11 shrink-0 rounded-[13px]",
        on ? "bg-bvc-accent" : "bg-bvc-border-strong"
      )}
    >
      <span
        className="absolute top-[3px] size-5 rounded-full bg-white transition-[left]"
        style={{ left: on ? 21 : 3 }}
      />
    </span>
  );
}

function SegmentGroup<T extends string | number>({
  title,
  options,
  value,
  onPick,
}: {
  title: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onPick: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-semibold text-bvc-ink">{title}</span>
      <div className="flex gap-1 rounded-bvc-md bg-bvc-surface p-0.75">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onPick(option.value)}
            className={cn(
              "min-h-10 flex-1 cursor-pointer rounded-[10px] text-[13px]",
              option.value === value ? "bg-bvc-ink font-semibold text-white" : "text-bvc-muted"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DemoPanel() {
  const [open, setOpen] = useState(false);
  const { demo, toggleDemoFlag, setDemoFlag, resetDemo } = usePracticeDemo();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 cursor-pointer rounded-full border border-bvc-warn bg-bvc-accent-tint px-3 py-1.5 text-[13px] font-bold text-bvc-accent-text"
      >
        Demo
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Đóng bảng demo"
            onClick={() => setOpen(false)}
            className="absolute inset-0 z-[70] cursor-pointer bg-bvc-ink/40"
          />
          <div className="absolute inset-x-0 top-[70px] bottom-0 z-[80] flex flex-col overflow-y-auto rounded-t-3xl bg-white md:inset-x-auto md:top-1/2 md:left-1/2 md:bottom-auto md:max-h-[80dvh] md:w-130 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:shadow-[0_12px_40px_rgba(18,63,51,0.18)]">
            <div className="flex items-center gap-2 px-4 pt-5 pb-3">
              <span className="flex-1 text-[18px] font-extrabold text-bvc-ink">Demo</span>
              <button
                type="button"
                onClick={resetDemo}
                className="cursor-pointer rounded-bvc-sm border border-bvc-border-strong px-3 py-2 text-[13px] font-semibold text-bvc-ink"
              >
                Đặt lại
              </button>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setOpen(false)}
                className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-bvc-ink"
              >
                <X size={20} strokeWidth={1.8} />
              </button>
            </div>

            <div className="flex flex-col gap-4 px-4 pb-8">
              <div className="flex flex-col">
                {TOGGLES_A.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={Boolean(demo[item.key])}
                    onClick={() => toggleDemoFlag(item.key)}
                    className="flex min-h-12 cursor-pointer items-center justify-between border-b border-bvc-surface text-left text-sm text-bvc-ink"
                  >
                    {item.label}
                    <Switch on={Boolean(demo[item.key])} />
                  </button>
                ))}
              </div>

              <SegmentGroup
                title="File không hợp lệ"
                options={INVALID_OPTS}
                value={demo.invalid}
                onPick={(value) => setDemoFlag("invalid", value)}
              />

              <div className="flex flex-col">
                {TOGGLES_B.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={Boolean(demo[item.key])}
                    onClick={() => toggleDemoFlag(item.key)}
                    className="flex min-h-12 cursor-pointer items-center justify-between border-b border-bvc-surface text-left text-sm text-bvc-ink"
                  >
                    {item.label}
                    <Switch on={Boolean(demo[item.key])} />
                  </button>
                ))}
              </div>

              <SegmentGroup
                title="AI lỗi hoặc chạy quá 1 phút"
                options={AI_OPTS}
                value={demo.aiMode}
                onPick={(value) => setDemoFlag("aiMode", value)}
              />

              <SegmentGroup
                title="Bước bị lỗi"
                options={JOB_OPTS}
                value={demo.failJob}
                onPick={(value) => setDemoFlag("failJob", value)}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
