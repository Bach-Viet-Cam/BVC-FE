import { useEffect, useState } from "react";
import { Loader2, Plus, SlidersHorizontal, Sparkles, Trash2 } from "lucide-react";
import { Dialog, DialogDescription, DialogPopup, DialogTitle } from "@/shared/components/ui/dialog";
import { type InstrumentItem, type InstrumentTuneInput } from "@/features/platform/types/configTypes";
import { instrumentApi } from "@/features/platform/api/instrumentApi";
import { toast } from "@/shared/components/ui/toast";

interface InstrumentTunesDialogProps {
  isOpen: boolean;
  instrument: InstrumentItem | null;
  onOpenChange: (isOpen: boolean) => void;
  onSaved?: () => void;
}

interface EditableTune {
  tempId: string;
  tuneName: string;
  pitchText: string;
}

const PRESETS: Record<string, { label: string; tunes: { tuneName: string; pitch: number }[] }> = {
  DNH: {
    label: "Đàn Nhị (G4 - D5)",
    tunes: [
      { tuneName: "Dây 1 (Re 5)", pitch: 587.33 },
      { tuneName: "Dây 2 (Sol 4)", pitch: 392.0 },
    ],
  },
  DBA: {
    label: "Đàn Bầu (C3 - C4)",
    tunes: [
      { tuneName: "Dây buông (Do 3)", pitch: 130.81 },
      { tuneName: "Dây buông quãng 8 (Do 4)", pitch: 261.63 },
    ],
  },
  DTB: {
    label: "Tỳ Bà (C4 - F4 - G4 - C5)",
    tunes: [
      { tuneName: "Dây 1 (Do 5)", pitch: 523.25 },
      { tuneName: "Dây 2 (Sol 4)", pitch: 392.0 },
      { tuneName: "Dây 3 (Fa 4)", pitch: 349.23 },
      { tuneName: "Dây 4 (Do 4)", pitch: 261.63 },
    ],
  },
  DTR: {
    label: "Đàn Tranh (Ngũ cung mẫu)",
    tunes: [
      { tuneName: "Dây 1 (Sol 3)", pitch: 196.0 },
      { tuneName: "Dây 2 (La 3)", pitch: 220.0 },
      { tuneName: "Dây 3 (Do 4)", pitch: 261.63 },
      { tuneName: "Dây 4 (Re 4)", pitch: 293.66 },
      { tuneName: "Dây 5 (Mi 4)", pitch: 329.63 },
      { tuneName: "Dây 6 (Sol 4)", pitch: 392.0 },
    ],
  },
  DSA: {
    label: "Sáo Trúc (C5 Diatonic)",
    tunes: [
      { tuneName: "Do 5 (C5)", pitch: 523.25 },
      { tuneName: "Re 5 (D5)", pitch: 587.33 },
      { tuneName: "Mi 5 (E5)", pitch: 659.25 },
      { tuneName: "Fa 5 (F5)", pitch: 698.46 },
      { tuneName: "Sol 5 (G5)", pitch: 783.99 },
      { tuneName: "La 5 (A5)", pitch: 880.0 },
    ],
  },
};

