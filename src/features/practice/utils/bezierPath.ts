interface CubicSegment {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
}

const BISECT_STEPS = 24;

// Đọc đường "M x y C x1 y1, x2 y2, x y ..." (tọa độ tuyệt đối, x tăng dần) thành các đoạn Bézier bậc 3
export function parseCubicPath(d: string): CubicSegment[] {
  const nums = (d.match(/-?\d*\.?\d+/g) ?? []).map(Number);
  const segments: CubicSegment[] = [];
  let x0 = nums[0];
  let y0 = nums[1];
  for (let i = 2; i + 5 < nums.length; i += 6) {
    const [x1, y1, x2, y2, x3, y3] = nums.slice(i, i + 6);
    segments.push({ x0, y0, x1, y1, x2, y2, x3, y3 });
    x0 = x3;
    y0 = y3;
  }
  return segments;
}

const bezier = (a: number, b: number, c: number, d: number, t: number) => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};

// Giá trị y của đường tại hoành độ x; null nếu x nằm ngoài đường
export function yAtX(segments: CubicSegment[], x: number): number | null {
  const segment = segments.find((item) => x >= item.x0 && x <= item.x3);
  if (!segment) return null;
  let low = 0;
  let high = 1;
  for (let step = 0; step < BISECT_STEPS; step += 1) {
    const middle = (low + high) / 2;
    if (bezier(segment.x0, segment.x1, segment.x2, segment.x3, middle) < x) low = middle;
    else high = middle;
  }
  const t = (low + high) / 2;
  return bezier(segment.y0, segment.y1, segment.y2, segment.y3, t);
}
