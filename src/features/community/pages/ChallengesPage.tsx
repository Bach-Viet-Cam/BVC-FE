import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";

import { MobileHeader } from "@/shared/components/bvc/MobileHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PastChallenge {
  id: string;
  title: string;
  winner: string;
  score: string;
  date: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const ACTIVE_CHALLENGE = {
  id: "c1",
  title: "Lý ngựa ô — Thử thách tuần 39",
  bpm: 120,
  scoreTarget: "85%+",
  countdown: "Còn 3 ngày 14 giờ",
  participants: 47,
  myRank: "#12",
};

const PAST_CHALLENGES: PastChallenge[] = [
  {
    id: "c2",
    title: "Trống cơm — Tuần 38",
    winner: "Phương Linh",
    score: "97%",
    date: "14/09",
  },
  {
    id: "c3",
    title: "Scale La thứ — Tuần 37",
    winner: "Minh Anh",
    score: "95%",
    date: "07/09",
  },
  {
    id: "c4",
    title: "Lý con sáo — Tuần 36",
    winner: "Hoàng Tùng",
    score: "93%",
    date: "31/08",
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export function ChallengesPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">

        {/* Header */}
        <MobileHeader title="Community Challenges" variant="back" />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-[14px] pb-[16px]">

          {/* Active challenge card */}
          <button
            type="button"
            onClick={() =>
              navigate(`/community/challenges/${ACTIVE_CHALLENGE.id}`)
            }
            className="w-full cursor-pointer rounded-[22px] border-2 border-bvc-border-strong p-[16px] text-left"
          >
            {/* Status chip */}
            <div className="mb-[10px] inline-flex items-center rounded-[9px] bg-bvc-accent-tint px-2 py-0.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-bvc-accent-text">
                Đang diễn ra
              </span>
            </div>

            {/* Title */}
            <p className="text-[18px] font-extrabold leading-tight tracking-[-0.025em] text-bvc-ink">
              {ACTIVE_CHALLENGE.title}
            </p>

            {/* BPM + Score */}
            <p className="mt-[8px] font-mono text-[13px] text-bvc-muted">
              BPM: {ACTIVE_CHALLENGE.bpm} · Score: {ACTIVE_CHALLENGE.scoreTarget}
            </p>

            {/* Countdown */}
            <p className="mt-[4px] text-[13px] text-bvc-muted">
              {ACTIVE_CHALLENGE.countdown}
            </p>

            {/* Stats */}
            <p className="mt-[10px] text-[13px] font-medium text-bvc-ink">
              {ACTIVE_CHALLENGE.participants} người tham gia · Hạng của bạn:{" "}
              {ACTIVE_CHALLENGE.myRank}
            </p>
          </button>

          {/* Past challenges section */}
          <div className="mt-[20px] flex items-center gap-[10px]">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-bvc-muted">
              Đã kết thúc
            </span>
            <div className="h-px flex-1 bg-bvc-line" />
          </div>

          <div className="mt-[10px] flex flex-col gap-[8px]">
            {PAST_CHALLENGES.map((challenge) => (
              <div
                key={challenge.id}
                className="rounded-[18px] border border-bvc-border p-[14px] opacity-60"
              >
                <div className="flex items-start justify-between gap-[8px]">
                  <p className="text-[14px] font-bold text-bvc-ink">
                    {challenge.title}
                  </p>
                  <span className="shrink-0 text-[12px] text-bvc-muted">
                    {challenge.date}
                  </span>
                </div>
                <div className="mt-[6px] flex items-center gap-[6px]">
                  <Trophy
                    size={13}
                    className="shrink-0 text-bvc-muted"
                    strokeWidth={1.8}
                  />
                  <span className="text-[12px] text-bvc-muted">
                    Top: {challenge.winner} · {challenge.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
