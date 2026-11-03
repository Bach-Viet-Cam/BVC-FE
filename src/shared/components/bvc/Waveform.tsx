interface WaveformBar {
  h: number;
  color?: string;
}

interface WaveformProps {
  bars: WaveformBar[];
  height?: number;
  defaultColor?: string;
}

export function Waveform({ bars, height = 26, defaultColor = "var(--color-bvc-bar)" }: WaveformProps) {
  return (
    <div className="relative flex w-full min-w-0 items-center overflow-hidden" style={{ height }}>
      <span className="absolute inset-x-0 top-1/2 h-px bg-bvc-border" />
      <div className="relative flex h-full min-w-0 flex-1 items-center justify-between gap-px">
        {bars.map((bar, i) => (
          <span
            key={i}
            className="rounded-[1px]"
            style={{
              flex: "1 1 0",
              minWidth: 0,
              maxWidth: 3,
              height: `${bar.h}%`,
              backgroundColor: bar.color ?? defaultColor,
            }}
          />
        ))}
      </div>
    </div>
  );
}
