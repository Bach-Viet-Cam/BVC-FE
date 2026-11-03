import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Info, Layers, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { InstrumentInfoPanel } from "@/features/platform/components/InstrumentInfoPanel";
import { InstrumentTunesPanel } from "@/features/platform/components/InstrumentTunesPanel";
import { AdminRoadmapPanel } from "@/features/classes/components/AdminRoadmapPanel";
import { cn } from "@/shared/utils/cn";

export type InstrumentConfigTab = "info" | "tunes" | "roadmap";

interface TabOption {
  value: InstrumentConfigTab;
  label: string;
  sublabel: string;
  icon: typeof Info;
}

const TABS: readonly TabOption[] = [
  {
    value: "info",
    label: "Thông tin chung",
    sublabel: "Mã, tên & trạng thái",
    icon: Info,
  },
  {
    value: "tunes",
    label: "Cấu hình dây",
    sublabel: "Cao độ & tần số chuẩn",
    icon: SlidersHorizontal,
  },
  {
    value: "roadmap",
    label: "Lộ trình học tập",
    sublabel: "Chương trình 6 tuần",
    icon: Layers,
  },
];

export function InstrumentConfigPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab: InstrumentConfigTab = useMemo(() => {
    const raw = searchParams.get("tab");
    if (raw === "tunes" || raw === "roadmap") return raw;
    return "info";
  }, [searchParams]);

  const selectedInstrumentId = searchParams.get("instrument");

  const setTab = useCallback(
    (nextTab: InstrumentConfigTab, instrumentId?: string | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("tab", nextTab);
          if (instrumentId !== undefined) {
            if (instrumentId) {
              next.set("instrument", instrumentId);
            } else {
              next.delete("instrument");
            }
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const setInstrumentId = useCallback(
    (id: string | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (id) {
            next.set("instrument", id);
          } else {
            next.delete("instrument");
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[#FAF9F7]">
      <header className="sticky top-0 z-10 shrink-0 border-b border-bvc-border bg-white">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-[24px] gap-y-[12px] px-[18px] py-[16px] md:px-[32px] md:pt-[24px] md:pb-[14px]">
          <div className="flex min-w-0 flex-col gap-[3px]">
            <div className="text-[12px] font-bold tracking-[0.14em] text-bvc-muted uppercase">Quản trị</div>
            <h1 className="m-0 font-bvc-display text-[22px] leading-tight font-extrabold tracking-[-0.025em] md:text-[28px]">
              Cấu hình nhạc cụ
            </h1>
          </div>

          {/* Màn nhỏ (< md): chuyển tab bằng dropdown shadcn Select */}
          <div className="flex md:hidden w-full sm:w-auto items-center">
            <Select
              value={activeTab}
              onValueChange={(val) => {
                if (val) setTab(val as InstrumentConfigTab);
              }}
            >
              <SelectTrigger
                aria-label="Chọn chế độ cấu hình"
                className="h-[38px] w-full sm:w-[220px] rounded-[10px] border-bvc-border-strong bg-white px-3 text-[13px] font-semibold text-bvc-ink shadow-2xs"
              >
                <SelectValue>
                  {(val) => {
                    const currentTab = TABS.find((t) => t.value === val);
                    const Icon = currentTab?.icon;
                    return (
                      <span className="flex items-center gap-2 truncate">
                        {Icon && <Icon size={15} className="text-bvc-ink shrink-0" />}
                        <span className="truncate">{currentTab?.label ?? "Chọn chế độ"}</span>
                      </span>
                    );
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectPopup positionerClassName="z-50">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <SelectItem key={tab.value} value={tab.value}>
                      <span className="flex items-center gap-2">
                        <Icon size={15} className="text-bvc-muted shrink-0" />
                        <span>{tab.label}</span>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectPopup>
            </Select>
          </div>
        </div>

        {/* Màn lớn (>= md): hiển thị các tabs gạch chân */}
        <div className="hidden md:flex px-[32px]">
          <nav
            role="tablist"
            aria-label="Chế độ cấu hình nhạc cụ"
            className="flex gap-8 -mb-px overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.value;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-label={tab.label}
                  aria-selected={isActive}
                  onClick={() => setTab(tab.value)}
                  className={cn(
                    "flex items-center gap-2 border-b-2 py-3 text-[14px] whitespace-nowrap transition-colors cursor-pointer select-none",
                    isActive
                      ? "border-bvc-ink font-bold text-bvc-ink"
                      : "border-transparent font-medium text-bvc-muted hover:border-bvc-border-strong hover:text-bvc-ink"
                  )}
                >
                  <Icon
                    size={16}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={isActive ? "text-bvc-ink" : "text-bvc-faint"}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="flex min-w-0 flex-1 flex-col gap-4 p-6 md:px-8">

        {activeTab === "info" && (
          <InstrumentInfoPanel
            onSelectTunes={(instrument) => setTab("tunes", instrument.id)}
          />
        )}

        {activeTab === "tunes" && (
          <InstrumentTunesPanel
            selectedInstrumentId={selectedInstrumentId}
            onSelectInstrument={setInstrumentId}
          />
        )}

        {activeTab === "roadmap" && (
          <AdminRoadmapPanel
            selectedInstrumentId={selectedInstrumentId}
            onSelectInstrument={setInstrumentId}
          />
        )}
      </div>
    </div>
  );
}
