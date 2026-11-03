import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ListState } from "@/features/classes/components/ListState";
import { useInstruments } from "@/features/classes/hooks/useInstruments";
import { useLecturerClasses } from "@/features/classes/hooks/useLecturerClasses";
import { ChallengeForm } from "@/features/community/components/ChallengeForm";
import { useChallengeFormData } from "@/features/community/hooks/useChallengeFormData";
import { LeaveConfirmDialog } from "@/shared/components/bvc/LeaveConfirmDialog";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";
import { type DraftFormHandle, useLeaveGuard } from "@/shared/hooks/useLeaveGuard";

const LIST_PATH = "/teacher/challenges";

// Sửa thử thách bản nháp (tạo mới mở bằng modal ChallengeCreateDialog)
export function ChallengeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { meta, challenge, isLoading, error, reload } = useChallengeFormData(id);
  const { classes, isLoading: isClassesLoading } = useLecturerClasses();
  const { instruments, isLoading: isInstrumentsLoading } = useInstruments();
  const [isDirty, setIsDirty] = useState(false);
  const formRef = useRef<DraftFormHandle>(null);
  const isDraft = challenge?.status === "DRAFT";
  const { guard, confirmProps } = useLeaveGuard({
    isDirty,
    onSaveDraft: isDraft ? async () => (await formRef.current?.saveDraft()) ?? false : undefined,
  });
  const isPageLoading = isLoading || isClassesLoading || isInstrumentsLoading;
  const isReady = !isPageLoading && !error && meta && challenge;
  const leave = () => guard(() => navigate(LIST_PATH));

  return (
    <TeacherScreen>
      <TeacherPageHeader title="Sửa thử thách" subtitle={challenge?.title} onBack={leave} />
      {isReady ? (
        <ChallengeForm
          key={challenge.id}
          ref={formRef}
          challenge={challenge}
          classes={classes}
          instruments={instruments}
          defaultMinAccuracy={meta.defaultMinAccuracy}
          maxSubmissionsDefault={meta.maxSubmissionsDefault}
          onCancel={leave}
          onSaved={() => {
            setIsDirty(false);
            navigate(LIST_PATH, { replace: true });
          }}
          onDirtyChange={setIsDirty}
        />
      ) : (
        <div className="px-[18px] lg:px-[32px] lg:pt-[22px]">
          <ListState isLoading={isPageLoading} error={error} isEmpty={false} emptyMessage="" onRetry={reload}>
            {null}
          </ListState>
        </div>
      )}
      <LeaveConfirmDialog {...confirmProps} />
    </TeacherScreen>
  );
}
