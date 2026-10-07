import { MobileHeader } from "@/shared/components/bvc/MobileHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TopRow {
  rank: number;
  name: string;
  score: string;
  isMe: boolean;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const CHALLENGE = {
  title: "Lý ngựa ô — Thử thách tuần 39",
  status: "Đang diễn ra",
  bpmTarget: "120",
  deadline: "30/09",
  participants: 47,
};

const REQUIREMENTS = [
  "Độ chính xác cao độ ≥ 85%",
  "BPM: 120 ± 5",
  "Không dùng metronome hỗ trợ",
  "Bài: Lý ngựa ô — bè chính",
];

const TOP_5: TopRow[] = [
  { rank: 1, name: "Phương Linh", score: "94%", isMe: false },
  { rank: 2, name: "Minh Anh", score: "92%", isMe: false },
  { rank: 3, name: "Hoàng Tùng", score: "89%", isMe: false },
  { rank: 4, name: "Gia Hân", score: "84%", isMe: false },
  { rank: 5, name: "Quốc Bảo", score: "71%", isMe: false },
];

const MY_STATUS = {
  rank: "#12",
  total: 47,
  delta: "+3 so với hôm qua",
  bestRecording: "82%",
};

// ─────────────────────────────────────────────────────────────────────────────

export function ChallengeDetailPage() {
  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">

        {/* Header */}
        <MobileHeader title="Chi tiết Challenge" variant="back" />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-[14px] pb-[88px]">

          {/* Header card */}
          <div className="rounded-[20px] bg-bvc-surface p-[16px]">
            <div className="flex items-start justify-between gap-[8px]">
              <p className="text-[17px] font-extrabold leading-tight tracking-[-0.025em] text-bvc-ink">
                {CHALLENGE.title}
              </p>
              <span className="shrink-0 rounded-[9px] bg-bvc-accent-tint px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-bvc-accent-text">
                {CHALLENGE.status}
              </span>
            </div>

            {/* Stats grid */}
            <div className="mt-[14px] grid grid-cols-3 gap-[8px]">
              <div className="rounded-[12px] bg-white p-[10px] text-center">
                <p className="font-mono text-[16px] font-bold text-bvc-ink">
                  {CHALLENGE.bpmTarget}
                </p>
                <p className="mt-[2px] text-[11px] text-bvc-muted">
                  BPM target
                </p>
              </div>
              <div className="rounded-[12px] bg-white p-[10px] text-center">
                <p className="font-mono text-[15px] font-bold text-bvc-ink">
                  {CHALLENGE.deadline}
                </p>
                <p className="mt-[2px] text-[11px] text-bvc-muted">Thời hạn</p>
              </div>
              <div className="rounded-[12px] bg-white p-[10px] text-center">
                <p className="font-mono text-[16px] font-bold text-bvc-ink">
                  {CHALLENGE.participants}
                </p>
                <p className="mt-[2px] text-[11px] text-bvc-muted">Tham gia</p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="mt-[12px] rounded-[20px] border border-bvc-border p-[14px]">
            <p className="mb-[10px] text-[15px] font-bold text-bvc-ink">
              Yêu cầu
            </p>
            <div className="flex flex-col gap-[8px]">
              {REQUIREMENTS.map((req) => (
                <div key={req} className="flex items-start gap-2">
                  <span className="mt-[8px] size-[5px] shrink-0 rounded-full bg-bvc-ink" />
                  <span className="text-[14px] leading-relaxed text-bvc-ink">
                    {req}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 leaderboard */}
          <div className="mt-[12px] rounded-[20px] border border-bvc-border p-[14px]">
            <p className="mb-[10px] text-[15px] font-bold text-bvc-ink">
              Top 5 hiện tại
            </p>
            <div className="flex flex-col gap-[2px]">
              {TOP_5.map((row) => (
                <div
                  key={row.rank}
                  className={`flex h-[44px] items-center gap-[12px] px-[8px] ${
                    row.isMe ? "rounded-[10px] bg-bvc-accent-tint" : ""
                  }`}
                >
                  <span className="w-[20px] shrink-0 font-mono text-[13px] text-bvc-muted">
                    {row.rank}
                  </span>
                  <span className="flex-1 text-[14px] text-bvc-ink">
                    {row.name}
                  </span>
                  <span className="font-mono text-[14px] font-bold text-bvc-ink">
                    {row.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* My status */}
          <div className="mt-[12px] rounded-[20px] border border-bvc-border p-[14px]">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-bvc-ink">
                Hạng của bạn: {MY_STATUS.rank} / {MY_STATUS.total}
              </span>
              <span className="text-[13px] text-bvc-ok">{MY_STATUS.delta}</span>
            </div>
            <div className="mt-[8px] flex items-center gap-[6px]">
              <span className="text-[13px] text-bvc-muted">
                Bản thu tốt nhất:
              </span>
              <span className="font-mono text-[13px] font-bold text-bvc-ink">
                {MY_STATUS.bestRecording}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom sticky CTA */}
        <div className="shrink-0 px-[14px] pb-5 pt-3">
          <button
            type="button"
            className="flex h-[54px] w-full cursor-pointer items-center justify-center rounded-[16px] bg-bvc-accent text-[16px] font-bold text-white"
          >
            Thu bài mới
          </button>
        </div>
      </div>
    </div>
  );
}
