import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { audioAnalysisApi } from "@/features/practice/api/audioAnalysisApi";
import { practiceResultApi } from "@/features/practice/api/practiceResultApi";
import { practiceSegmentApi } from "@/features/practice/api/practiceSegmentApi";
import { RecordPanel } from "@/features/practice/components/RecordPanel";
import { SegmentPickerSheet } from "@/features/practice/components/SegmentPickerSheet";
import type { PracticeSegment } from "@/features/practice/components/SegmentPickerSheet";
import { PracticeTitleRow } from "@/features/practice/components/PracticeTitleRow";
import { SegmentResultCard } from "@/features/practice/components/SegmentResultCard";
import { SegmentTimeline } from "@/features/practice/components/SegmentTimeline";
import { MSG, PRACTICE_DEFAULTS } from "@/features/practice/constants/practiceConstants";
import { usePracticeAudio } from "@/features/practice/hooks/usePracticeAudio";
import { useRecorder } from "@/features/practice/hooks/useRecorder";
import { useReferenceAudio } from "@/features/practice/hooks/useReferenceAudio";
import { useResultPart } from "@/features/practice/hooks/useResultPart";
import { useSegmentAttempt } from "@/features/practice/hooks/useSegmentAttempt";
import { fmtTime } from "@/features/practice/utils/practiceFormat";
import { buildDemoSession } from "@/features/practice/utils/practiceSession";
import { buildSegmentPath, parseSegmentQuery } from "@/features/practice/utils/segmentFormat";
import type { SegmentQuery } from "@/features/practice/utils/segmentFormat";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { toast } from "@/shared/components/ui/toast";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

// Đoạn thu cần dư một chút ở cuối để không cắt mất nốt cuối
const TAIL_SEC = 1.5;

