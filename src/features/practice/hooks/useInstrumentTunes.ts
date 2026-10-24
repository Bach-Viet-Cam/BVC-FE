import { useMemo } from "react";
import { practiceContextApi } from "@/features/practice/api/practiceContextApi";
import type { PracticeInstrumentTunes } from "@/features/practice/types/practiceContextTypes";
import type { StringInfo } from "@/features/practice/types/practiceTypes";
import { hzToMidiFloat, midiToNoteInfo } from "@/features/practice/utils/noteMath";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

// Dây chuẩn của nhạc cụ thuộc bản nhạc (instrument_tunes), đổi sang dạng màn lên dây dùng:
// tên dây do quản trị đặt, nốt gần nhất với cao độ chuẩn và tần số chuẩn
export function toTunerStrings(data: PracticeInstrumentTunes | null): StringInfo[] {
  return (data?.tunes ?? []).map((tune) => {
    const note = midiToNoteInfo(Math.round(hzToMidiFloat(tune.pitchHz)));
    return { code: tune.name, vn: note.vn, en: note.en, f: tune.pitchHz, off: 0 };
  });
}

export function useInstrumentTunes(sheetMusicId: string) {
  const { data, error, isLoading } = useAsyncData<PracticeInstrumentTunes | null>(
    () => (sheetMusicId ? practiceContextApi.getTunes(sheetMusicId) : Promise.resolve(null)),
    `practice-tunes:${sheetMusicId}`,
    undefined,
    { cache: true }
  );
  const strings = useMemo(() => toTunerStrings(data), [data]);

  return { strings, instrumentName: data?.instrument.name ?? null, error, isLoading };
}
