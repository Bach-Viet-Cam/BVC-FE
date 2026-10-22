import { useState } from "react";
import { ActionButton } from "@/features/classes/components/ActionButton";
import { SearchInput } from "@/features/classes/components/SearchInput";
import { useChallengePieces } from "@/features/community/hooks/useChallengePieces";
import { type ChallengePiece } from "@/features/community/types/challenge";
import { Dialog, DialogPopup, DialogTitle } from "@/shared/components/ui/dialog";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

interface ChallengePiecePickerDialogProps {
  isOpen: boolean;
  instrumentId: string;
  onSelect: (piece: ChallengePiece) => void;
  onClose: () => void;
}

// Single-select, searchable list of the pieces a challenge can use for the chosen instrument.
export function ChallengePiecePickerDialog({
  isOpen,
  instrumentId,
  onSelect,
  onClose,
}: ChallengePiecePickerDialogProps) {
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebouncedValue(searchText.trim());
  const { pieces, isLoading, error } = useChallengePieces(isOpen ? instrumentId : null, debouncedSearch);

  const close = () => {
    setSearchText("");
    onClose();
  };

  const select = (piece: ChallengePiece) => {
    onSelect(piece);
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && close()}>
      <DialogPopup className="w-[calc(100%-36px)] max-w-[480px] gap-[14px] rounded-[20px] border-bvc-border bg-white p-[18px] font-bvc-sans text-bvc-ink">
        <DialogTitle className="text-[17px] font-extrabold text-bvc-ink">Chọn bài nhạc</DialogTitle>
        <SearchInput id="challenge-piece-search" label="Tìm bài nhạc" value={searchText} onChange={setSearchText} />
        <div className="flex max-h-[320px] flex-col overflow-y-auto">
          {isLoading && <span className="py-[10px] text-[13px] text-bvc-muted">Đang tải…</span>}
          {error && <span className="py-[10px] text-[13px] text-bvc-error">{error}</span>}
          {!isLoading && !error && pieces.length === 0 && (
            <span className="py-[10px] text-[13px] text-bvc-muted">Không tìm thấy bài nhạc phù hợp.</span>
          )}
          {!isLoading &&
            pieces.map((piece) => (
              <button
                key={piece.id}
                type="button"
                onClick={() => select(piece)}
                className="flex min-h-[44px] cursor-pointer flex-col items-start justify-center border-t border-bvc-border py-[6px] text-left text-[14px]"
              >
                <span className="font-semibold">{piece.title}</span>
                <span className="text-[12px] text-bvc-muted">
                  {[piece.composer, `${piece.bpm} BPM`].filter(Boolean).join(" - ")}
                </span>
              </button>
            ))}
        </div>
        <ActionButton size="lg" onClick={close}>
          Đóng
        </ActionButton>
      </DialogPopup>
    </Dialog>
  );
}
