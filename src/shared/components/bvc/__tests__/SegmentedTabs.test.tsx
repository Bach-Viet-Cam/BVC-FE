import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SegmentedTabs } from "@/shared/components/bvc/SegmentedTabs";

describe("SegmentedTabs", () => {
  const tabs = [
    { value: "all", label: "Tất cả" },
    { value: "student", label: "Sinh viên" },
    { value: "teacher", label: "Giảng viên" },
    { value: "admin", label: "Quản trị viên" },
  ] as const;

  it("renders 4 tabs with proper tablist and tab roles", () => {
    const handleChange = vi.fn();
    render(
      <SegmentedTabs
        label="Chọn vai trò"
        tabs={tabs}
        value="student"
        onChange={handleChange}
      />
    );

    const tablist = screen.getByRole("tablist", { name: "Chọn vai trò" });
    expect(tablist).toBeInTheDocument();
    expect(tablist.className).toContain("flex-nowrap");
    expect(tablist.className).toContain("overflow-x-auto");

    const tabButtons = screen.getAllByRole("tab");
    expect(tabButtons).toHaveLength(4);

    tabButtons.forEach((btn) => {
      expect(btn.className).toContain("shrink-0");
      expect(btn.className).toContain("whitespace-nowrap");
    });

    const activeTab = screen.getByRole("tab", { name: "Sinh viên" });
    expect(activeTab).toHaveAttribute("aria-selected", "true");

    const inactiveTab = screen.getByRole("tab", { name: "Giảng viên" });
    expect(inactiveTab).toHaveAttribute("aria-selected", "false");

    fireEvent.click(inactiveTab);
    expect(handleChange).toHaveBeenCalledWith("teacher");
  });

  it("renders both responsive desktop tabs and mobile Select trigger when collapseBreakpoint is set", () => {
    const handleChange = vi.fn();
    render(
      <SegmentedTabs
        label="Chọn vai trò"
        tabs={tabs}
        value="admin"
        onChange={handleChange}
        collapseBreakpoint="lg"
      />
    );

    const tablist = screen.getByRole("tablist", { name: "Chọn vai trò" });
    expect(tablist.className).toContain("hidden lg:inline-flex");

    const trigger = screen.getByRole("combobox", { name: "Chọn vai trò" });
    expect(trigger).toBeInTheDocument();
  });
});