export function InstrumentTunesDialog({ isOpen, instrument, onOpenChange, onSaved }: InstrumentTunesDialogProps) {
  const [tunes, setTunes] = useState<EditableTune[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !instrument) return;

    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const { data } = await instrumentApi.getTunes(instrument.id);
        if (!isMounted) return;
        const fetched = data.data ?? [];
        if (fetched.length > 0) {
          setTunes(
            fetched.map((item, index) => ({
              tempId: item.id || `tune-${index}-${Date.now()}`,
              tuneName: item.tuneName,
              pitchText: String(item.pitch),
            }))
          );
        } else {
          // Gợi ý preset theo mã nếu nhạc cụ chưa có cấu hình
          const preset = PRESETS[instrument.code.toUpperCase()];
          if (preset) {
            setTunes(
              preset.tunes.map((p, index) => ({
                tempId: `preset-${index}`,
                tuneName: p.tuneName,
                pitchText: String(p.pitch),
              }))
            );
          } else {
            setTunes([
              { tempId: "init-1", tuneName: "Dây 1", pitchText: "440" },
              { tempId: "init-2", tuneName: "Dây 2", pitchText: "392" },
            ]);
          }
        }
      } catch {
        if (!isMounted) return;
        toast.error("Không thể tải cấu hình dây/nốt. Vui lòng thử lại.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [isOpen, instrument]);

  const addRow = () => {
    setTunes((prev) => [
      ...prev,
      {
        tempId: `tune-new-${Date.now()}-${Math.random()}`,
        tuneName: `Dây ${prev.length + 1}`,
        pitchText: "440",
      },
    ]);
  };

  const removeRow = (index: number) => {
    setTunes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: "tuneName" | "pitchText", value: string) => {
    setTunes((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const applyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;
    setTunes(
      preset.tunes.map((p, index) => ({
        tempId: `preset-${presetKey}-${index}-${Date.now()}`,
        tuneName: p.tuneName,
        pitchText: String(p.pitch),
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instrument) return;

    if (tunes.length === 0) {
      toast.error("Vui lòng cấu hình ít nhất 1 dây hoặc nốt chuẩn.");
      return;
    }

    const payload: InstrumentTuneInput[] = [];
    for (let i = 0; i < tunes.length; i += 1) {
      const item = tunes[i];
      const trimmedName = item.tuneName.trim();
      const pitchNum = parseFloat(item.pitchText);

      if (!trimmedName) {
        toast.error(`Dòng ${i + 1}: Vui lòng nhập tên dây hoặc nốt.`);
        return;
      }
      if (Number.isNaN(pitchNum) || pitchNum <= 0) {
        toast.error(`Dòng ${i + 1}: Cao độ chuẩn (Hz) phải là số dương lớn hơn 0.`);
        return;
      }

      payload.push({
        tuneName: trimmedName,
        pitch: Math.round(pitchNum * 100) / 100,
        displayOrder: i + 1,
      });
    }

    setIsSubmitting(true);
    try {
      const { data } = await instrumentApi.setTunes(instrument.id, payload);
      toast.success(data.message || "Đã lưu cấu hình dây / nốt chuẩn thành công.");
      onOpenChange(false);
      onSaved?.();
    } catch {
      toast.error("Không thể lưu cấu hình dây / nốt. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPreset = instrument ? PRESETS[instrument.code.toUpperCase()] : null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-[560px] rounded-[22px] border border-bvc-border bg-white p-6 shadow-none">
        <div className="flex items-center gap-3">
          <div className="flex size-[40px] items-center justify-center rounded-[12px] bg-bvc-surface text-bvc-ink">
            <SlidersHorizontal size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-[17px] font-extrabold tracking-[-0.02em] text-bvc-ink">
              Cấu hình dây / nốt chuẩn
            </DialogTitle>
            <DialogDescription className="truncate text-[13px] text-bvc-muted">
              {instrument ? `${instrument.name} (${instrument.code})` : "Nhạc cụ"} · Định nghĩa các dây/nốt và tần số chuẩn (Hz)
            </DialogDescription>
          </div>
        </div>

        {currentPreset && (
          <div className="mt-3 flex items-center justify-between rounded-[10px] bg-bvc-surface/60 px-3 py-2 text-[12.5px]">
            <span className="flex items-center gap-1.5 text-bvc-muted">
              <Sparkles size={14} className="text-bvc-accent-text" />
              <span>Gợi ý mẫu: <strong>{currentPreset.label}</strong></span>
            </span>
            <button
              type="button"
              onClick={() => instrument && applyPreset(instrument.code.toUpperCase())}
              className="cursor-pointer font-semibold text-bvc-accent-text hover:underline"
            >
              Áp dụng
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 size={24} className="animate-spin text-bvc-muted" />
            <p className="mt-2 text-[13px] text-bvc-muted">Đang tải danh sách dây/nốt...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            <div className="max-h-[340px] overflow-y-auto pr-1">
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-[36px_1fr_120px_36px] items-center gap-2 px-1 text-[11.5px] font-bold text-bvc-muted uppercase">
                  <span>STT</span>
                  <span>Tên dây / Nốt</span>
                  <span>Tần số (Hz)</span>
                  <span />
                </div>

                {tunes.map((tune, index) => (
                  <div
                    key={tune.tempId}
                    className="grid grid-cols-[36px_1fr_120px_36px] items-center gap-2 rounded-[10px] border border-bvc-border/80 bg-bvc-surface/20 p-1.5 transition-colors focus-within:border-bvc-ink focus-within:bg-white"
                  >
                    <span className="text-center font-mono text-[12px] font-bold text-bvc-muted">
                      {index + 1}
                    </span>

                    <input
                      type="text"
                      value={tune.tuneName}
                      onChange={(e) => updateRow(index, "tuneName", e.target.value)}
                      placeholder="vd: Dây 1 (Sol 4)"
                      className="h-[34px] w-full rounded-[8px] border border-bvc-border bg-white px-2.5 text-[13px] font-semibold text-bvc-ink placeholder:font-normal placeholder:text-bvc-faint focus:border-bvc-ink focus:outline-none"
                    />

                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="0.01"
                        min="20"
                        max="10000"
                        value={tune.pitchText}
                        onChange={(e) => updateRow(index, "pitchText", e.target.value)}
                        placeholder="440"
                        className="h-[34px] w-full rounded-[8px] border border-bvc-border bg-white pl-2.5 pr-6 font-mono text-[13px] text-bvc-ink placeholder:text-bvc-faint focus:border-bvc-ink focus:outline-none"
                      />
                      <span className="pointer-events-none absolute right-2 text-[10.5px] font-bold text-bvc-muted">
                        Hz
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      title="Xóa dây/nốt này"
                      disabled={tunes.length <= 1}
                      className="flex size-[32px] cursor-pointer items-center justify-center rounded-[8px] text-bvc-muted transition-colors hover:bg-red-50 hover:text-bvc-error disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={addRow}
                className="inline-flex h-[34px] cursor-pointer items-center gap-1.5 rounded-[10px] border border-dashed border-bvc-border-strong px-3 text-[12.5px] font-semibold text-bvc-ink transition-colors hover:border-bvc-ink hover:bg-bvc-surface"
              >
                <Plus size={14} />
                <span>Thêm dây / nốt</span>
              </button>

              <span className="text-[12px] text-bvc-muted">
                Tổng cộng: <strong className="font-mono text-bvc-ink">{tunes.length}</strong> dây / nốt
              </span>
            </div>

            <div className="mt-3 flex items-center justify-end gap-2.5 border-t border-bvc-line pt-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="min-h-[40px] cursor-pointer rounded-[12px] border border-bvc-border-strong bg-white px-4 text-[13.5px] font-semibold text-bvc-ink transition-colors hover:border-bvc-ink hover:bg-bvc-surface/40"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-bvc-ink px-5 text-[13.5px] font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                <span>{isSubmitting ? "Đang lưu..." : "Lưu cấu hình"}</span>
              </button>
            </div>
          </form>
        )}
      </DialogPopup>
    </Dialog>
  );
}
