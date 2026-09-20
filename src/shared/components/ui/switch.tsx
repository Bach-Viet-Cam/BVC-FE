import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cn } from "@/shared/utils/cn";

type SwitchProps = React.ComponentProps<typeof BaseSwitch.Root>;

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <BaseSwitch.Root
      {...props}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full bg-surface-container transition-colors",
        "hover:bg-outline-variant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "data-checked:bg-primary",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
    >
      <BaseSwitch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow transition-transform duration-200 data-checked:translate-x-[22px]" />
    </BaseSwitch.Root>
  );
}
