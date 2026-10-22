import { useNavigate, useParams } from "react-router-dom";
import { ListState } from "@/features/classes/components/ListState";
import { useInstruments } from "@/features/classes/hooks/useInstruments";
import { useLecturerClasses } from "@/features/classes/hooks/useLecturerClasses";
import { ChallengeForm } from "@/features/community/components/ChallengeForm";
import { useChallengeFormData } from "@/features/community/hooks/useChallengeFormData";
import { TeacherPageHeader } from "@/shared/components/bvc/TeacherPageHeader";
import { TeacherScreen } from "@/shared/components/bvc/TeacherScreen";

const LIST_PATH = "/teacher/challenges";

export function ChallengeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { meta, challenge, isLoading, error, reload } = useChallengeFormData(id);
  const { classes, isLoading: isClassesLoading } = useLecturerClasses();
  const { instruments, isLoading: isInstrumentsLoading } = useInstruments();
  const isPageLoading = isLoading || isClassesLoading || isInstrumentsLoading;
  const isReady = !isPageLoading && !error && meta && (!isEdit || challenge);

  return (
    <TeacherScreen>
      <TeacherPageHeader
        title={isEdit ? "Sửa thử thách" : "Tạo thử thách"}
        subtitle={challenge?.title}
        onBack={() => navigate(LIST_PATH)}
      />
      {isReady ? (
        <ChallengeForm
          key={challenge?.id ?? "new"}
          challenge={challenge}
          classes={classes}
          instruments={instruments}
          defaultMinAccuracy={meta.defaultMinAccuracy}
          maxSubmissionsDefault={meta.maxSubmissionsDefault}
        />
      ) : (
        <div className="px-[18px] lg:px-[32px] lg:pt-[22px]">
          <ListState isLoading={isPageLoading} error={error} isEmpty={false} emptyMessage="" onRetry={reload}>
            {null}
          </ListState>
        </div>
      )}
    </TeacherScreen>
  );
}