// UC-03: thu riêng một đoạn của bản nộp đã phân tích. Tham số sai thì quay về kết quả.
// Đổi đoạn / bật lại count-in tạo lại toàn bộ trạng thái (key theo đoạn).
export function SegmentPracticePage() {
  const navigate = useNavigate();
  const { submissionId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const query = parseSegmentQuery(searchParams);

  useEffect(() => {
    if (query) return;
    toast.error(MSG.segmentInvalid);
    navigate(`/practice/submissions/${encodeURIComponent(submissionId)}`, { replace: true });
  }, [query, navigate, submissionId]);

  if (!query) return null;
  return <SegmentPractice key={`${query.start}-${query.end}-${query.countIn}`} submissionId={submissionId} query={query} />;
}

interface SegmentPracticeProps {
  submissionId: string;
  query: SegmentQuery;
}

function SegmentPractice({ submissionId, query }: SegmentPracticeProps) {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { start, end, countIn } = query;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [segmentId, setSegmentId] = useState<string | null>(query.attemptId);
  const [uploading, setUploading] = useState(false);
  const [micPopup, setMicPopup] = useState(false);
  const recordRef = useRef<HTMLDivElement | null>(null);

  const result = useResultPart(practiceResultApi.getResult, submissionId, true, MSG.resultLoadFailed);
  const chart = useResultPart(practiceResultApi.getPitchChart, submissionId, true, MSG.pitchUnavailable);
  const data = result.data;
  const durationSec = chart.data?.durationSec ?? data?.recording.durationSec ?? 0;

  // Đã chọn đoạn từ một kết quả hợp lệ; nếu bản nộp không còn phân tích được thì quay về
  useEffect(() => {
    if (data && data.submission.status !== "COMPLETED") {
      toast.error(MSG.segmentInvalid);
      navigate(`/practice/submissions/${encodeURIComponent(submissionId)}`, { replace: true });
    }
  }, [data, navigate, submissionId]);

  const targetBpm = Math.round(data?.tempo?.teacherBpm ?? PRACTICE_DEFAULTS.targetBpm);
  const session = useMemo(
    () => ({
      ...buildDemoSession(false, targetBpm),
      pieceLenSec: end - start + TAIL_SEC,
      countInBeats: countIn ? undefined : 0,
    }),
    [targetBpm, start, end, countIn]
  );
  const audio = usePracticeAudio({ micWanted: true, fminHz: session.fminHz });
  const recorder = useRecorder({ audio, session, timelineOffsetSec: 0, onAutoStop: () => toast.info(MSG.autoStop) });
  const { rec } = recorder;
  const micDenied = audio.micState === "denied";
  const { attempt } = useSegmentAttempt(segmentId);

  // GBR-51: đóng tab thì bỏ bản thu đang ghi / đang nghe lại
  const resetRecorder = recorder.reset;
  useEffect(() => {
    window.addEventListener("pagehide", resetRecorder);
    return () => window.removeEventListener("pagehide", resetRecorder);
  }, [resetRecorder]);

  function handleStart() {
    if (rec !== "idle" || uploading) return;
    if (micDenied) {
      audio.retryMic();
      setMicPopup(true); // MSG-10
      return;
    }
    if (!audio.ready) return;
    void recorder.start();
  }

  async function handleSend() {
    const file = rec === "preview" ? recorder.take?.file : undefined;
    if (!file || uploading) return;
    setUploading(true);
    try {
      const uploaded = await audioAnalysisApi.upload(file, new AbortController().signal, () => undefined);
      const created = await practiceSegmentApi.create(submissionId, {
        startSec: start,
        endSec: end,
        studentUploadId: uploaded.data.data.fileId,
      });
      recorder.reset(); // GBR-51: bản thu được bỏ khỏi màn ghi âm ngay khi gửi
      toast.success(MSG.sent);
      setSegmentId(created.data.data.id);
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set("attemptId", created.data.data.id);
          return next;
        },
        { replace: true }
      );
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, MSG.submitFailed)); // bản thu còn đó để gửi lại
    } finally {
      setUploading(false);
    }
  }

  function handleDownload() {
    const take = recorder.take;
    if (!take) return;
    const link = document.createElement("a");
    link.href = take.url;
    link.download = take.file.name;
    link.click();
    toast.success(MSG.download);
  }

  function handleRetake() {
    recorder.reset();
    recordRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function changeSegment(segment: PracticeSegment) {
    setPickerOpen(false);
    recorder.reset();
    navigate(buildSegmentPath(submissionId, segment), { replace: true });
  }

  const sendLabel = uploading ? "Đang tải lên..." : "Gửi phân tích";
  const teacherUrl = data?.audio.teacherUrl ?? null;

  return (
    <StudentShell>
      <div className="mx-auto flex w-full flex-1 flex-col gap-3.5 pb-6 md:max-w-180 md:px-14 md:pt-6 lg:max-w-240">
        <PracticeTitleRow
          title={data?.piece.title ?? (result.loading ? "Đang tải..." : "Luyện tập đoạn")}
          subtitle={`Đoạn ${fmtTime(start)} – ${fmtTime(end)}`}
          rightSlot={
            data && (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="min-h-11 shrink-0 cursor-pointer rounded-full border border-bvc-border px-4 text-sm font-medium text-bvc-ink"
              >
                Đổi đoạn
              </button>
            )
          }
        />

        {result.error && <p className="mx-3.5 text-[13px] text-bvc-muted md:mx-0">{result.error}</p>}

        <div className="mx-3.5 flex flex-col gap-3.5 rounded-bvc-xl border border-bvc-border bg-white p-4 md:mx-0 md:p-5.5">
          {durationSec > 0 && <SegmentTimeline durationSec={durationSec} start={start} end={end} issues={data?.issues ?? []} />}
          {teacherUrl && <SegmentReferencePlayer key={teacherUrl} url={teacherUrl} start={start} end={end} />}
        </div>

        <div
          ref={recordRef}
          className="mx-3.5 flex flex-col gap-3 rounded-bvc-xl border border-bvc-border bg-white p-4 md:mx-0 md:p-5.5"
        >
          <RecordPanel
            rec={rec}
            elapsed={recorder.elapsed}
            countBeat={recorder.countBeat}
            takeLen={recorder.takeLen}
            analyser={audio.analyser}
            previewPeaks={recorder.take?.peaks ?? []}
            playing={recorder.playing}
            playPos={recorder.playPos}
            blocked={false}
            micDenied={micDenied}
            weakNetwork={false}
            errorText=""
            weakMessage={MSG.weak}
            sendDisabled={uploading}
            sendLabel={sendLabel}
            onStart={handleStart}
            onStop={recorder.stop}
            onTogglePlay={recorder.togglePlay}
            onSeek={recorder.seek}
            volume={recorder.volume}
            muted={recorder.muted}
            rate={recorder.rate}
            onVolumeChange={recorder.setVolume}
            onToggleMute={recorder.toggleMute}
            onRateChange={recorder.setRate}
            onRerecord={recorder.reset}
            onDownload={handleDownload}
            onSend={() => void handleSend()}
            referenceAudio={null}
            targetBpm={targetBpm}
          />
          {(rec === "countin" || rec === "recording") && (
            // Huỷ khi đếm nhịp / đang thu: bỏ bản thu, không gọi API, kết quả trước giữ nguyên
            <button
              type="button"
              onClick={recorder.reset}
              className="flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full border border-bvc-border-strong text-sm font-medium text-bvc-ink"
            >
              Huỷ
            </button>
          )}
          {micPopup && (
            <p role="alert" className="text-[13px] text-bvc-accent-text">
              {MSG.micPopup}
            </p>
          )}
        </div>

        {attempt && (
          <div className="mx-3.5 md:mx-0">
            <SegmentResultCard attempt={attempt} onRetake={handleRetake} />
          </div>
        )}
      </div>

      {pickerOpen && data && (
        <SegmentPickerSheet
          open
          onOpenChange={setPickerOpen}
          onBack={() => setPickerOpen(false)}
          onStart={changeSegment}
          durationSec={durationSec}
          issues={data.issues}
          chart={chart.data}
        />
      )}
    </StudentShell>
  );
}

interface SegmentReferencePlayerProps {
  url: string;
  start: number;
  end: number;
}

// "Nghe mẫu đoạn": phát bản mẫu từ đầu đoạn và tự dừng ở cuối đoạn
function SegmentReferencePlayer({ url, start, end }: SegmentReferencePlayerProps) {
  const player = useReferenceAudio(url);
  const { playing, playPos, togglePlay, seek } = player;

  useEffect(() => {
    if (playing && playPos >= end) togglePlay();
  }, [playing, playPos, end, togglePlay]);

  function handleToggle() {
    if (!playing) seek(start);
    togglePlay();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleToggle}
        className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-bvc-border-strong px-4 text-sm font-medium text-bvc-ink"
      >
        {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
        {playing ? "Dừng nghe mẫu" : "Nghe mẫu đoạn"}
      </button>
      {player.error && <span className="text-[12.5px] text-bvc-accent-text">{MSG.referencePlaybackFailed}</span>}
    </div>
  );
}
