import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AssignmentInfoCard } from "@/features/practice/components/AssignmentInfoCard";
import { MetronomeView } from "@/features/practice/components/MetronomeView";
import { PracticeDrawer } from "@/features/practice/components/PracticeDrawer";
import { PracticeTopBar } from "@/features/practice/components/PracticeTopBar";
import { TunerView } from "@/features/practice/components/TunerView";
import { RecordPanel } from "@/features/practice/components/RecordPanel";
import { UploadPanel } from "@/features/practice/components/UploadPanel";
import { TempoCard } from "@/features/practice/components/TempoCard";
import { TunerCard } from "@/features/practice/components/TunerCard";
import { NoticeBanner } from "@/features/practice/components/NoticeBanner";
import { DemoPanel } from "@/features/practice/components/DemoPanel";
import { PracticeFrame } from "@/features/practice/components/PracticeFrame";
import {
  COUNT_IN_BEATS,
  DEMO_AUTO_STOP_TAIL_S,
  MSG,
  SAMPLE,
  TEMPO_TOLERANCE_PERCENT,
} from "@/features/practice/constants/practiceConstants";
import { usePracticeDemo } from "@/features/practice/context/PracticeDemoContext";
import { usePracticeAudio } from "@/features/practice/hooks/usePracticeAudio";
import { useClickTrack } from "@/features/practice/hooks/useClickTrack";
import { useLiveTuner } from "@/features/practice/hooks/useLiveTuner";
import { usePitchStream } from "@/features/practice/hooks/usePitchStream";
import { useRecorder } from "@/features/practice/hooks/useRecorder";
import { midiToNoteInfo, noteAtTime } from "@/features/practice/utils/noteMath";
import { simBpm } from "@/features/practice/utils/practiceSimulation";
import { buildDemoSession } from "@/features/practice/utils/practiceSession";
import { fileErrorMessage, takeToRecordingFile, validateFile } from "@/features/practice/utils/validateRecording";
import type { RecordingFile, SubmitMode } from "@/features/practice/types/practiceTypes";
import { BvcDialogPopup } from "@/shared/components/bvc/BvcDialogPopup";
import { Dialog } from "@/shared/components/ui/dialog";
import { toast } from "@/shared/components/ui/toast";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/utils/cn";

type DrawerKind = "tuner" | "metronome";

// Laptop: TunerPage/MetronomePage chuyển về đây kèm state.drawer để mở sẵn ngăn kéo
function drawerFromState(state: unknown): DrawerKind | null {
  const value = typeof state === "object" && state !== null ? (state as { drawer?: unknown }).drawer : null;
  return value === "tuner" || value === "metronome" ? value : null;
}

