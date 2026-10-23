interface FooterActionsProps {
  children: React.ReactNode;
}

export function FooterActions({ children }: FooterActionsProps) {
  return (
    <div className="sticky bottom-0 z-10 mt-auto flex shrink-0 gap-[10px] border-t border-bvc-border bg-white px-[18px] pb-[24px] pt-[12px] lg:justify-end lg:px-[32px] lg:py-[16px] lg:[&>*]:min-w-[140px] lg:[&>*]:flex-none">
      {children}
    </div>
  );
}
