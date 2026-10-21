import type { SubdivisionKey } from "@/features/practice/types/practiceTypes";

interface NoteIconProps {
  kind: SubdivisionKey;
  className?: string;
}

const FLAG_PATHS = ["M12.2 3 C12.2 8 18 9 17.5 14", "M12.2 7 C12.2 12 18 13 17.5 18"];
const FLAG_COUNT: Record<SubdivisionKey, number> = { white: 0, black: 0, half: 1, quarter: 2 };

// Nốt trắng (đầu rỗng), nốt đen, móc đơn (1 đuôi), móc kép (2 đuôi)
export function NoteIcon({ kind, className }: NoteIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <ellipse
        cx="8"
        cy="18"
        rx="4.2"
        ry="3"
        transform="rotate(-20 8 18)"
        fill={kind === "white" ? "none" : "currentColor"}
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M12.2 17 V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {FLAG_PATHS.slice(0, FLAG_COUNT[kind]).map((path) => (
        <path key={path} d={path} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ))}
    </svg>
  );
}
