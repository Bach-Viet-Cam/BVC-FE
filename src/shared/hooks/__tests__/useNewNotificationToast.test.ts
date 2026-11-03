import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { myNotificationApi } from "@/features/platform/api/myNotificationApi";
import { toast } from "@/shared/components/ui/toast";
import { useNewNotificationToast } from "@/shared/hooks/useNewNotificationToast";

vi.mock("@/features/platform/api/myNotificationApi", () => ({
  myNotificationApi: { list: vi.fn() },
}));
vi.mock("@/shared/components/ui/toast", () => ({ toast: { custom: vi.fn() } }));

function page(...ids: string[]) {
  const items = ids.map((id) => ({ id, title: `Tiêu đề ${id}`, body: `Nội dung ${id}` }));
  return { data: { data: { items } } } as never;
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("useNewNotificationToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(toast.custom).mockClear();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("toasts only notifications that arrive after the first load, for 5 seconds", async () => {
    vi.mocked(myNotificationApi.list).mockResolvedValueOnce(page("a")).mockResolvedValueOnce(page("b", "a"));
    renderHook(() => useNewNotificationToast(true));
    await flush();
    expect(toast.custom).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(15_000);
    });
    await flush();
    expect(toast.custom).toHaveBeenCalledTimes(1);
    expect(toast.custom).toHaveBeenCalledWith({
      title: "Tiêu đề b",
      description: "Nội dung b",
      type: "info",
      timeout: 5_000,
    });
  });

  it("does nothing when disabled", async () => {
    vi.mocked(myNotificationApi.list).mockClear();
    renderHook(() => useNewNotificationToast(false));
    await flush();
    expect(myNotificationApi.list).not.toHaveBeenCalled();
  });
});
