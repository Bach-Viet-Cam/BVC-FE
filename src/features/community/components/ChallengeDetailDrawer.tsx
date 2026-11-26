import { useState } from "react";
import { Link } from "react-router-dom";
import { AssignmentMediaTab } from "@/features/classes/components/AssignmentMediaTab";
import { AssignmentPracticeStats } from "@/features/classes/components/AssignmentPracticeStats";
import { AssignmentStudentRow } from "@/features/classes/components/AssignmentStudentRow";
import { DetailDrawerFrame, DetailDrawerShell } from "@/features/classes/components/DetailDrawerShell";
import { studentsHeading } from "@/features/classes/utils/assignmentDetailFormat";
import { ChallengeInfoTab } from "@/features/community/components/ChallengeInfoTab";
import { ChallengeStatusBadge } from "@/features/community/components/ChallengeStatusBadge";
import { useChallengeDetail } from "@/features/community/hooks/useChallengeDetail";
import { type Challenge, type ChallengeDetail } from "@/features/community/types/challenge";
import { CHALLENGE_DETAIL_TEXT, challengeWeekText } from "@/features/community/utils/challengeFormat";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";

interface ChallengeDetailDrawerProps {
  challengeId: string | null;
  onClose: () => void;
  onDelete: (challenge: Challenge) => void;
}

// Right-hand drawer over the challenge list, modelled on the assignment drawer:
// practice stats with the students, the sheet & media, and the configuration.
export function ChallengeDetailDrawer({ challengeId, onClose, onDelete }: ChallengeDetailDrawerProps) {
  // Keep the last id while the drawer animates out.
  const [lastId, setLastId] = useState(challengeId);
  if (challengeId && challengeId !== lastId) setLastId(challengeId);
  const shownId = challengeId ?? lastId;

  return (
    <DetailDrawerFrame open={challengeId !== null} onClose={onClose}>
      {shownId && <DrawerContent key={shownId} challengeId={shownId} onDelete={onDelete} />}
    </DetailDrawerFrame>
  );
}

function DrawerContent({ challengeId, onDelete }: { challengeId: string; onDelete: (challenge: Challenge) => void }) {
  const { challenge, isLoading, error, reload } = useChallengeDetail(challengeId);
  const current = challenge?.id === challengeId ? challenge : null;
  return (
    <DetailDrawerShell
      overline={CHALLENGE_DETAIL_TEXT.overline}
      tabsLabel={CHALLENGE_DETAIL_TEXT.tabsLabel}
      title={current?.title ?? CHALLENGE_DETAIL_TEXT.overline}
      meta={
        current && (
          <>
            <span>{`${current.instrument?.name ?? CHALLENGE_DETAIL_TEXT.empty} · ${challengeWeekText(current)}`}</span>
            <span aria-hidden="true">·</span>
            <ChallengeStatusBadge status={current.displayStatus} />
          </>
        )
      }
      state={{ isLoading, error, onRetry: reload }}
      tabs={
        current && {
          practice: (
            <AssignmentPracticeStats stats={current.practiceStats}>
              <StudentList challenge={current} />
            </AssignmentPracticeStats>
          ),
          media: <AssignmentMediaTab media={current.media} />,
          info: <ChallengeInfoTab challenge={current} />,
        }
      }
      footer={
        current?.status === "DRAFT" && (
          <>
            <Link to={`/teacher/challenges/${current.id}/edit`} className={actionButtonClass("secondary", "md")}>
              {CHALLENGE_DETAIL_TEXT.edit}
            </Link>
            <ActionButton variant="secondary" onClick={() => onDelete(current)}>
              {CHALLENGE_DETAIL_TEXT.delete}
            </ActionButton>
          </>
        )
      }
    />
  );
}

function StudentList({ challenge }: { challenge: ChallengeDetail }) {
  // The class name only helps when the challenge spans several classes.
  const showClass = challenge.classes.length > 1;
  return (
    <>
      <h3 className="m-0 text-[13.5px] font-extrabold">{studentsHeading(challenge.students.length)}</h3>
      {challenge.students.length === 0 ? (
        <p className="m-0 rounded-bvc-xl bg-bvc-soft p-[15px] text-[13.5px] text-bvc-muted">
          {CHALLENGE_DETAIL_TEXT.noStudents}
        </p>
      ) : (
        <div className="flex flex-col gap-[10px]">
          {challenge.students.map((student) => (
            <AssignmentStudentRow
              key={student.studentId}
              href={`/teacher/challenges/${challenge.id}/students/${student.studentId}`}
              student={student}
              detail={showClass ? student.className : undefined}
            />
          ))}
        </div>
      )}
    </>
  );
}
