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
  MSG,
  NOTES,
  SAMPLE,
  TEMPO_TOLERANCE_PERCENT,
} from "@/features/practice/constants/practiceConstants";
import { usePracticeDemo } from "@/features/practice/context/PracticeDemoContext";
import { useRecorder } from "@/features/practice/hooks/useRecorder";
import { noteAt, simBpm, simCents } from "@/features/practice/utils/practiceSimulation";
import { fileErrorMessage, validateFile } from "@/features/practice/utils/validateRecording";
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
  const [clickBeat, setClickBeat] = useState(0);

  const recorder = useRecorder({
    autoStop: demo.autoStop,
    onAutoStop: () => toast.info(MSG.autoStop), // MSG-44
  });

  const { rec, elapsed, countBeat, takeLen } = recorder;
  const recActive = rec === "countin" || rec === "recording";
  const canOpenDetail = mode === "record" && (rec === "idle" || rec === "preview");

  // Tiếng gõ nhịp chạy tự do khi chưa ghi âm
  useEffect(() => {
    if (!clickOn) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const beatMs = 60000 / SAMPLE.targetBpm;
      setClickBeat(Math.floor((Date.now() - start) / beatMs) % COUNT_IN_BEATS);
    }, 40);
    return () => clearInterval(timer);
  }, [clickOn]);

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

  const tunerShown = mode === "record" && !demo.noPitch;
  const live = rec === "recording" && !demo.micDenied;
  const liveBpm = live ? Math.round(simBpm(elapsed)) : null;
  const cents = live ? simCents(elapsed) : 0;
  const expectedNote = NOTES[noteAt(elapsed).name];
  const detectedNote = live ? expectedNote : null;
  const detectedHz = live && detectedNote ? detectedNote.f * Math.pow(2, cents / 1200) : null;

  const bpmHint = useMemo(() => {
    if (rec === "countin") return "Đang đếm nhịp";
    if (!live || liveBpm === null) return demo.micDenied ? "" : "Đang lắng nghe";
    const diff = ((liveBpm - SAMPLE.targetBpm) / SAMPLE.targetBpm) * 100;
    if (Math.abs(diff) <= TEMPO_TOLERANCE_PERCENT) return "Đúng nhịp";
    return diff > 0 ? "Hơi nhanh" : "Hơi chậm";
  }, [rec, live, liveBpm, demo.micDenied]);

  const hintTone = bpmHint === "Đúng nhịp" ? "ok" : bpmHint === "Hơi nhanh" || bpmHint === "Hơi chậm" ? "warn" : "idle";

  const litBeat = recActive
    ? rec === "countin"
      ? countBeat
      : Math.floor((elapsed * SAMPLE.targetBpm) / 60) % COUNT_IN_BEATS
    : clickOn
      ? clickBeat
      : -1;

  // Bản thu mô phỏng: dung lượng suy ra từ thời lượng
  const errorKind = useMemo(() => {
    if (mode === "record") {
      if (rec !== "preview") return "";
      if (demo.invalid !== "none") return demo.invalid;
      return validateFile({
        name: "ban-thu-vua-ghi.wav",
        fmt: "wav",
        mb: Math.max(0.2, Math.round(takeLen) * 0.1),
        dur: takeLen,
      });
    }
    return file ? validateFile(file) : "";
  }, [mode, rec, demo.invalid, takeLen, file]);

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
      if (rec !== "preview") return;
      const dur = Math.round(takeLen);
      submit({ name: "ban-thu-vua-ghi.wav", fmt: "wav", mb: Math.max(0.2, dur * 0.1), dur, source: "record" });
    } else {
      if (!file) return;
      submit({ ...file, source: "upload" });
    }
    navigate(`/practice/${songId}/processing`);
  }

  function handleStart() {
    if (blocked || rec !== "idle") return;
    if (demo.micDenied) {
      setMicPopup(true); // MSG-10
      return;
    }
    recorder.start();
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
            <TempoCard
              open={tempoOpen}
              onToggle={() => setTempoOpen((value) => !value)}
              liveBpm={liveBpm}
              bpmHint={bpmHint}
              hintTone={hintTone}
              litBeat={litBeat}
              clickOn={clickOn}
              onToggleClick={() => setClickOn((value) => !value)}
              canOpenDetail={canOpenDetail}
              onOpenMetronome={() => openDetail("metronome")}
              micDenied={demo.micDenied}
            />
          </div>

          {tunerShown && (
            <div className="mx-3.5 mt-2.5 md:mx-0 md:mt-0">
              <TunerCard
                open={tunerOpen}
                onToggle={() => setTunerOpen((value) => !value)}
                live={live}
                cents={cents}
                detectedNote={detectedNote}
                detectedHz={detectedHz}
                expectedNote={expectedNote}
                canOpenDetail={canOpenDetail}
                onOpenTuner={() => openDetail("tuner")}
                micDenied={demo.micDenied}
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
                takeLen={takeLen}
                playing={recorder.playing}
                playPos={recorder.playPos}
                blocked={blocked}
                micDenied={demo.micDenied}
                uploading={uploading}
                errorText={fileErrorMessage(errorKind)}
                weakMessage={MSG.weak}
                sendDisabled={sendDisabled}
                sendLabel={sendLabel}
                onStart={handleStart}
                onStop={recorder.stop}
                onTogglePlay={recorder.togglePlay}
                onRerecord={recorder.reset}
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
          {drawer === "tuner" ? <TunerView /> : <MetronomeView />}
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
