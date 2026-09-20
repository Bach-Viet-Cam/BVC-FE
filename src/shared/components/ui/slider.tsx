import * as React from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { cn } from "@/shared/utils/cn";

type SliderProps = React.ComponentProps<typeof BaseSlider.Root>;

export function Slider({ className, ...props }: SliderProps) {
  return (
    <BaseSlider.Root
      {...props}
      className={cn(
        "relative flex w-full touch-none items-center select-none",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        "data-[orientation=vertical]:h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
    >
      <BaseSlider.Control className="flex w-full touch-none items-center select-none data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col">
        <BaseSlider.Track className="relative h-1.5 w-full grow rounded-full bg-surface-container data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5">
          <BaseSlider.Indicator className="absolute rounded-full bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full" />
          <BaseSlider.Thumb className="block size-4 rounded-full bg-surface-container-lowest shadow ring-1 ring-outline-variant transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary data-dragging:bg-primary data-[orientation=vertical]:mx-auto" />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
