import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, actions, className }: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center gap-3 rounded-bvc-xl bg-bvc-surface px-6 py-12 text-center text-bvc-ink",
        className
      )}
    >
      {icon && (
        <span className="flex size-16 items-center justify-center rounded-full bg-white text-bvc-accent shadow-sm">
          {icon}
        </span>
      )}
      <p className="font-bvc-display text-lg font-semibold tracking-[-0.02em] md:text-xl">{title}</p>
      {description && <p className="max-w-md text-sm leading-relaxed text-bvc-muted">{description}</p>}
      {actions && <div className="mt-1 flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  );
}
