import * as React from "react";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { cn } from "@/shared/utils/cn";

type ToggleProps = React.ComponentProps<typeof BaseToggle>;

export function Toggle({ className, ...props }: ToggleProps) {
  return (
    <BaseToggle
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold text-on-surface-variant transition-colors",
        "hover:bg-primary/5 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "data-pressed:bg-primary/10 data-pressed:text-primary",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
    />
  );
}

export const ToggleGroup = BaseToggleGroup;

type ToggleGroupItemProps = React.ComponentProps<typeof BaseToggle>;

export function ToggleGroupItem({ className, ...props }: ToggleGroupItemProps) {
  return (
    <BaseToggle
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold text-on-surface-variant transition-colors",
        "hover:bg-primary/5 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "data-pressed:bg-primary data-pressed:text-white",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
    />
  );
}
