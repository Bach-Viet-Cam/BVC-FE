import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cn } from "@/shared/utils/cn";

type SwitchProps = React.ComponentProps<typeof BaseSwitch.Root> & {
  size?: "sm" | "md";
};

export function Switch({ className, size = "md", ...props }: SwitchProps) {
  const isSm = size === "sm";
  return (
    <BaseSwitch.Root
      {...props}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full bg-surface-container transition-colors",
        "hover:bg-outline-variant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "data-checked:bg-primary",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        isSm ? "h-4 w-7.5" : "h-6 w-11",
        className
      )}
    >
      <BaseSwitch.Thumb
        className={cn(
          "block rounded-full bg-white shadow transition-transform duration-200",
          isSm
            ? "size-3 translate-x-0.5 data-checked:translate-x-[15px]"
            : "size-5 translate-x-0.5 data-checked:translate-x-[22px]"
        )}
      />
    </BaseSwitch.Root>
  );
}

