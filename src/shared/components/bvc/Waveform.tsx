interface WaveformBar {
  h: number;
  color?: string;
}

interface WaveformProps {
  bars: WaveformBar[];
  height?: number;
  defaultColor?: string;
}

export function Waveform({
  bars,
  height = 26,
  defaultColor = "var(--color-bvc-bar)",
}: WaveformProps) {
  return (
    <div className="relative flex items-center" style={{ height }}>
      <span className="absolute inset-x-0 top-1/2 h-px bg-bvc-border" />
      <div className="relative flex flex-1 items-center justify-between">
        {bars.map((bar, i) => (
          <span
            key={i}
            className="rounded-[1px]"
            style={{
              width: 2,
              height: `${bar.h}%`,
              backgroundColor: bar.color ?? defaultColor,
            }}
          />
        ))}
      </div>
    </div>
  );
}
