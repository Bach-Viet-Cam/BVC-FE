import { type ReactNode } from "react";
import { X } from "lucide-react";
import { ListState } from "@/features/classes/components/ListState";
import { DRAWER_TABS, DRAWER_TEXT } from "@/features/classes/utils/assignmentDetailFormat";
import { Sheet, SheetClose, SheetPopup, SheetTitle } from "@/shared/components/ui/sheet";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/shared/components/ui/tabs";

const PADDING = "px-[18px] lg:px-[36px]";

export type DetailDrawerTabs = Record<(typeof DRAWER_TABS)[number]["value"], ReactNode>;

interface DetailDrawerFrameProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

// The Sheet popup both drawers slide in from the right.
export function DetailDrawerFrame({ open, onClose, children }: DetailDrawerFrameProps) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetPopup
        side="right"
        showCloseButton={false}
        backdropClassName="bg-bvc-ink/32 backdrop-blur-none"
        className="w-full max-w-none gap-0 overflow-hidden rounded-none border-0 bg-white p-0 font-bvc-sans text-bvc-ink shadow-[-12px_0_36px_rgba(18,63,51,0.16)] lg:w-[1040px]"
      >
        {children}
      </SheetPopup>
    </Sheet>
  );
}

interface DetailDrawerShellProps {
  overline: string;
  tabsLabel: string;
  title: string;
  meta: ReactNode;
  state: { isLoading: boolean; error: string | null; onRetry: () => void };
  tabs: DetailDrawerTabs | null;
  footer: ReactNode;
}

// Header, tabs, scrolling body and footer of the right-hand detail drawers (assignments, challenges).
export function DetailDrawerShell({ overline, tabsLabel, title, meta, state, tabs, footer }: DetailDrawerShellProps) {
  return (
    <Tabs defaultValue="practice" className="flex min-h-0 grow flex-col">
      <header
        className={`flex shrink-0 flex-col gap-[16px] border-b border-bvc-border pt-[22px] lg:pt-[26px] ${PADDING}`}
      >
        <div className="flex items-start gap-[14px]">
          <div className="flex min-w-0 grow flex-col gap-[6px]">
            <span className="text-[12px] font-bold tracking-[0.12em] text-bvc-muted uppercase">{overline}</span>
            <SheetTitle className="m-0 text-[22px] leading-[1.2] font-extrabold tracking-[-0.025em] lg:text-[28px]">
              {title}
            </SheetTitle>
            {meta && <div className="flex flex-wrap items-center gap-[10px] text-[13px] text-bvc-muted">{meta}</div>}
          </div>
          <SheetClose
            aria-label={DRAWER_TEXT.close}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-bvc-xl border border-bvc-border-strong bg-white text-bvc-ink hover:bg-bvc-surface"
          >
            <X size={18} strokeWidth={2} aria-hidden="true" />
          </SheetClose>
        </div>
        <TabsList aria-label={tabsLabel} className="flex gap-[4px] overflow-x-auto rounded-none bg-transparent p-0">
          {DRAWER_TABS.map((tab) => (
            <TabsTab
              key={tab.value}
              value={tab.value}
              className="min-h-[48px] shrink-0 cursor-pointer rounded-none border-b-[3px] border-transparent px-[16px] text-[14px] font-semibold whitespace-nowrap text-bvc-muted hover:text-bvc-ink data-selected:border-bvc-ink data-selected:bg-transparent data-selected:font-bold data-selected:text-bvc-ink data-selected:shadow-none lg:px-[20px] lg:text-[15px]"
            >
              {tab.label}
            </TabsTab>
          ))}
        </TabsList>
      </header>
      <div className={`min-h-0 grow overflow-y-auto pt-[22px] pb-[26px] lg:pt-[28px] lg:pb-[30px] ${PADDING}`}>
        {tabs ? (
          DRAWER_TABS.map((tab) => (
            <TabsPanel key={tab.value} value={tab.value} className="pt-0">
              {tabs[tab.value]}
            </TabsPanel>
          ))
        ) : (
          <ListState
            isLoading={state.isLoading}
            error={state.error}
            isEmpty={false}
            emptyMessage=""
            onRetry={state.onRetry}
          >
            {null}
          </ListState>
        )}
      </div>
      {tabs && footer && (
        <footer
          className={`flex shrink-0 flex-wrap items-center gap-[10px] border-t border-bvc-border pt-[14px] pb-[16px] lg:pt-[16px] lg:pb-[18px] ${PADDING}`}
        >
          {footer}
        </footer>
      )}
    </Tabs>
  );
}
