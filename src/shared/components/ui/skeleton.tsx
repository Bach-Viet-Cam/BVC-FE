import { type HTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div {...props} className={cn("animate-pulse rounded-md bg-surface-container", className)} />;
}
