import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PracticeDrawer } from "@/features/practice/components/PracticeDrawer";
import { TunerView } from "@/features/practice/components/TunerView";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { MetronomeView } from "@/features/practice/components/MetronomeView";
import { TempoCard } from "@/features/practice/components/TempoCard";
import { TunerCard } from "@/features/practice/components/TunerCard";
import { type PracticeAudio } from "@/features/practice/hooks/usePracticeAudio";
import { useInstrumentTunes } from "@/features/practice/hooks/useInstrumentTunes";
import { useLiveTuner } from "@/features/practice/hooks/useLiveTuner";
import { type PitchStream } from "@/features/practice/hooks/usePitchStream";
import { type EnsembleLiveTempo } from "@/features/ensemble/hooks/useEnsembleLiveTempo";

/** Hai thẻ Nhịp + Tuner như trang luyện tập, đặt chung một hàng (từ md). */
export function EnsemblePreparation({
  sheetId,
  targetBpm,
  disabled,
  onOpen,
  audio,
  pitchStream,
  tempo,
  clickOn,
  onToggleClick,
}: {
  sheetId: string | null;
  targetBpm: number;
  /** Đang đếm nhịp/thu/đã có bản thu: khóa mở chi tiết và tuner. */
  disabled: boolean;
  onOpen: () => void;
  audio: PracticeAudio;
  pitchStream: PitchStream;
  tempo: EnsembleLiveTempo;
  clickOn: boolean;
  onToggleClick: () => void;
}) {
  const [tool, setTool] = useState<"tuner" | "tempo" | null>(null);
  const [tempoOpen, setTempoOpen] = useState(true);
  const [tunerOpen, setTunerOpen] = useState(true);

  const tunes = useInstrumentTunes(sheetId ?? "");
  const micDenied = audio.micState === "denied";
  // Hộp lên dây tự đo bằng micro này, nên thẻ nhường để không tính cao độ hai lần
  const tunerActive = Boolean(sheetId) && tunerOpen && !disabled && !micDenied && audio.ready && tool !== "tuner";
  const tuner = useLiveTuner({ subscribe: pitchStream.subscribe, active: tunerActive });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const assignmentId = searchParams.get("assignmentId");

  // Điện thoại: sang trang riêng như trang luyện tập. Laptop: ngăn kéo, không rời phòng hòa tấu.
  const open = (next: "tuner" | "tempo") => {
    onOpen();
    if (isMobile && sheetId) {
      const kind = next === "tuner" ? "tuner" : "metronome";
      navigate(`/practice/sheets/${sheetId}/${kind}${assignmentId ? `?assignmentId=${assignmentId}` : ""}`);
      return;
    }
    setTool(next);
  };

  return (
    <>
      <div className="grid min-w-0 grid-cols-2 items-stretch gap-2 md:gap-5 lg:h-full lg:grid-cols-1 lg:grid-rows-2">
        <TempoCard
          open={tempoOpen}
          onToggle={() => setTempoOpen((value) => !value)}
          targetBpm={targetBpm}
          liveBpm={tempo.liveBpm}
          bpmHint={tempo.bpmHint}
          hintTone={tempo.hintTone}
          litBeat={tempo.litBeat}
          clickOn={clickOn}
          onToggleClick={onToggleClick}
          canOpenDetail={!disabled}
          onOpenMetronome={() => open("tempo")}
          micDenied={micDenied}
          compact
        />
        {sheetId && (
          <TunerCard
            open={tunerOpen}
            onToggle={() => setTunerOpen((value) => !value)}
            live={tuner.live}
            cents={tuner.cents}
            detectedNote={tuner.detectedNote}
            detectedHz={tuner.detectedHz}
            canOpenDetail={!disabled}
            onOpenTuner={() => open("tuner")}
            micDenied={micDenied}
            compact
          />
        )}
      </div>
      {tool && !isMobile && (
        <PracticeDrawer
          title={tool === "tuner" ? "Lên dây" : "Metronome"}
          subtitle={tool === "tuner" ? [tunes.instrumentName, "A4 440 Hz"].filter(Boolean).join(" · ") : undefined}
          onClose={() => setTool(null)}
        >
          {tool === "tuner" && sheetId ? (
            <TunerView audio={audio} tunes={tunes} />
          ) : (
            <MetronomeView key={targetBpm} targetBpm={targetBpm} />
          )}
        </PracticeDrawer>
      )}
    </>
  );
}
