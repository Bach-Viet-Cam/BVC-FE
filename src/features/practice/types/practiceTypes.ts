export type PracticeMode = "full" | "section" | "slow" | "step";

export interface Song {
  id: string;
  title: string;
  instrument: string;
  level: string;
  currentPage: number;
  totalPages: number;
}

export interface TeacherNote {
  id: string;
  teacherName: string;
  barNumber: number;
  content: string;
}

export interface TunerState {
  noteName: string;
  scientificNote: string;
  frequency: number;
  cents: number;
}

export interface MetronomeState {
  bpm: number;
  timeSignature: string;
  currentBeat: number;
}

export interface MicQuality {
  status: "good" | "warning" | "error";
  label: string;
  deviceLabel: string;
  sampleRate: string;
  hasClipping: boolean;
}
