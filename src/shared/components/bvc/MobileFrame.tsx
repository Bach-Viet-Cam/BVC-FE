interface MobileFrameProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileFrame({ children, className = "" }: MobileFrameProps) {
  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className={`flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white ${className}`}>
        {children}
      </div>
    </div>
  );
}
