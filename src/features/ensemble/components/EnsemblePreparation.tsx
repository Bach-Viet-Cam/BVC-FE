import { useState } from "react";
import { FormDialog } from "@/shared/components/bvc/FormDialog";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { MetronomeView } from "@/features/practice/components/MetronomeView";
import { CentsMeter } from "@/features/practice/components/CentsMeter";
import { usePracticeAudio } from "@/features/practice/hooks/usePracticeAudio";
import { useInstrumentTunes } from "@/features/practice/hooks/useInstrumentTunes";
import { useTuner } from "@/features/practice/hooks/useTuner";

function EnsembleTuner({ sheetId }: { sheetId: string }) {
  const audio = usePracticeAudio({ micWanted: true, fminHz: 65 });
  const tunes = useInstrumentTunes(sheetId);
  const tuner = useTuner({ audio, micDenied: audio.micState === "denied", strings: tunes.strings });
  return (
    <div className="flex min-w-0 flex-col gap-4 px-6 pb-6">
      <div className="flex flex-wrap gap-2">
        {tunes.strings.map((string, index) => (
          <button
            type="button"
            key={string.code}
            onClick={() => tuner.pickString(index)}
            aria-pressed={tuner.selected === index}
            className="min-h-11 rounded-bvc-md border border-bvc-border px-3 text-sm aria-pressed:bg-bvc-ink aria-pressed:text-white"
          >
            {string.code}
          </button>
        ))}
      </div>
      <p role="status" className="text-center text-lg font-semibold">
        {audio.micState === "denied"
          ? "Cho phép micro để lên dây."
          : tuner.live
            ? `${tuner.note?.en ?? ""} · ${tuner.hz?.toFixed(1)} Hz`
            : "Gảy một dây để kiểm tra cao độ"}
      </p>
      <CentsMeter cents={tuner.cents} live={tuner.live} />
    </div>
  );
}

export function EnsemblePreparation({
  sheetId,
  targetBpm,
  disabled,
  onOpen,
}: {
  sheetId: string | null;
  targetBpm: number;
  disabled: boolean;
  onOpen: () => void;
}) {
  const [tool, setTool] = useState<"tuner" | "tempo" | null>(null);
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <ActionButton
          variant="secondary"
          disabled={disabled || !sheetId}
          onClick={() => {
            onOpen();
            setTool("tuner");
          }}
        >
          Lên dây
        </ActionButton>
        <ActionButton
          variant="secondary"
          disabled={disabled}
          onClick={() => {
            onOpen();
            setTool("tempo");
          }}
        >
          Tập nhịp · {targetBpm} BPM
        </ActionButton>
      </div>
      <FormDialog open={tool !== null} onClose={() => setTool(null)} title={tool === "tuner" ? "Lên dây" : "Tập nhịp"}>
        {tool === "tuner" && sheetId && <EnsembleTuner sheetId={sheetId} />}
        {tool === "tempo" && <MetronomeView targetBpm={targetBpm} />}
      </FormDialog>
    </>
  );
}
