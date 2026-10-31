import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import { MemoryRouter } from "react-router-dom";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { challengeApi } from "@/features/community/api/challengeApi";
import { ChallengeForm } from "@/features/community/components/ChallengeForm";
import { WeekPicker } from "@/features/community/components/WeekPicker";
import { type ClassSummary } from "@/features/classes/types/classTypes";
import { toast } from "@/shared/components/ui/toast";

vi.mock("@/features/community/api/challengeApi", () => ({
  challengeApi: { create: vi.fn(), update: vi.fn(), publish: vi.fn(), pieces: vi.fn() },
}));
vi.mock("@/shared/components/ui/toast", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const navigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

const INSTRUMENTS = [
  { id: "i1", code: "DTR", name: "Đàn tranh", isActive: true },
  { id: "i2", code: "DBA", name: "Đàn bầu", isActive: true },
];

function makeClass(id: string, name: string, instrumentId: string, status: "ACTIVE" | "ENDED"): ClassSummary {
  return {
    id,
    name,
    cohort: "K1",
    status,
    instrument: { id: instrumentId, name: instrumentId === "i1" ? "Đàn tranh" : "Đàn bầu" },
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    memberCount: 10,
  };
}

const CLASSES = [
  makeClass("k1", "TRD301", "i1", "ACTIVE"),
  makeClass("k2", "TRD201", "i1", "ENDED"),
  makeClass("k3", "BAU101", "i2", "ACTIVE"),
];

const PIECES = [{ id: "p1", title: "Lý ngựa ô", composer: null, kind: "SONG", bpm: 96 }];

function renderForm() {
  return render(
    <MemoryRouter>
      <ChallengeForm classes={CLASSES} instruments={INSTRUMENTS} defaultMinAccuracy={70} maxSubmissionsDefault={3} />
    </MemoryRouter>
  );
}

async function pickInstrument(name: string) {
  await userEvent.selectOptions(screen.getByLabelText(/Nhạc cụ/), name);
}

async function pickPiece() {
  await userEvent.click(screen.getByRole("button", { name: "Chọn bài nhạc" }));
  await userEvent.click(await screen.findByRole("button", { name: /Lý ngựa ô/ }));
}

describe("ChallengeForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(challengeApi.pieces).mockResolvedValue({
      data: { data: { items: PIECES, pagination: { page: 1, limit: 20, total: 1 } } },
    } as never);
    vi.mocked(challengeApi.create).mockResolvedValue({
      data: { message: "ok", data: { id: "new1" } },
    } as never);
  });

  it("prefills the accuracy from the form meta default", () => {
    renderForm();
    expect(screen.getByLabelText(/Độ chính xác tối thiểu/)).toHaveValue("70");
    expect(screen.getByLabelText(/Số lần nộp tối đa/)).toHaveValue("3");
  });

  it("lists only ACTIVE classes of the chosen instrument", async () => {
    renderForm();
    await pickInstrument("Đàn tranh");
    expect(screen.getByRole("checkbox", { name: "TRD301" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "TRD201" })).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "BAU101" })).not.toBeInTheDocument();
  });

  it("clears the piece and classes when the instrument changes", async () => {
    renderForm();
    await pickInstrument("Đàn tranh");
    await pickPiece();
    await userEvent.click(screen.getByRole("checkbox", { name: "TRD301" }));
    expect(screen.getByText("Lý ngựa ô")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "TRD301" })).toBeChecked();

    await pickInstrument("Đàn bầu");
    expect(screen.queryByText("Lý ngựa ô")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Chọn bài nhạc" })).toBeInTheDocument();
    await pickInstrument("Đàn tranh");
    expect(screen.getByRole("checkbox", { name: "TRD301" })).not.toBeChecked();
  });

  it("'Lưu nháp' with only a title calls create with publish false", async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText(/Tên thử thách/), "Chỉ có tên");
    await userEvent.click(screen.getByRole("button", { name: "Lưu nháp" }));
    await waitFor(() => expect(challengeApi.create).toHaveBeenCalledTimes(1));
    expect(vi.mocked(challengeApi.create).mock.calls[0][0]).toMatchObject({
      title: "Chỉ có tên",
      publish: false,
      instrumentId: null,
      pieceId: null,
      classIds: [],
      weekStart: null,
    });
    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/teacher/challenges", { replace: true }));
  });

  it("'Đăng thử thách' with missing fields shows inline errors and does not call the API", async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText(/Tên thử thách/), "Thiếu dữ liệu");
    await userEvent.click(screen.getByRole("button", { name: "Đăng thử thách" }));
    expect(await screen.findByText("Nhạc cụ không được để trống.")).toBeInTheDocument();
    expect(screen.getByText("Bài nhạc không được để trống.")).toBeInTheDocument();
    expect(screen.getByText("Lớp không được để trống.")).toBeInTheDocument();
    expect(screen.getByText("Tuần không được để trống.")).toBeInTheDocument();
    expect(challengeApi.create).not.toHaveBeenCalled();
  });

  it("publishes a complete form and shows the success toast", async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText(/Tên thử thách/), "Thử thách đầy đủ");
    await pickInstrument("Đàn tranh");
    await pickPiece();
    await userEvent.click(screen.getByRole("checkbox", { name: "TRD301" }));
    await userEvent.click(screen.getAllByRole("radio").find((radio) => !(radio as HTMLInputElement).disabled)!);
    await userEvent.click(screen.getByRole("button", { name: "Đăng thử thách" }));
    await waitFor(() => expect(challengeApi.create).toHaveBeenCalledTimes(1));
    expect(vi.mocked(challengeApi.create).mock.calls[0][0]).toMatchObject({
      title: "Thử thách đầy đủ",
      publish: true,
      instrumentId: "i1",
      pieceId: "p1",
      classIds: ["k1"],
      minAccuracy: 70,
      maxSubmissions: 3,
    });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Đăng thử thách thành công."));
  });

  it("keeps typed data and maps a server errors[] response to its field", async () => {
    const error = new AxiosError("fail", "400", undefined, undefined, {
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: {} as never,
      data: {
        success: false,
        message: "Không thể đăng thử thách.",
        errors: [{ field: "weekStart", code: "MSG-08", message: "Tuần đã kết thúc." }],
      },
    });
    vi.mocked(challengeApi.create).mockRejectedValue(error);
    renderForm();
    await userEvent.type(screen.getByLabelText(/Tên thử thách/), "Giữ dữ liệu");
    await userEvent.click(screen.getByRole("button", { name: "Lưu nháp" }));
    expect(await screen.findByText("Tuần đã kết thúc.")).toBeInTheDocument();
    expect(screen.getByLabelText(/Tên thử thách/)).toHaveValue("Giữ dữ liệu");
    expect(navigate).not.toHaveBeenCalled();
  });

  it("navigates away on 'Hủy' when the form is clean", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(navigate).toHaveBeenCalledWith("/teacher/challenges");
  });

  it("asks for MSG-02 confirmation on 'Hủy' when the form is dirty", async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText(/Tên thử thách/), "Đã gõ");
    await userEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(navigate).not.toHaveBeenCalled();
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Hủy thay đổi?")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Rời đi" }));
    expect(navigate).toHaveBeenCalledWith("/teacher/challenges");
  });
});

