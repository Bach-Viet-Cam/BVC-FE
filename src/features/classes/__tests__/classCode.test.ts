import { describe, expect, it } from "vitest";
import { buildClassDescription, findInstrumentBySubject, parseClassCode } from "@/features/classes/utils/classCode";

const instruments = [
  { id: "i1", code: "DNH", name: "Đàn nhị", isActive: true },
  { id: "i2", code: "DTR", name: "Đàn tranh", isActive: true },
];

describe("classCode", () => {
  it("splits subject, slot and half on dots", () => {
    expect(parseClassCode("DNH103.M2.H1")).toEqual({ subject: "DNH103", slot: "2", half: "1" });
    expect(parseClassCode(" dnh103.m2.h2 ")).toEqual({ subject: "DNH103", slot: "2", half: "2" });
    expect(parseClassCode("DNH103.3.4")).toEqual({ subject: "DNH103", slot: "3", half: "4" });
  });

  it("rejects codes without exactly three dot-separated parts", () => {
    expect(parseClassCode("TRD301")).toBeNull();
    expect(parseClassCode("DNH103.M2")).toBeNull();
    expect(parseClassCode("DNH103..H1")).toBeNull();
    expect(parseClassCode("DNH103.M2.H1.X")).toBeNull();
  });

  it("maps the subject to an instrument by code and builds the description", () => {
    const parsed = parseClassCode("DNH103.M2.H1")!;
    const instrument = findInstrumentBySubject(instruments, parsed.subject);
    expect(instrument?.id).toBe("i1");
    expect(buildClassDescription(instrument!.name, parsed)).toBe("Lớp Đàn nhị slot 2 half 1");
    expect(findInstrumentBySubject(instruments, "DBA101")).toBeNull();
  });
});
