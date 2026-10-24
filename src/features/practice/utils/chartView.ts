import { fmtTime } from "@/features/practice/utils/practiceFormat";

// Cửa sổ đang xem của biểu đồ cao độ: thời gian (giây) và cao độ (số MIDI thực, 1 = nửa cung)
export interface ChartView {
  t0: number;
  t1: number;
  m0: number;
  m1: number;
}

// Giới hạn khi phóng to: ít nhất 1 giây và nửa cung trong khung
export const MIN_VIEW_SECONDS = 1;
export const MIN_VIEW_SEMITONES = 0.5;

function clampSpan(start: number, end: number, low: number, high: number, minSpan: number): [number, number] {
  const span = Math.min(Math.max(end - start, minSpan), high - low);
  const clampedStart = Math.min(Math.max(start, low), high - span);
  return [clampedStart, clampedStart + span];
}

// Giữ cửa sổ trong giới hạn dữ liệu (bounds) và không nhỏ hơn mức phóng tối đa
export function clampView(view: ChartView, bounds: ChartView): ChartView {
  const [t0, t1] = clampSpan(view.t0, view.t1, bounds.t0, bounds.t1, MIN_VIEW_SECONDS);
  const [m0, m1] = clampSpan(view.m0, view.m1, bounds.m0, bounds.m1, MIN_VIEW_SEMITONES);
  return { t0, t1, m0, m1 };
}

// Phóng to (factor > 1) hoặc thu nhỏ quanh điểm neo (giây, MIDI), điểm neo giữ nguyên vị trí trên màn hình
export function zoomView(
  view: ChartView,
  factor: number,
  anchor: { seconds: number; midi: number },
  bounds: ChartView
): ChartView {
  const scale = 1 / factor;
  return clampView(
    {
      t0: anchor.seconds - (anchor.seconds - view.t0) * scale,
      t1: anchor.seconds + (view.t1 - anchor.seconds) * scale,
      m0: anchor.midi - (anchor.midi - view.m0) * scale,
      m1: anchor.midi + (view.m1 - anchor.midi) * scale,
    },
    bounds
  );
}

// Dịch cửa sổ theo số giây / số nửa cung
export function panView(view: ChartView, deltaSeconds: number, deltaMidi: number, bounds: ChartView): ChartView {
  return clampView(
    { t0: view.t0 + deltaSeconds, t1: view.t1 + deltaSeconds, m0: view.m0 + deltaMidi, m1: view.m1 + deltaMidi },
    bounds
  );
}

export function isZoomed(view: ChartView, base: ChartView): boolean {
  const epsilon = 1e-6;
  return view.t1 - view.t0 < base.t1 - base.t0 - epsilon || view.m1 - view.m0 < base.m1 - base.m0 - epsilon;
}

// Nhãn mốc thời gian: phóng sâu (khung dưới 10 giây) thì ghi thêm phần mười giây để các mốc không trùng nhau
export function formatTick(seconds: number, viewSeconds: number): string {
  if (viewSeconds >= 10) return fmtTime(seconds);
  const totalTenths = Math.round(seconds * 10);
  return `${fmtTime(Math.floor(totalTenths / 10))}.${totalTenths % 10}`;
}
