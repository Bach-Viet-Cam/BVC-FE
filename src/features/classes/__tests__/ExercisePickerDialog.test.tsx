import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExercisePickerDialog } from "@/features/classes/components/ExercisePickerDialog";

const EXERCISES = [
  { id: "a", title: "Luyện ngón — Gẩy đơn", defaultBpm: null },
  { id: "b", title: "Luyện ngón — Vê", defaultBpm: null },
];

vi.mock("@/features/classes/api/roadmapsApi", () => ({
  roadmapsApi: {
    listFingerExercises: vi.fn(async (_instrumentId: string, q?: string) => ({
      data: {
        data: EXERCISES.filter((exercise) => !q || exercise.title.toLowerCase().includes(q.toLowerCase())),
        message: "",
        success: true,
      },
    })),
  },
}));

describe("ExercisePickerDialog", () => {
  it("keeps exercises checked before the search hid them", async () => {
    const onAdd = vi.fn();
    render(<ExercisePickerDialog isOpen instrumentId="i1" excludedPieceIds={[]} onAdd={onAdd} onClose={vi.fn()} />);
    await userEvent.click(await screen.findByRole("checkbox", { name: "Luyện ngón — Gẩy đơn" }));
    await userEvent.type(screen.getByLabelText("Tìm bài luyện ngón"), "Vê");
    // Wait until the search result no longer contains the first exercise.
    await waitFor(
      () => expect(screen.queryByRole("checkbox", { name: "Luyện ngón — Gẩy đơn" })).not.toBeInTheDocument(),
      { timeout: 2000 }
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "Luyện ngón — Vê" }));
    await userEvent.click(screen.getByRole("button", { name: "Thêm" }));
    expect(onAdd).toHaveBeenCalledWith([EXERCISES[0], EXERCISES[1]]);
  });
});
