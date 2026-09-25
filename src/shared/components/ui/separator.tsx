import * as React from "react";
import { Separator as BaseSeparator } from "@base-ui/react/separator";
import { cn } from "@/shared/utils/cn";

type SeparatorProps = React.ComponentProps<typeof BaseSeparator>;

export function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  return (
    <BaseSeparator
      orientation={orientation}
      {...props}
      className={cn("bg-outline-variant/40", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className)}
    />
  );
}
