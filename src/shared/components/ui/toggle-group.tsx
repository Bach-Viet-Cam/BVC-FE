import * as React from "react";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { cn } from "@/shared/utils/cn";

type ToggleGroupRootProps = React.ComponentProps<typeof BaseToggleGroup>;

export function ToggleGroup({ className, ...props }: ToggleGroupRootProps) {
  return (
    <BaseToggleGroup
      {...props}
      className={cn("inline-flex items-center gap-1 rounded-lg bg-surface-container p-1", className)}
    />
  );
}

export { ToggleGroupItem } from "@/shared/components/ui/toggle";
