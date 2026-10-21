import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClassForm } from "@/features/classes/components/ClassForm";
import { type ClassDetail, type Instrument } from "@/features/classes/types/classTypes";
import { addDays, formatIsoDate, todayInVietnam } from "@/features/classes/utils/classFormat";

const INSTRUMENTS: Instrument[] = [
  { id: "i-tranh", name: "Đàn tranh", isActive: true },
  { id: "i-bau", name: "Đàn bầu", isActive: true },
];

const STARTED_CLASS: ClassDetail = {
  id: "c1",
  name: "TRD301",
  cohort: "FA26",
  status: "ACTIVE",
  instrument: { id: "i-tranh", name: "Đàn tranh" },
  startDate: "2026-09-01",
  endDate: "2026-10-13",
  memberCount: 3,
  description: null,
  hasStarted: true,
  isReadOnly: false,
  endedAt: null,
};

function renderForm(classDetail: ClassDetail | null, onSubmit = vi.fn().mockResolvedValue(null)) {
  render(
    <ClassForm
      classDetail={classDetail}
      instruments={INSTRUMENTS}
      isSaving={false}
      onCancel={vi.fn()}
      onSubmit={onSubmit}
    />
  );
  return onSubmit;
}

describe("ClassForm", () => {
  it("shows MSG-35 for every blank required field and does not submit", async () => {
    const onSubmit = renderForm(null);
    await userEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(await screen.findByText("Tên lớp không được để trống.")).toBeInTheDocument();
    expect(screen.getByText("Khóa không được để trống.")).toBeInTheDocument();
    expect(screen.getByText("Nhạc cụ không được để trống.")).toBeInTheDocument();
    expect(screen.getByText("Ngày bắt đầu không được để trống.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects a past start date on create and computes the end date", async () => {
    renderForm(null);
    const startInput = screen.getByLabelText(/Ngày bắt đầu/);
    await userEvent.type(startInput, formatIsoDate(addDays(todayInVietnam(), -1)).replace(/\//g, ""));
    await userEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(await screen.findByText("Ngày bắt đầu không được ở quá khứ.")).toBeInTheDocument();
  });

  it("submits trimmed values and keeps them when the server reports a duplicate name (MSG-05)", async () => {
    const onSubmit = renderForm(
      null,
      vi.fn().mockResolvedValue([{ field: "name", code: "MSG-05", message: "Tên lớp này đã được sử dụng." }])
    );
    const startDate = addDays(todayInVietnam(), 3);
    await userEvent.type(screen.getByLabelText(/Tên lớp/), "  TRD301 ");
    await userEvent.type(screen.getByLabelText(/Khóa/), "FA26");
    await userEvent.selectOptions(screen.getByLabelText(/Nhạc cụ/), "i-bau");
    await userEvent.type(screen.getByLabelText(/Ngày bắt đầu/), formatIsoDate(startDate).replace(/\//g, ""));
    expect(screen.getByLabelText(/Ngày bắt đầu/)).toHaveValue(formatIsoDate(startDate));
    expect(screen.getByLabelText("Ngày kết thúc")).toHaveValue(formatIsoDate(addDays(startDate, 42)));

    await userEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(onSubmit).toHaveBeenCalledWith({
      name: "TRD301",
      cohort: "FA26",
      description: null,
      instrumentId: "i-bau",
      startDate,
    });
    expect(await screen.findByText("Tên lớp này đã được sử dụng.")).toBeInTheDocument();
    expect(screen.getByLabelText(/Tên lớp/)).toHaveValue("  TRD301 ");
  });

  it("rejects an impossible date", async () => {
    renderForm(null);
    await userEvent.type(screen.getByLabelText(/Ngày bắt đầu/), "31022027");
    await userEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(await screen.findByText("Ngày bắt đầu không hợp lệ. Nhập theo dạng dd/mm/yyyy.")).toBeInTheDocument();
  });

  it("locks instrument and start date once the class has started and does not send them (GBR-36)", async () => {
    const onSubmit = renderForm(STARTED_CLASS);
    const instrumentField = screen.getByLabelText(/Nhạc cụ/);
    expect(instrumentField.tagName).toBe("INPUT");
    expect(instrumentField).toHaveAttribute("readonly");
    expect(screen.getByLabelText(/Ngày bắt đầu/)).toHaveAttribute("readonly");

    await userEvent.clear(screen.getByLabelText(/Tên lớp/));
    await userEvent.type(screen.getByLabelText(/Tên lớp/), "TRD301 mới");
    await userEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(onSubmit).toHaveBeenCalledWith({ name: "TRD301 mới", cohort: "FA26", description: null });
  });
});
