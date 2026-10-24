import { describe, expect, it } from "vitest";
import { toTunerStrings } from "@/features/practice/hooks/useInstrumentTunes";

describe("toTunerStrings", () => {
  it("đổi dây chuẩn từ BE sang dây của màn lên dây: tên dây, nốt gần nhất và tần số chuẩn", () => {
    const strings = toTunerStrings({
      instrument: { id: "inst-nhi", name: "Đàn nhị" },
      tunes: [
        { id: "t1", name: "Dây trong", pitchHz: 293.66, displayOrder: 1 },
        { id: "t2", name: "Dây ngoài", pitchHz: 440, displayOrder: 2 },
      ],
    });
    expect(strings).toEqual([
      { code: "Dây trong", vn: "Rê", en: "D4", f: 293.66, off: 0 },
      { code: "Dây ngoài", vn: "La", en: "A4", f: 440, off: 0 },
    ]);
  });

  it("chưa có dữ liệu thì không có dây nào", () => {
    expect(toTunerStrings(null)).toEqual([]);
  });
});
