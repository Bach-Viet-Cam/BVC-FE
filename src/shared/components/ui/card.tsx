import { type HTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-level-1",
        className
      )}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div {...props} className={cn("mb-4 flex flex-col gap-1", className)} />;
}

export function CardTitle({ className, ...props }: CardProps) {
  return <h3 {...props} className={cn("text-xl font-semibold text-on-surface", className)} />;
}

export function CardContent({ className, ...props }: CardProps) {
  return <div {...props} className={cn("flex flex-col gap-4", className)} />;
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div {...props} className={cn("mt-4 flex items-center justify-end gap-2", className)} />
  );
}
