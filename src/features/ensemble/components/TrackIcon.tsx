import { Music2 } from "lucide-react";
import { type TrackKey } from "@/features/ensemble/utils/trackTheme";

interface TrackIconProps {
  trackKey: TrackKey;
  size?: number;
}

export function TrackIcon({ trackKey, size = 22 }: TrackIconProps) {
  if (trackKey === "other") return <Music2 size={size} aria-hidden />;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {trackKey === "bau" && (
        <>
          <path d="M9.5 14.5 19 5" />
          <circle cx="6.8" cy="17.2" r="3.2" />
          <path d="M17 3.5l3.5 3.5" />
        </>
      )}
      {trackKey === "nhi" && (
        <>
          <path d="M12 2.5v12.5" />
          <circle cx="12" cy="18.2" r="3.3" />
          <path d="M5 9l14 5.5" />
        </>
      )}
      {trackKey === "sao" && (
        <>
          <path d="M3.5 20.5 20.5 3.5" />
          <circle cx="9.5" cy="14.5" r="0.7" />
          <circle cx="12.3" cy="11.7" r="0.7" />
          <circle cx="15.1" cy="8.9" r="0.7" />
        </>
      )}
      {trackKey === "trong" && (
        <>
          <ellipse cx="12" cy="8" rx="7" ry="3" />
          <path d="M5 8v8c0 1.7 3.1 3 7 3s7-1.3 7-3V8" />
          <path d="M9 11.5v6M15 11.5v6" />
        </>
      )}
    </svg>
  );
}
