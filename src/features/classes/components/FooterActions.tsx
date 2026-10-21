interface FooterActionsProps {
  children: React.ReactNode;
}

export function FooterActions({ children }: FooterActionsProps) {
  return (
    <div className="sticky bottom-0 z-10 flex shrink-0 gap-[10px] border-t border-bvc-border bg-white px-[18px] pb-[24px] pt-[12px]">
      {children}
    </div>
  );
}
