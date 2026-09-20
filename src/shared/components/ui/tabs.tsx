import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cn } from "@/shared/utils/cn";

export const Tabs = BaseTabs.Root;

type TabsListProps = React.ComponentProps<typeof BaseTabs.List>;

export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <BaseTabs.List
      {...props}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-surface-container p-1",
        className
      )}
    />
  );
}

type TabsTabProps = React.ComponentProps<typeof BaseTabs.Tab>;

export function TabsTab({ className, ...props }: TabsTabProps) {
  return (
    <BaseTabs.Tab
      {...props}
      className={cn(
        "rounded-md px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors",
        "hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "data-selected:bg-surface-container-lowest data-selected:text-primary data-selected:shadow-sm",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
    />
  );
}

type TabsPanelProps = React.ComponentProps<typeof BaseTabs.Panel>;

export function TabsPanel({ className, ...props }: TabsPanelProps) {
  return (
    <BaseTabs.Panel
      {...props}
      className={cn(
        "pt-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        className
      )}
    />
  );
}

export const TabsIndicator = BaseTabs.Indicator;
