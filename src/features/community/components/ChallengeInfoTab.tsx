import { type ReactNode } from "react";
import { formatMaxSubmissions, formatTempo, formatThreshold } from "@/features/classes/utils/assignmentDetailFormat";
import { formatVietnamDateTime } from "@/features/classes/utils/teacherAssignmentFormat";
import { ChallengeStatusBadge } from "@/features/community/components/ChallengeStatusBadge";
import { type ChallengeDetail } from "@/features/community/types/challenge";
import {
  CHALLENGE_DETAIL_TEXT,
  CHALLENGE_INFO_LABELS,
  challengeWeekText,
} from "@/features/community/utils/challengeFormat";

interface ChallengeInfoTabProps {
  challenge: ChallengeDetail;
}

function FieldGrid({ items }: { items: { label: string; value: ReactNode; mono?: boolean }[] }) {
  return (
    <dl className="m-0 grid grid-cols-1 gap-px overflow-hidden rounded-bvc-lg border border-bvc-border bg-bvc-border sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-[3px] bg-white px-[16px] py-[12px]">
          <dt className="text-[12px] text-bvc-muted">{item.label}</dt>
          <dd className={`m-0 text-[14px] font-semibold ${item.mono ? "font-bvc-mono" : ""}`}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-[12px]">
      <h3 className="m-0 text-[13.5px] font-extrabold">{title}</h3>
      {children}
    </section>
  );
}

// "Thông tin & cấu hình" tab of the challenge drawer.
export function ChallengeInfoTab({ challenge }: ChallengeInfoTabProps) {
  const empty = CHALLENGE_DETAIL_TEXT.empty;
  return (
    <div className="flex flex-col gap-[24px]">
      <Block title={CHALLENGE_DETAIL_TEXT.general}>
        <FieldGrid
          items={[
            { label: CHALLENGE_INFO_LABELS.status, value: <ChallengeStatusBadge status={challenge.displayStatus} /> },
            { label: CHALLENGE_INFO_LABELS.instrument, value: challenge.instrument?.name ?? empty },
            { label: CHALLENGE_INFO_LABELS.piece, value: challenge.piece?.title ?? empty },
            { label: CHALLENGE_INFO_LABELS.week, value: challengeWeekText(challenge), mono: true },
            {
              label: CHALLENGE_INFO_LABELS.classes,
              value: challenge.classes.length > 0 ? challenge.classes.map((item) => item.name).join(", ") : empty,
            },
            {
              label: CHALLENGE_INFO_LABELS.publishedAt,
              value: challenge.publishedAt ? formatVietnamDateTime(challenge.publishedAt) : empty,
            },
          ]}
        />
        <p className="m-0 whitespace-pre-line rounded-bvc-lg border border-bvc-border bg-bvc-soft px-[16px] py-[14px] text-[14px] leading-[1.6]">
          {challenge.description || CHALLENGE_DETAIL_TEXT.noDescription}
        </p>
      </Block>
      <Block title={CHALLENGE_DETAIL_TEXT.config}>
        <FieldGrid
          items={[
            { label: CHALLENGE_INFO_LABELS.tempo, value: formatTempo(challenge.requiredBpm), mono: true },
            {
              label: CHALLENGE_INFO_LABELS.threshold,
              value: formatThreshold(challenge.effectiveMinAccuracy),
              mono: true,
            },
            {
              label: CHALLENGE_INFO_LABELS.maxSubmissions,
              value: formatMaxSubmissions(challenge.maxSubmissions),
              mono: true,
            },
          ]}
        />
      </Block>
    </div>
  );
}
