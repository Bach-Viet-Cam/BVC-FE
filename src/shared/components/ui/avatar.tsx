import { type HTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ src, alt, fallback, size = "md", className, ...props }: AvatarProps) {
  return (
    <div
      {...props}
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-surface-container font-semibold text-primary",
        size === "sm" && "size-8 text-xs",
        size === "md" && "size-10 text-sm",
        size === "lg" && "size-12 text-base",
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt ?? ""} className="size-full object-cover" />
      ) : (
        <span>{fallback ?? alt?.slice(0, 2).toUpperCase() ?? "?"}</span>
      )}
    </div>
  );
}
