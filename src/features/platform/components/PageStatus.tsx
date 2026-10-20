interface PageStatusProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  children: React.ReactNode;
}

export function PageStatus({ isLoading, error, onRetry, children }: PageStatusProps) {
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-[14px] text-bvc-muted">
        Đang tải dữ liệu...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-[12px]">
        <p className="text-[14px] text-bvc-accent-text">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="min-h-[42px] cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white px-[16px] text-[14px] font-semibold text-bvc-ink"
        >
          Thử lại
        </button>
      </div>
    );
  }
  return <>{children}</>;
}
