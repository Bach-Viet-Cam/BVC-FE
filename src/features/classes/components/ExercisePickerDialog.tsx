import { useState } from "react";
import { ActionButton } from "@/features/classes/components/ActionButton";
import { SearchInput } from "@/features/classes/components/SearchInput";
import { useFingerExercises } from "@/features/classes/hooks/useFingerExercises";
import { type FingerExercise } from "@/features/classes/types/roadmapTypes";
import { Dialog, DialogPopup, DialogTitle } from "@/shared/components/ui/dialog";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

interface ExercisePickerDialogProps {
  isOpen: boolean;
  instrumentId: string;
  excludedPieceIds: string[];
  onAdd: (exercises: FingerExercise[]) => void;
  onClose: () => void;
}

export function ExercisePickerDialog({
  isOpen,
  instrumentId,
  excludedPieceIds,
  onAdd,
  onClose,
}: ExercisePickerDialogProps) {
  const [searchText, setSearchText] = useState("");
  // Keep the chosen exercises themselves: a later search may hide them from the list.
  const [selected, setSelected] = useState<FingerExercise[]>([]);
  const debouncedSearch = useDebouncedValue(searchText.trim());
  const { exercises, isLoading, error } = useFingerExercises(isOpen ? instrumentId : null, debouncedSearch);
  const choices = exercises.filter((exercise) => !excludedPieceIds.includes(exercise.id));
  const isSelected = (exercise: FingerExercise) => selected.some((item) => item.id === exercise.id);

  const close = () => {
    setSelected([]);
    setSearchText("");
    onClose();
  };

  const toggle = (exercise: FingerExercise) =>
    setSelected((current) =>
      current.some((item) => item.id === exercise.id)
        ? current.filter((item) => item.id !== exercise.id)
        : [...current, exercise]
    );

  const add = () => {
    onAdd(selected);
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && close()}>
      <DialogPopup className="w-[calc(100%-36px)] max-w-[480px] gap-[14px] rounded-[20px] border-bvc-border bg-white p-[18px] font-bvc-sans text-bvc-ink">
        <DialogTitle className="text-[17px] font-extrabold text-bvc-ink">Thêm bài luyện ngón</DialogTitle>
        <SearchInput id="exercise-search" label="Tìm bài luyện ngón" value={searchText} onChange={setSearchText} />
        <div className="flex max-h-[320px] flex-col overflow-y-auto">
          {isLoading && <span className="py-[10px] text-[13px] text-bvc-muted">Đang tải…</span>}
          {error && <span className="py-[10px] text-[13px] text-bvc-error">{error}</span>}
          {!isLoading && !error && choices.length === 0 && (
            <span className="py-[10px] text-[13px] text-bvc-muted">Không tìm thấy bài luyện ngón phù hợp.</span>
          )}
          {!isLoading &&
            choices.map((exercise) => (
              <label
                key={exercise.id}
                className="flex min-h-[44px] cursor-pointer items-center gap-[10px] border-t border-bvc-border text-[14px]"
              >
                <input
                  type="checkbox"
                  checked={isSelected(exercise)}
                  onChange={() => toggle(exercise)}
                  className="size-[18px] accent-bvc-ink"
                />
                {exercise.title}
              </label>
            ))}
        </div>
        <div className="flex gap-[10px]">
          <ActionButton size="lg" onClick={close}>
            Đóng
          </ActionButton>
          <ActionButton size="lg" variant="primary" onClick={add} disabled={selected.length === 0}>
            Thêm
          </ActionButton>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
