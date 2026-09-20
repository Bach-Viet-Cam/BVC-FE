import * as React from "react";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export const Accordion = BaseAccordion.Root;
export const AccordionItem = BaseAccordion.Item;
export const AccordionHeader = BaseAccordion.Header;

type AccordionTriggerProps = React.ComponentProps<typeof BaseAccordion.Trigger>;

export function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  return (
    <BaseAccordion.Header>
      <BaseAccordion.Trigger
        {...props}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md px-4 py-3 text-left text-sm font-semibold text-on-surface transition-colors",
          "hover:bg-primary/5 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          "group data-disabled:cursor-not-allowed data-disabled:opacity-50",
          className
        )}
      >
        {children}
        <ChevronDownIcon className="size-4 shrink-0 text-on-surface-variant transition-transform duration-200 group-data-[open]:rotate-180" />
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  );
}

type AccordionPanelProps = React.ComponentProps<typeof BaseAccordion.Panel>;

export function AccordionPanel({ className, ...props }: AccordionPanelProps) {
  return (
    <BaseAccordion.Panel
      {...props}
      className={cn(
        "overflow-hidden px-4 transition-all duration-200",
        "data-starting-style:h-0 data-starting-style:opacity-0",
        "data-ending-style:h-0 data-ending-style:opacity-0",
        className
      )}
    />
  );
}
