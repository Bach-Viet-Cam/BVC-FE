import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AssignmentInfoCard } from "@/features/practice/components/AssignmentInfoCard";
import { MetronomeView } from "@/features/practice/components/MetronomeView";
import { PracticeDrawer } from "@/features/practice/components/PracticeDrawer";
import { PracticeTitleRow } from "@/features/practice/components/PracticeTitleRow";
import { ResultBanner } from "@/features/practice/components/ResultBanner";
import { TunerView } from "@/features/practice/components/TunerView";
import { RecordPanel } from "@/features/practice/components/RecordPanel";
import { UploadPanel } from "@/features/practice/components/UploadPanel";
import { TempoCard } from "@/features/practice/components/TempoCard";
import { TunerCard } from "@/features/practice/components/TunerCard";
import { NoticeBanner } from "@/features/practice/components/NoticeBanner";
// import { DemoPanel } from "@/features/practice/components/DemoPanel"; // nút Demo đang tạm ẩn
import {
  AUDIO_ACCEPT,
  COUNT_IN_BEATS,
  DEMO_AUTO_STOP_TAIL_S,
  MSG,
  TEMPO_TOLERANCE_PERCENT,
} from "@/features/practice/constants/practiceConstants";
import { usePracticeDemo } from "@/features/practice/context/PracticeDemoContext";
import { usePracticeAudio } from "@/features/practice/hooks/usePracticeAudio";
import { useClickTrack } from "@/features/practice/hooks/useClickTrack";
import { useLiveTempo } from "@/features/practice/hooks/useLiveTempo";
import { useLiveTuner } from "@/features/practice/hooks/useLiveTuner";
import { usePitchStream } from "@/features/practice/hooks/usePitchStream";
import { useRecorder } from "@/features/practice/hooks/useRecorder";
import { usePracticeContext } from "@/features/practice/hooks/usePracticeContext";
import { usePracticeTargetBpm } from "@/features/practice/hooks/usePracticeTargetBpm";
import { useInstrumentTunes } from "@/features/practice/hooks/useInstrumentTunes";
import { useActiveSubmission } from "@/features/practice/hooks/useActiveSubmission";
import { useFilePreview } from "@/features/practice/hooks/useFilePreview";
import { readAudioFile } from "@/features/practice/utils/readAudioFile";
import { midiToNoteInfo, noteAtTime } from "@/features/practice/utils/noteMath";
import { noteGridBeats } from "@/features/practice/utils/tempoEstimator";
import { DEADLINE_NOTE, assignmentStatusText } from "@/features/practice/utils/practiceContextFormat";
import { buildDemoSession } from "@/features/practice/utils/practiceSession";
import { fileErrorMessage, takeToRecordingFile, validateFile } from "@/features/practice/utils/validateRecording";
import type { RecordingFile, SubmitMode } from "@/features/practice/types/practiceTypes";
import { BvcDialogPopup } from "@/shared/components/bvc/BvcDialogPopup";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { Dialog } from "@/shared/components/ui/dialog";
import { toast } from "@/shared/components/ui/toast";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/utils/cn";
import { formatDate } from "@/shared/utils/formatDate";

type DrawerKind = "tuner" | "metronome";

// Laptop: TunerPage/MetronomePage chuyển về đây kèm state.drawer để mở sẵn ngăn kéo
function drawerFromState(state: unknown): DrawerKind | null {
  const value = typeof state === "object" && state !== null ? (state as { drawer?: unknown }).drawer : null;
  return value === "tuner" || value === "metronome" ? value : null;
}

