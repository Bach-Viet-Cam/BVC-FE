import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, MoreVertical } from "lucide-react";

import { SheetViewer } from "@/features/practice/components/SheetViewer";
import { TunerWidget } from "@/features/practice/components/TunerWidget";
import { MetronomeWidget } from "@/features/practice/components/MetronomeWidget";
import { PracticeModeBar } from "@/features/practice/components/PracticeModeBar";
import { WaveformBar } from "@/features/practice/components/WaveformBar";
import type {
  PracticeMode,
  Song,
  TeacherNote,
  TunerState,
  MicQuality,
} from "@/features/practice/types/practiceTypes";

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_SONG: Song = {
  id: "ly-ngua-o",
  title: "Lý ngựa ô",
  instrument: "Đàn tranh",
  level: "Trung cấp",
  currentPage: 2,
  totalPages: 3,
};

const MOCK_TEACHER_NOTE: TeacherNote = {
  id: "note-1",
  teacherName: "cô Hương",
  barNumber: 18,
  content:
    "Đoạn này giảm tốc, nhấn mạnh nốt đầu phách. Luyện riêng 18–24 trước khi ghép cả bài.",
};

const MOCK_TUNER: TunerState = {
  noteName: "Rê",
  scientificNote: "D4",
  frequency: 291.2,
  cents: -12,
};

const MOCK_MIC: MicQuality = {
  status: "good",
  label: "Chất lượng thu: tốt",
  deviceLabel: "Mic tai nghe",
  sampleRate: "44.1 kHz",
  hasClipping: false,
};

// ─────────────────────────────────────────────────────────────────────────────

export function PracticePage() {
  const navigate = useNavigate();
  const { songId } = useParams();

  const [mode, setMode] = useState<PracticeMode>("full");
  const [bpm, setBpm] = useState(72);
  const [currentBeat] = useState(0);

  const song = MOCK_SONG;
  const barRange = { start: 17, end: 32 };

  function handleRecord() {
    navigate(`/practice/${songId}/recording`);
  }

  return (
    /* Outer centering wrapper — bg shows on desktop */
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      {/* Mobile frame — full viewport height, no scroll */}
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">

        {/* ── 1. Header ─────────────────────────────────────────────────── */}
        <header className="flex shrink-0 items-center gap-[8px] px-[14px] pb-[10px] pt-[26px]">
          <button
            type="button"
            aria-label="Quay lại"
            onClick={() => navigate(-1)}
            className="flex size-[44px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] text-bvc-ink"
          >
            <ChevronLeft size={21} strokeWidth={1.8} />
          </button>

          <div className="flex min-w-0 flex-1 flex-col gap-[1px]">
            <div className="truncate text-[18px] font-extrabold leading-tight tracking-[-0.02em] text-bvc-ink">
              {song.title}
            </div>
            <div className="text-[12px] text-bvc-muted">
              {song.instrument} · {song.level} · trang {song.currentPage}/{song.totalPages}
            </div>
          </div>

          <button
            type="button"
            aria-label="Tùy chọn bài"
            className="flex size-[44px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong bg-white text-bvc-ink"
          >
            <MoreVertical size={19} strokeWidth={2} />
          </button>
        </header>

        {/* ── 2. Sheet viewer ───────────────────────────────────────────── */}
        <div className="mx-[14px] flex-1 overflow-hidden">
          <SheetViewer
            song={song}
            teacherNote={MOCK_TEACHER_NOTE}
            barRange={barRange}
            onMyNotes={() => {}}
            onBookmark={() => {}}
          />
        </div>

        {/* ── 3. Tuner + Metronome ──────────────────────────────────────── */}
        <div className="mx-[14px] mt-3 flex shrink-0 gap-[10px]">
          <TunerWidget state={MOCK_TUNER} />
          <MetronomeWidget
            bpm={bpm}
            timeSignature="4/4"
            currentBeat={currentBeat}
            onBpmChange={setBpm}
          />
        </div>

        {/* ── 4. Mode chips ─────────────────────────────────────────────── */}
        <div className="mt-3 shrink-0">
          <PracticeModeBar mode={mode} onModeChange={setMode} />
        </div>

        {/* ── 5. Waveform + Record ──────────────────────────────────────── */}
        <WaveformBar micQuality={MOCK_MIC} onRecord={handleRecord} />
      </div>
    </div>
  );
}
