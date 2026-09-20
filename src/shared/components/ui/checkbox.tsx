import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { CheckIcon } from "lucide-react";
import { cn } from "@/shared/utils/cn";

type CheckboxProps = React.ComponentProps<typeof BaseCheckbox.Root>;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <BaseCheckbox.Root
      {...props}
      className={cn(
        "flex size-5 items-center justify-center rounded border border-outline-variant bg-surface-container-lowest transition-colors",
        "hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "data-checked:border-primary data-checked:bg-primary data-checked:text-white",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
    >
      <BaseCheckbox.Indicator className="flex items-center justify-center data-unchecked:hidden">
        <CheckIcon className="size-3.5" strokeWidth={3} />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}
