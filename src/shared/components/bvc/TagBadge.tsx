import { cn } from "@/shared/utils/cn";

type TagVariant = "verified" | "community" | "pending" | "error" | "ok" | "warn" | "muted";

interface TagBadgeProps {
  label: string;
  variant?: TagVariant;
}

const STYLES: Record<TagVariant, string> = {
  verified: "bg-[#EBF5EE] text-bvc-ok border-[#C8E6D3]",
  community: "bg-bvc-surface text-bvc-muted border-bvc-border",
  pending: "bg-[#FEF8EC] text-[#A07010] border-[#F3D98A]",
  error: "bg-bvc-accent-tint text-bvc-accent-text border-[#F9D2C2]",
  ok: "bg-[#EBF5EE] text-bvc-ok border-[#C8E6D3]",
  warn: "bg-[#FEF8EC] text-[#A07010] border-[#F3D98A]",
  muted: "bg-bvc-surface text-bvc-muted border-bvc-border",
};

export function TagBadge({ label, variant = "muted" }: TagBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[9px] border px-[8px] py-[3px] text-[12px] font-semibold",
        STYLES[variant]
      )}
    >
      {label}
    </span>
  );
}