describe("WeekPicker", () => {
  // Run in a zone far from UTC+7 so browser-local date maths would give a different week.
  beforeAll(() => {
    vi.stubEnv("TZ", "America/Los_Angeles");
  });
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("offers only Monday-start weeks and disables past weeks", () => {
    // Thursday 2026-10-22: the current week starts Monday 2026-10-19.
    render(<WeekPicker id="week" value="" onChange={vi.fn()} now={new Date("2026-10-22T05:00:00Z")} />);
    const radios = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(radios.length).toBeGreaterThan(4);
    for (const radio of radios) {
      expect(new Date(`${radio.value}T00:00:00`).getDay()).toBe(1);
      expect(radio.disabled).toBe(radio.value < "2026-10-19");
    }
    expect(radios.some((radio) => radio.value === "2026-10-19" && !radio.disabled)).toBe(true);
    expect(radios.some((radio) => radio.value < "2026-10-19")).toBe(true);
  });

  it("uses the UTC+7 calendar for the current week, whatever the machine timezone", () => {
    // 2026-10-25T17:30Z is Monday 26/10/2026 00:30 in UTC+7 but still Sunday in UTC and the Americas.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-25T17:30:00Z"));
    try {
      render(<WeekPicker id="week" value="" onChange={vi.fn()} />);
      const radios = screen.getAllByRole("radio") as HTMLInputElement[];
      const byValue = (value: string) => radios.find((radio) => radio.value === value);
      expect(byValue("2026-10-26")?.disabled).toBe(false);
      expect(byValue("2026-10-19")?.disabled).toBe(true);
      expect(radios.filter((radio) => !radio.disabled)[0].value).toBe("2026-10-26");
      expect(screen.getByLabelText("26/10 - 01/11/2026")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it.each([
    ["a far-future stored week", "2027-03-01", false],
    ["a stored week 6 weeks in the past", "2026-09-07", true],
  ])("still shows %s as the checked option", (_label, stored, isDisabled) => {
    render(<WeekPicker id="week" value={stored} onChange={vi.fn()} now={new Date("2026-10-22T05:00:00Z")} />);
    const radio = (screen.getAllByRole("radio") as HTMLInputElement[]).find((item) => item.value === stored);
    expect(radio).toBeDefined();
    expect(radio?.checked).toBe(true);
    expect(radio?.disabled).toBe(isDisabled);
  });
});
