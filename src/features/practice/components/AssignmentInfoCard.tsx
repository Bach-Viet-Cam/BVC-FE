import { SAMPLE } from "@/features/practice/constants/practiceConstants";

interface AssignmentInfoCardProps {
  left: number;
}

const ROW_CLASS = "flex items-baseline justify-between gap-3 border-b border-bvc-border-strong/60 py-3 text-sm";

// Thẻ "Bài tập" chỉ có ở bố cục laptop (từ lg), tóm tắt thông tin bài tập đang làm
export function AssignmentInfoCard({ left }: AssignmentInfoCardProps) {
  const rows = [
    { label: "Lớp", value: SAMPLE.className },
    { label: "Nhạc cụ", value: SAMPLE.instrument },
    { label: "Bài", value: SAMPLE.lesson },
    { label: "Hạn nộp", value: SAMPLE.deadline },
    { label: "Lượt nộp còn lại", value: String(left) },
    { label: "Tốc độ yêu cầu", value: `${SAMPLE.targetBpm} BPM` },
  ];

  return (
    <section className="hidden flex-col rounded-[22px] border border-bvc-border bg-bvc-panel p-5.5 lg:flex">
      <span className="text-[11.5px] font-bold tracking-[0.12em] text-bvc-muted uppercase">Bài tập</span>
      <dl className="mt-2 flex flex-col">
        {rows.map((row) => (
          <div key={row.label} className={ROW_CLASS}>
            <dt className="text-bvc-muted">{row.label}</dt>
            <dd className="text-right font-semibold text-bvc-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
