import { ListState } from "@/features/classes/components/ListState";
import { type ClassDetail } from "@/features/classes/types/classTypes";

interface ClassWriteGuardProps {
  classDetail: ClassDetail | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  blockedMessage: string;
  children: (classDetail: ClassDetail) => React.ReactNode;
}

// Shows loading/error, and blocks write screens of a finished class (GBR-37) with an MSG-08 text.
export function ClassWriteGuard({
  classDetail,
  isLoading,
  error,
  onRetry,
  blockedMessage,
  children,
}: ClassWriteGuardProps) {
  if (!classDetail || classDetail.isReadOnly) {
    return (
      <div className="px-[18px]">
        <ListState
          isLoading={isLoading}
          error={error}
          isEmpty={Boolean(classDetail?.isReadOnly)}
          emptyMessage={blockedMessage}
          onRetry={onRetry}
        >
          {null}
        </ListState>
      </div>
    );
  }
  return <>{children(classDetail)}</>;
}
