import type { Instrument } from "@/features/classes/types/classTypes";

// Class code: <subject>.<slot>.<half>, e.g. DNH103.M2.H1
// (subject DNH103 starts with the instrument code DNH, M2 = slot 2, H1 = half 1 of the semester).
export const CLASS_CODE_EXAMPLE = "DNH103.M2.H1";

export interface ParsedClassCode {
  subject: string;
  slot: string;
  half: string;
}

// "M2" -> "2", "H1" -> "1"; a part without a letter prefix is kept as typed.
const stripPrefix = (part: string) => part.replace(/^[A-Z]+/, "") || part;

export function parseClassCode(value: string): ParsedClassCode | null {
  const parts = value.trim().toUpperCase().split(".");
  if (parts.length !== 3 || parts.some((part) => part === "")) return null;
  const [subject, slot, half] = parts;
  return { subject, slot: stripPrefix(slot), half: stripPrefix(half) };
}

// The subject starts with the instrument code; the longest matching code wins (e.g. DNH over DN).
export function findInstrumentBySubject(instruments: Instrument[], subject: string): Instrument | null {
  return instruments.reduce<Instrument | null>((best, instrument) => {
    const code = instrument.code.toUpperCase();
    if (!code || !subject.startsWith(code)) return best;
    return best && best.code.length >= code.length ? best : instrument;
  }, null);
}

export function buildClassDescription(instrumentName: string, parsed: ParsedClassCode): string {
  return `Lớp ${instrumentName} slot ${parsed.slot} half ${parsed.half}`;
}
