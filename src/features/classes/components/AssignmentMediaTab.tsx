import { type ReactNode } from "react";
import { type AssignmentMedia, type MediaFileInfo } from "@/features/classes/types/teacherAssignmentTypes";
import { MEDIA_TEXT, formatDuration, formatFileSize, formatPageCount } from "@/features/classes/utils/assignmentDetailFormat";

interface AssignmentMediaTabProps {
  media: AssignmentMedia | null;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-[12px]">
      <h3 className="m-0 text-[13.5px] font-extrabold">{title}</h3>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="m-0 rounded-bvc-lg border border-dashed border-bvc-border-strong bg-bvc-soft px-[16px] py-[18px] text-[13.5px] text-bvc-muted">
      {text}
    </p>
  );
}

function fileMeta(file: MediaFileInfo): string {
  const parts = [file.mimeType, formatFileSize(file.sizeBytes)];
  if (file.pageCount) parts.push(formatPageCount(file.pageCount));
  if (file.durationSec) parts.push(formatDuration(file.durationSec));
  return parts.join(" · ");
}

function FileHeader({ file, action }: { file: MediaFileInfo; action?: ReactNode }) {
  return (
    <div className="flex items-center gap-[10px] border-b border-bvc-border bg-white px-[14px] py-[10px] text-[13px]">
      <span className="min-w-0 grow truncate font-bvc-mono font-semibold">{file.originalName}</span>
      <span className="shrink-0 font-bvc-mono text-bvc-muted">{fileMeta(file)}</span>
      {action}
    </div>
  );
}

function SheetPreview({ file }: { file: MediaFileInfo }) {
  const isImage = file.mimeType.startsWith("image/");
  return (
    <div className="overflow-hidden rounded-bvc-lg border border-bvc-border bg-bvc-surface">
      <FileHeader
        file={file}
        action={
          !isImage && file.url ? (
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-full border border-bvc-border-strong px-[12px] py-[4px] text-[12.5px] font-medium text-bvc-ink"
            >
              {MEDIA_TEXT.open}
            </a>
          ) : null
        }
      />
      {isImage && file.url && (
        <div className="flex justify-center p-[16px]">
          <img src={file.url} alt={file.originalName} className="max-h-[720px] max-w-full bg-white" />
        </div>
      )}
    </div>
  );
}

function PlayerFile({ file, kind }: { file: MediaFileInfo; kind: "audio" | "video" }) {
  return (
    <div className="overflow-hidden rounded-bvc-lg border border-bvc-border bg-bvc-soft">
      <FileHeader file={file} />
      {file.url && (
        <div className="p-[14px]">
          {kind === "audio" ? (
            <audio controls src={file.url} className="w-full" />
          ) : (
            <video controls src={file.url} className="max-h-[420px] w-full rounded-bvc-md bg-black" />
          )}
        </div>
      )}
    </div>
  );
}

export function AssignmentMediaTab({ media }: AssignmentMediaTabProps) {
  if (!media) return <Empty text={MEDIA_TEXT.noSheet} />;
  return (
    <div className="flex flex-col gap-[28px]">
      <Section title={MEDIA_TEXT.sheet}>
        {media.sheet ? <SheetPreview file={media.sheet} /> : <Empty text={MEDIA_TEXT.noSheetFile} />}
      </Section>
      <Section title={MEDIA_TEXT.audio}>
        {media.referenceAudio ? (
          <PlayerFile file={media.referenceAudio} kind="audio" />
        ) : (
          <Empty text={MEDIA_TEXT.noAudio} />
        )}
      </Section>
      <Section title={MEDIA_TEXT.video}>
        {media.tutorialVideo ? (
          <PlayerFile file={media.tutorialVideo} kind="video" />
        ) : (
          <Empty text={MEDIA_TEXT.noVideo} />
        )}
      </Section>
    </div>
  );
}
