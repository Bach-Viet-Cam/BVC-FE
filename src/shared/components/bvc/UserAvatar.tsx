import { cn } from "@/shared/utils/cn";

interface UserAvatarProps {
  name: string;
  size?: "sm" | "md";
  className?: string;
}

function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const letters =
    words.length === 1 ? words[0].slice(0, 2) : `${words[words.length - 2][0]}${words[words.length - 1][0]}`;
  return letters.toUpperCase();
}

export function UserAvatar({ name, size = "md", className }: UserAvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-bvc-accent-tint font-bold text-bvc-accent-text",
        size === "sm" ? "size-[34px] text-[13px]" : "size-9 text-[13px]",
        className
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
