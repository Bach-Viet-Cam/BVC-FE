import { describe, expect, it } from "vitest";
import {
  calculateEndDate,
  formatCurrentWeek,
  formatDateRange,
  formatIsoDate,
  maskDateInput,
  parseVietnameseDate,
  todayInVietnam,
} from "@/features/classes/utils/classFormat";
import { checkImportFile } from "@/features/classes/hooks/useImportStudents";

describe("classFormat", () => {
  it("computes the end date as start + 6 weeks", () => {
    expect(calculateEndDate("2026-09-01")).toBe("2026-10-13");
    expect(calculateEndDate("")).toBe("");
  });

  it("formats the current week of a class out of 6", () => {
    expect(formatCurrentWeek("2026-09-30", "ACTIVE", "2026-09-30")).toBe("1/6");
    expect(formatCurrentWeek("2026-09-30", "ACTIVE", "2026-10-21")).toBe("4/6");
    expect(formatCurrentWeek("2026-09-30", "ACTIVE", "2026-12-31")).toBe("6/6");
    expect(formatCurrentWeek("2026-11-01", "ACTIVE", "2026-10-21")).toBe("—");
    expect(formatCurrentWeek("2026-09-30", "ENDED", "2026-10-02")).toBe("6/6");
  });

  it("formats dates as dd/MM/yyyy and card ranges as dd/mm – dd/mm/yyyy", () => {
    expect(formatIsoDate("2026-09-01")).toBe("01/09/2026");
    expect(formatDateRange("2026-09-01", "2026-10-13")).toBe("01/09 – 13/10/2026");
  });

  it("parses dd/MM/yyyy and masks typed digits", () => {
    expect(parseVietnameseDate("01/09/2026")).toBe("2026-09-01");
    expect(parseVietnameseDate("31/02/2026")).toBeNull();
    expect(parseVietnameseDate("2026-09-01")).toBeNull();
    expect(maskDateInput("01092026")).toBe("01/09/2026");
    expect(maskDateInput("01/0")).toBe("01/0");
  });

  it("uses the Vietnam calendar day for today", () => {
    expect(todayInVietnam(new Date("2026-10-14T17:00:00Z"))).toBe("2026-10-15");
  });
});

describe("checkImportFile", () => {
  it("accepts .xlsx/.csv up to 2 MB and rejects other files", () => {
    expect(checkImportFile(new File(["a"], "ds.XLSX"))).toBeNull();
    expect(checkImportFile(new File(["a"], "ds.csv"))).toBeNull();
    expect(checkImportFile(new File(["a"], "ds.pdf"))).toMatch(/Định dạng file không được hỗ trợ/);
    const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "big.csv");
    expect(checkImportFile(big)).toBe("File vượt quá dung lượng tối đa 2 MB.");
  });
});