export function RecordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sheetId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get("assignmentId") ?? undefined;
  const isMobile = useIsMobile();
  const { demo, blocked: demoBlocked, submit, uploading, uploadWeak } = usePracticeDemo();
  const { context, error: contextError, isLoading: contextLoading } = usePracticeContext(sheetId, assignmentId);
  const { active, refresh: refreshActive } = useActiveSubmission(sheetId);
  const blocked = demoBlocked || Boolean(active); // GBR-49: chỉ khóa bài đang có bản xử lý
  const [drawer, setDrawer] = useState<DrawerKind | null>(() => drawerFromState(location.state));

  const [mode, setMode] = useState<SubmitMode>("record");
  const [tempoOpen, setTempoOpen] = useState(true);
  const [tunerOpen, setTunerOpen] = useState(true);
  const [clickOn, setClickOn] = useState(false);
  const [micPopup, setMicPopup] = useState(false);
  const [file, setFile] = useState<RecordingFile | null>(null);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const preview = useFilePreview(pickedFile);

  // Tốc độ luyện: BPM bài tập của lớp nếu bản nhạc được giao, ngược lại mặc định 60
  const { targetBpm } = usePracticeTargetBpm(sheetId, assignmentId);
  // Dây chuẩn của nhạc cụ thuộc bản nhạc, cho ngăn lên dây (laptop)
  const tunes = useInstrumentTunes(sheetId);
  const session = useMemo(() => buildDemoSession(demo.noPitch, targetBpm), [demo.noPitch, targetBpm]);
  const audio = usePracticeAudio({ micWanted: mode === "record", fminHz: session.fminHz });
  const micDenied = demo.micDenied || audio.micState === "denied";
  const timelineOffsetSec = demo.autoStop ? Math.max(0, session.pieceLenSec - DEMO_AUTO_STOP_TAIL_S) : 0;

  const recorder = useRecorder({
    audio,
    session,
    timelineOffsetSec,
    onAutoStop: () => toast.info(MSG.autoStop), // MSG-44
  });

  const { rec, elapsed, countBeat } = recorder;
  const recActive = rec === "countin" || rec === "recording";
  const canOpenDetail = mode === "record" && (rec === "idle" || rec === "preview");

  // Tiếng gõ nhịp theo đồng hồ AudioContext; tạm dừng ở chế độ upload, giữ giá trị clickOn
  const click = useClickTrack({
    ctx: audio.ctx,
    enabled: clickOn && mode === "record",
    bpm: session.targetBpm,
    beatsPerBar: session.beatsPerBar,
    gridOrigin: recorder.recordStartTime,
  });

  const tunerShown = mode === "record" && session.hasPitch;
  const live = rec === "recording" && !micDenied;

  // Ngăn kéo lên dây tự đo bằng micro này, nên thẻ tuner nhường để không tính pitch hai lần
  const tunerActive = tunerShown && tunerOpen && !micDenied && audio.ready && drawer !== "tuner";
  const tempoActive = mode === "record" && rec === "recording" && !micDenied && audio.ready;
  const pitchStream = usePitchStream({
    audio,
    enabled: tunerActive || tempoActive,
    computePitch: session.hasPitch && (tunerActive || tempoActive),
    fminHz: session.fminHz,
    fmaxHz: session.fmaxHz,
  });
  const tuner = useLiveTuner({ subscribe: pitchStream.subscribe, active: tunerActive });

  const gridBeats = useMemo(() => noteGridBeats(session), [session]);
  const tempo = useLiveTempo({
    ctx: audio.ctx,
    subscribe: pitchStream.subscribe,
    active: tempoActive,
    recordStartTime: recorder.recordStartTime,
    targetBpm: session.targetBpm,
    gridBeats,
    hasPitch: session.hasPitch,
    clickOn,
    getClickTimes: click.getClickTimes,
  });
  const liveBpm = live ? tempo.liveBpm : null;

  const expectedMidi = noteAtTime(session.notes, rec === "recording" ? elapsed : 0).midi;
  const expectedNote = useMemo(() => midiToNoteInfo(expectedMidi), [expectedMidi]);

  const bpmHint = useMemo(() => {
    if (rec === "countin") return "Đang đếm nhịp";
    if (!live || liveBpm === null) return micDenied ? "" : "Đang lắng nghe";
    const diff = ((liveBpm - session.targetBpm) / session.targetBpm) * 100;
    if (Math.abs(diff) <= TEMPO_TOLERANCE_PERCENT) return "Đúng nhịp";
    return diff > 0 ? "Hơi nhanh" : "Hơi chậm";
  }, [rec, live, liveBpm, micDenied, session.targetBpm]);

  const hintTone = bpmHint === "Đúng nhịp" ? "ok" : bpmHint === "Hơi nhanh" || bpmHint === "Hơi chậm" ? "warn" : "idle";

  // Đang ghi mà không bật click thì đèn vẫn chạy theo lưới bản ghi
  const recordingBeat = Math.floor(((elapsed - timelineOffsetSec) * session.targetBpm) / 60) % COUNT_IN_BEATS;
  const litBeat =
    rec === "countin"
      ? countBeat
      : rec === "recording"
        ? clickOn
          ? click.litBeat
          : recordingBeat
        : clickOn
          ? click.litBeat
          : -1;

  // Bản thu mô phỏng: dung lượng suy ra từ thời lượng
  const errorKind = useMemo(() => {
    if (mode === "record") {
      if (rec !== "preview" || !recorder.take) return "";
      if (demo.invalid !== "none") return demo.invalid;
      return validateFile(takeToRecordingFile(recorder.take));
    }
    return file ? validateFile(file) : "";
  }, [mode, rec, demo.invalid, recorder.take, file]);

  // GBR-51: đóng tab / ứng dụng thì bỏ bản thu đang ghi hoặc đang nghe lại, không hỏi lại
  const resetRecorder = recorder.reset;
  useEffect(() => {
    const discard = () => {
      resetRecorder();
      setPickedFile(null);
      setFile(null);
    };
    window.addEventListener("pagehide", discard);
    return () => window.removeEventListener("pagehide", discard);
  }, [resetRecorder]);

  function clearPickedFile() {
    setPickedFile(null);
    setFile(null);
  }

  function openFilePicker() {
    if (blocked) return;
    fileInput.current?.click();
  }

  async function handleFilePicked(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    event.target.value = ""; // cho phép chọn lại cùng một file
    if (!picked) return;
    setFile(await readAudioFile(picked)); // GBR-10: kiểm tra định dạng, dung lượng, thời lượng
    setPickedFile(picked);
  }

  async function handleSend() {
    if (blocked || uploading || errorKind || !sheetId) return;
    const source = mode === "record" ? (rec === "preview" ? recorder.take?.file : undefined) : pickedFile;
    if (!source) return;
    const submission = await submit(source, { sheetMusicId: sheetId, assignmentId });
    if (!submission) {
      refreshActive();
      return;
    }
    // GBR-51: bản thu được bỏ khỏi màn ghi âm ngay khi gửi
    if (mode === "record") recorder.reset();
    else clearPickedFile();
    navigate(`/practice/submissions/${submission.id}/processing`);
  }

  function handleStart() {
    if (blocked || rec !== "idle") return;
    if (micDenied) {
      audio.retryMic(); // D9: thử xin lại lặng lẽ
      setMicPopup(true); // MSG-10
      return;
    }
    if (!audio.ready) return; // micro đang mở
    void recorder.start();
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

  // Điện thoại: trang riêng. Laptop: ngăn kéo, không rời màn ghi âm
  function openDetail(kind: DrawerKind) {
    if (isMobile) navigate(`/practice/sheets/${sheetId}/${kind}${assignmentId ? `?assignmentId=${assignmentId}` : ""}`);
    else setDrawer(kind);
  }

  // Đổi chế độ thì bỏ bản thu / file của chế độ kia (GBR-51)
  function switchMode(next: SubmitMode) {
    if (recActive || next === mode) return;
    if (next === "upload") recorder.reset();
    else clearPickedFile();
    setMode(next);
  }

  const notices: string[] = [];
  if (demo.expired) notices.push(MSG.expired); // MSG-16
  if (demo.otherProc || active) notices.push(MSG.busy); // GBR-49
  if (!sheetId) notices.push(MSG.chooseSheet);

  const sendDisabled = blocked || uploading || Boolean(errorKind) || !sheetId;
  const sendLabel = uploading ? "Đang tải lên..." : "Gửi";

  const assignment = context?.assignment ?? null;
  const subtitle = context
    ? [context.sheet.name, context.sheet.instrument.name, context.classRecord?.name].filter(Boolean).join(" · ")
    : undefined;
  // Dưới lg thẻ "Bài tập" ẩn, nên tóm tắt thành một dòng
  const summary = context
    ? assignment?.state === "OPEN"
      ? `Hạn nộp ${formatDate(assignment.deadline)} · Còn ${assignment.remainingSubmissions} lượt nộp`
      : assignmentStatusText(context)
    : null;

  return (
    <StudentShell>
      <ResultBanner className="fixed inset-x-3.5 top-3 md:inset-x-auto md:top-24 md:right-8 md:w-96" />
      <div className="mx-auto flex w-full max-w-[428px] flex-1 flex-col md:max-w-none md:gap-5 md:px-14 md:pt-6 md:pb-7">
        {/* Điện thoại: `contents` giữ nguyên bố cục cũ; từ md thành cột của bản laptop.
            Từ lg: cột trái là tiêu đề + thẻ Bài tập; cột phải là tempo + tuner ở trên, khu ghi âm ở dưới */}
        <div className="contents md:flex md:flex-col md:gap-5 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[1fr_3fr] lg:items-start">
          <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-5">
            <PracticeTitleRow
              title={context?.piece.title ?? (contextLoading ? "Đang tải..." : "Luyện tập")}
              subtitle={subtitle}
              // Tạm ẩn nút Demo (mô phỏng luồng ghi âm); bật lại bằng rightSlot={<DemoPanel />}
              // rightSlot={<DemoPanel />}
            />
            {summary && (
              <div className="px-3.5 pt-2.5 pb-2.5 text-[13px] leading-normal text-bvc-muted md:px-0 md:pt-0 md:pb-0 lg:hidden">
                <p>{summary}</p>
                {assignment && <p className="mt-1 text-[12px]">{DEADLINE_NOTE}</p>}
              </div>
            )}
            <AssignmentInfoCard context={context} isLoading={contextLoading} error={contextError} />
          </div>

          <div className="contents md:flex md:min-h-0 md:flex-1 md:flex-col md:gap-5">
            <div className={cn("contents md:grid md:gap-5", tunerShown ? "md:grid-cols-2" : "md:grid-cols-1")}>
              <div className="mx-3.5 md:mx-0">
                {mode === "record" && (
                  <TempoCard
                    open={tempoOpen}
                    onToggle={() => setTempoOpen((value) => !value)}
                    targetBpm={targetBpm}
                    liveBpm={liveBpm}
                    bpmHint={bpmHint}
                    hintTone={hintTone}
                    litBeat={litBeat}
                    clickOn={clickOn}
                    onToggleClick={() => {
                      void audio.ctx.resume(); // cử chỉ người dùng mở khoá âm thanh
                      setClickOn((value) => !value);
                    }}
                    canOpenDetail={canOpenDetail}
                    onOpenMetronome={() => openDetail("metronome")}
                    micDenied={micDenied}
                  />
                )}
              </div>

              {tunerShown && (
                <div className="mx-3.5 mt-2.5 md:mx-0 md:mt-0">
                  <TunerCard
                    open={tunerOpen}
                    onToggle={() => setTunerOpen((value) => !value)}
                    live={tuner.live}
                    cents={tuner.cents}
                    detectedNote={tuner.detectedNote}
                    detectedHz={tuner.detectedHz}
                    expectedNote={expectedNote}
                    canOpenDetail={canOpenDetail}
                    onOpenTuner={() => openDetail("tuner")}
                    micDenied={micDenied}
                  />
                </div>
              )}
            </div>

            <div className="contents">
              <div className="mx-3.5 mt-3 flex min-h-0 flex-1 flex-col gap-2.75 pb-5.5 md:mx-0 md:mt-0 md:min-h-98 md:rounded-[22px] md:border md:border-bvc-border md:bg-white md:p-5.5 md:pb-5.5">
                <div className="contents md:flex md:shrink-0 md:items-center md:justify-between md:gap-4">
                  <div className="flex shrink-0 gap-1 rounded-bvc-md border border-bvc-border-strong bg-bvc-surface p-0.75 md:w-85 md:border-0 md:bg-bvc-panel">
                    {(["record", "upload"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={mode === value}
                        onClick={() => switchMode(value)}
                        className={cn(
                          "min-h-10 flex-1 cursor-pointer rounded-bvc-sm text-sm font-semibold md:min-h-10.5",
                          mode === value ? "bg-bvc-ink text-white" : "text-bvc-muted",
                          recActive && "opacity-60"
                        )}
                      >
                        {value === "record" ? "Ghi âm" : "Tải file lên"}
                      </button>
                    ))}
                  </div>

                  <p className="shrink-0 text-xs leading-normal text-bvc-muted md:text-right md:text-[12.5px]">
                    Định dạng MP3, WAV, M4A · tối đa 20 MB · thời lượng từ 00:10 đến 03:00
                  </p>
                </div>

                {notices.map((text) => (
                  <NoticeBanner key={text} message={text} />
                ))}

                {mode === "record" ? (
                  <RecordPanel
                    rec={rec}
                    elapsed={elapsed}
                    countBeat={countBeat}
                    takeLen={recorder.takeLen}
                    analyser={audio.analyser}
                    previewPeaks={recorder.take?.peaks ?? []}
                    playing={recorder.playing}
                    playPos={recorder.playPos}
                    blocked={blocked}
                    micDenied={micDenied}
                    weakNetwork={uploadWeak}
                    errorText={fileErrorMessage(errorKind)}
                    weakMessage={MSG.weak}
                    sendDisabled={sendDisabled}
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
                    referenceAudio={context?.sheet.referenceAudio ?? null}
                    targetBpm={targetBpm}
                  />
                ) : (
                  <UploadPanel
                    file={file}
                    playing={preview.playing}
                    position={preview.position}
                    blocked={blocked}
                    weakNetwork={uploadWeak}
                    errorText={fileErrorMessage(errorKind)}
                    weakMessage={MSG.weak}
                    sendDisabled={sendDisabled}
                    sendLabel={sendLabel}
                    onPick={openFilePicker}
                    onPickOther={openFilePicker}
                    onTogglePlay={preview.toggle}
                    onSend={() => void handleSend()}
                  />
                )}
                <input
                  ref={fileInput}
                  type="file"
                  accept={AUDIO_ACCEPT}
                  className="hidden"
                  aria-hidden
                  tabIndex={-1}
                  onChange={(event) => void handleFilePicked(event)}
                />
                {!sheetId && (
                  <button
                    type="button"
                    onClick={() => navigate("/library")}
                    className="flex min-h-11 w-full shrink-0 cursor-pointer items-center justify-center rounded-[15px] border border-bvc-border-strong bg-white text-sm font-semibold text-bvc-ink"
                  >
                    Chọn bản nhạc để nộp bài
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {drawer && !isMobile && (
        <PracticeDrawer
          title={drawer === "tuner" ? "Lên dây" : "Metronome"}
          subtitle={
            drawer === "tuner"
              ? [context?.sheet.instrument.name, "A4 440 Hz"].filter(Boolean).join(" · ")
              : [context?.piece.title, assignment?.targetBpm && `tốc độ yêu cầu ${assignment.targetBpm} BPM`]
                  .filter(Boolean)
                  .join(" · ")
          }
          onClose={() => setDrawer(null)}
        >
          {drawer === "tuner" ? (
            <TunerView audio={audio} tunes={tunes} />
          ) : (
            // key: tốc độ mục tiêu tải xong sau khi mở thì metronome bắt đầu lại từ tốc độ đó
            <MetronomeView key={targetBpm} targetBpm={targetBpm} />
          )}
        </PracticeDrawer>
      )}

      <Dialog open={micPopup} onOpenChange={setMicPopup}>
        <BvcDialogPopup>
          <p className="text-sm leading-normal text-bvc-ink">{MSG.micPopup}</p>
          <button
            type="button"
            onClick={() => setMicPopup(false)}
            className="flex min-h-12.5 w-full cursor-pointer items-center justify-center rounded-[15px] bg-bvc-ink text-[15px] font-semibold text-white"
          >
            Đóng
          </button>
        </BvcDialogPopup>
      </Dialog>
    </StudentShell>
  );
}
