import { useState } from "react";
import { MAX_LATENCY_MS } from "@/features/ensemble/utils/latencyComp";

interface LatencyAdjustProps {
  latencyMs: number;
  onCommit: (ms: number) => void;
}

/** Chỉnh bù độ trễ thu: kéo đến khi bản thu nghe khớp bè mẫu. Giá trị được nhớ cho các lần thu sau. */
export function LatencyAdjust({ latencyMs, onCommit }: LatencyAdjustProps) {
  const [draft, setDraft] = useState(latencyMs);

  const commit = () => {
    if (draft !== latencyMs) onCommit(draft);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 px-1 text-[12px] text-bvc-muted">
      <label htmlFor="ensemble-latency" className="shrink-0">
        Bù độ trễ thu: {draft} ms
      </label>
      <input
        id="ensemble-latency"
        type="range"
        min={0}
        max={MAX_LATENCY_MS}
        step={5}
        value={draft}
        onChange={(event) => setDraft(Number(event.target.value))}
        onPointerUp={commit}
        onKeyUp={commit}
        onBlur={commit}
        className="min-w-40 flex-1"
      />
      <span>Nếu bản thu nghe còn trễ so với bè mẫu, kéo sang phải.</span>
    </div>
  );
}