export function RecordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { songId } = useParams();
  const isMobile = useIsMobile();
  const { demo, blocked, left, submit, uploading, submission } = usePracticeDemo();
  const [drawer, setDrawer] = useState<DrawerKind | null>(() => drawerFromState(location.state));

  const [mode, setMode] = useState<SubmitMode>("record");
  const [tempoOpen, setTempoOpen] = useState(true);
  const [tunerOpen, setTunerOpen] = useState(true);
  const [clickOn, setClickOn] = useState(false);
  const [micPopup, setMicPopup] = useState(false);
  const [file, setFile] = useState<RecordingFile | null>(null);
  const [fileIdx, setFileIdx] = useState(0);
  const [filePlaying, setFilePlaying] = useState(false);
  const [filePos, setFilePos] = useState(0);

  const session = useMemo(() => buildDemoSession(demo.noPitch), [demo.noPitch]);
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

  useEffect(() => {
    if (!filePlaying || !file) return;
    const timer = setInterval(() => {
      setFilePos((pos) => {
        const next = pos + 0.06;
        if (next >= file.dur) {
          setFilePlaying(false);
          return 0;
        }
        return next;
      });
    }, 60);
    return () => clearInterval(timer);
  }, [filePlaying, file]);

  const tunerShown = mode === "record" && session.hasPitch;
  const live = rec === "recording" && !micDenied;
  const liveBpm = live ? Math.round(simBpm(elapsed)) : null;

  // Ngăn kéo lên dây tự đo bằng micro này, nên thẻ tuner nhường để không tính pitch hai lần
  const tunerActive = tunerShown && tunerOpen && !micDenied && audio.ready && drawer !== "tuner";
  const pitchStream = usePitchStream({
    audio,
    enabled: tunerActive, // bước 04 sẽ mở rộng điều kiện này
    computePitch: session.hasPitch && tunerActive,
    fminHz: session.fminHz,
    fmaxHz: session.fmaxHz,
  });
  const tuner = useLiveTuner({ subscribe: pitchStream.subscribe, active: tunerActive });

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

  function makeFile(index: number): RecordingFile {
    const next = { ...SAMPLE.files[index] };
    if (demo.invalid === "format") next.fmt = "ogg";
    if (demo.invalid === "size") next.mb = 24.6;
    if (demo.invalid === "duration") next.dur = 5;
    return next;
  }

  function handleSend() {
    if (blocked || uploading || errorKind) return;
    if (mode === "record") {
      if (rec !== "preview" || !recorder.take) return;
      // TODO(BE): upload recorder.take.file trước khi navigate khi có API nộp bài
      submit(takeToRecordingFile(recorder.take));
    } else {
      if (!file) return;
      submit({ ...file, source: "upload" });
    }
    navigate(`/practice/${songId}/processing`);
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
    if (isMobile) navigate(`/practice/${songId}/${kind}`);
    else setDrawer(kind);
  }

  function switchMode(next: SubmitMode) {
    if (recActive) return;
    setMode(next);
    setFilePlaying(false);
  }

  const notices: string[] = [];
  if (demo.expired || left <= 0) notices.push(MSG.expired); // MSG-16
  if (demo.otherProc || submission?.status === "Đang xử lý") notices.push(MSG.busy); // GBR-49

  const sendDisabled = blocked || uploading || Boolean(errorKind);
  const sendLabel = uploading ? "Đang tải lên..." : "Gửi";

  return (
    <PracticeFrame>
      <PracticeTopBar
        title={SAMPLE.piece}
        subtitle={`${SAMPLE.className} · ${SAMPLE.instrument} · ${SAMPLE.lesson}`}
        rightSlot={<DemoPanel />}
        deadlineSlot={
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-bvc-border bg-bvc-panel px-3.5 py-2.25 text-[13.5px]">
            <span className="text-bvc-muted">Hạn nộp</span>
            <span className="font-semibold text-bvc-ink">{SAMPLE.deadline}</span>
            <span className="h-4 w-px bg-bvc-border-strong" />
            <span className="text-bvc-muted">Còn</span>
            <span className="font-semibold text-bvc-ink">{left}</span>
            <span className="text-bvc-muted">lượt nộp</span>
          </div>
        }
      />
      <p className="shrink-0 px-4.5 pb-2.5 text-[13px] text-bvc-muted md:hidden">
        Hạn nộp {SAMPLE.deadline} · Còn {left} lượt nộp
      </p>

      {/* Điện thoại: `contents` giữ nguyên bố cục cũ; từ md thành cột cuộn của bản laptop */}
      <div className="contents md:flex md:min-h-0 md:flex-1 md:flex-col md:gap-5 md:overflow-y-auto md:px-8 md:pt-6 md:pb-7">
        <div className={cn("contents md:grid md:gap-5", tunerShown ? "md:grid-cols-2" : "md:grid-cols-1")}>
          <div className="mx-3.5 md:mx-0">
            {mode === "record" && (
              <TempoCard
                open={tempoOpen}
                onToggle={() => setTempoOpen((value) => !value)}
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

        <div className="contents lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[1fr_3fr] lg:gap-5">
          <AssignmentInfoCard left={left} />

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
                uploading={uploading}
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
                onSend={handleSend}
              />
            ) : (
              <UploadPanel
                file={file}
                playing={filePlaying}
                position={filePos}
                blocked={blocked}
                uploading={uploading}
                errorText={fileErrorMessage(errorKind)}
                weakMessage={MSG.weak}
                sendDisabled={sendDisabled}
                sendLabel={sendLabel}
                onPick={() => {
                  if (blocked) return;
                  setFile(makeFile(0));
                  setFileIdx(0);
                  setFilePos(0);
                  setFilePlaying(false);
                }}
                onPickOther={() => {
                  if (blocked) return;
                  const next = (fileIdx + 1) % SAMPLE.files.length;
                  setFile(makeFile(next));
                  setFileIdx(next);
                  setFilePos(0);
                  setFilePlaying(false);
                }}
                onTogglePlay={() => setFilePlaying((value) => !value)}
                onSend={handleSend}
              />
            )}
          </div>
        </div>
      </div>

      {drawer && !isMobile && (
        <PracticeDrawer
          title={drawer === "tuner" ? "Lên dây" : "Metronome"}
          subtitle={
            drawer === "tuner"
              ? `${SAMPLE.instrument} · 4 dây · A4 440 Hz`
              : `${SAMPLE.piece} · tốc độ yêu cầu ${SAMPLE.targetBpm} BPM`
          }
          onClose={() => setDrawer(null)}
        >
          {drawer === "tuner" ? <TunerView audio={audio} /> : <MetronomeView />}
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
    </PracticeFrame>
  );
}
