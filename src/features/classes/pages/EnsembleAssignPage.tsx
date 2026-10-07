import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, GripVertical } from "lucide-react";

const UNASSIGNED = ["Phạm Gia Hân", "Vũ Minh Đức", "Hoàng Thị Mai", "Trần Văn Long"];

const INSTRUMENTS = ["Đàn tranh", "Đàn bầu", "Đàn nhị", "Tỳ bà", "Sáo trúc"] as const;
type Instrument = (typeof INSTRUMENTS)[number];

interface Slot {
  instrument: Instrument;
  student: string | null;
  warn?: boolean;
}

interface Group {
  name: string;
  slots: Slot[];
}

const INITIAL_GROUPS: Group[] = [
  {
    name: "Nhóm 1",
    slots: [
      { instrument: "Đàn tranh", student: "Phương Linh" },
      { instrument: "Đàn bầu", student: "Quốc Bảo" },
      { instrument: "Đàn nhị", student: null },
      { instrument: "Tỳ bà", student: "Minh Anh" },
      { instrument: "Sáo trúc", student: "Hoàng Tùng" },
    ],
  },
  {
    name: "Nhóm 2",
    slots: [
      { instrument: "Đàn tranh", student: "Gia Hân", warn: true },
      { instrument: "Đàn bầu", student: null },
      { instrument: "Đàn nhị", student: "Thanh Hà" },
      { instrument: "Tỳ bà", student: null },
      { instrument: "Sáo trúc", student: "Văn Bình" },
    ],
  },
  {
    name: "Nhóm 3",
    slots: [
      { instrument: "Đàn tranh", student: "Hồng Nhung" },
      { instrument: "Đàn bầu", student: "Đức Anh" },
      { instrument: "Đàn nhị", student: "Phú Quang" },
      { instrument: "Tỳ bà", student: "Kim Chi" },
      { instrument: "Sáo trúc", student: "Thái Bình" },
    ],
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function EnsembleAssignPage() {
  const navigate = useNavigate();
  const [groups] = useState<Group[]>(INITIAL_GROUPS);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-4 border-b border-bvc-border-strong px-8 py-5">
        <button
          type="button"
          onClick={() => navigate("/teacher/classes")}
          className="flex size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] border border-bvc-border-strong bg-white"
        >
          <ChevronLeft size={18} strokeWidth={2} className="text-bvc-ink" />
        </button>

        <div className="flex flex-col gap-[3px]">
          <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-bvc-muted">
            TRD301 · Fall 2026
          </span>
          <span className="text-[24px] font-extrabold tracking-[-0.025em] text-bvc-ink">
            Phân công nhạc cụ &amp; Nhóm hòa tấu
          </span>
        </div>

        <div className="ml-auto flex items-center gap-[10px]">
          <span className="flex h-[44px] items-center rounded-[11px] bg-bvc-accent-tint px-3 text-[13px] font-bold text-bvc-accent-text">
            3 bè thiếu người
          </span>
          <button
            type="button"
            className="flex min-h-[44px] cursor-pointer items-center rounded-[14px] bg-bvc-ink px-[18px] text-[14px] font-bold text-white"
          >
            Lưu thay đổi
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* Left panel — Unassigned */}
        <div className="flex w-[260px] shrink-0 flex-col overflow-hidden border-r border-bvc-border-strong">
          <div className="flex shrink-0 items-center gap-2 border-b border-bvc-line px-[18px] py-[14px]">
            <span className="text-[13px] font-bold text-bvc-ink">Chưa phân công</span>
            <span className="flex size-[20px] items-center justify-center rounded-full bg-bvc-ink text-[11px] font-bold text-white">
              {UNASSIGNED.length}
            </span>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto px-[12px] py-[8px]">
            {UNASSIGNED.map((student) => (
              <div
                key={student}
                className="mb-2 flex h-[44px] cursor-grab items-center gap-2 rounded-[12px] border border-bvc-border bg-white px-[12px]"
              >
                <span className="flex size-[28px] shrink-0 items-center justify-center rounded-full bg-bvc-surface text-[12px] font-bold text-bvc-ink">
                  {getInitials(student)}
                </span>
                <span className="flex-1 text-[13px] text-bvc-ink">{student}</span>
                <GripVertical size={16} className="ml-auto shrink-0 text-bvc-faint" />
              </div>
            ))}
          </div>
        </div>

        {/* Center panel — Groups */}
        <div className="flex flex-1 flex-col overflow-y-auto bg-bvc-surface p-[20px]">
          <div className="mb-[14px] flex items-baseline gap-[10px]">
            <span className="text-[16px] font-extrabold tracking-[-0.025em] text-bvc-ink">
              Nhóm hòa tấu
            </span>
            <span className="text-[11px] text-bvc-muted">3 nhóm</span>
          </div>

          <div className="flex flex-col gap-[16px]">
            {groups.map((group) => (
              <div
                key={group.name}
                className="rounded-[20px] border border-bvc-border bg-white p-[16px]"
              >
                <span className="text-[14px] font-bold text-bvc-ink">{group.name}</span>

                <div className="mt-2 grid grid-cols-2 gap-[8px]">
                  {group.slots.map((slot) =>
                    slot.student ? (
                      <div
                        key={slot.instrument}
                        className="flex min-h-[52px] items-center gap-2 rounded-[12px] border border-bvc-border bg-white p-[10px]"
                      >
                        <span className="flex size-[28px] shrink-0 items-center justify-center rounded-full bg-bvc-surface text-[11px] font-bold text-bvc-ink">
                          {getInitials(slot.student)}
                        </span>
                        <div className="flex flex-col gap-[1px]">
                          <span className="text-[12px] font-semibold text-bvc-muted">
                            {slot.instrument}
                          </span>
                          <span
                            className={`text-[13px] font-semibold ${slot.warn ? "text-bvc-accent-text" : "text-bvc-ink"}`}
                          >
                            {slot.student}
                            {slot.warn && " ⚠"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={slot.instrument}
                        className="flex min-h-[52px] items-center gap-2 rounded-[12px] border border-dashed border-bvc-accent bg-bvc-accent-tint p-[10px]"
                      >
                        <span className="size-[7px] shrink-0 rounded-full bg-bvc-accent" />
                        <div className="flex flex-col gap-[1px]">
                          <span className="text-[12px] font-semibold text-bvc-muted">
                            {slot.instrument}
                          </span>
                          <span className="text-[12px] font-semibold text-bvc-accent-text">
                            thiếu bè
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — Warnings */}
        <div className="flex w-[280px] shrink-0 flex-col border-l border-bvc-border-strong">
          <div className="shrink-0 border-b border-bvc-line px-[18px] py-[14px]">
            <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-bvc-muted">
              Cảnh báo
            </span>
          </div>

          <div className="flex flex-col gap-[10px] px-[18px] py-[14px]">
            <div className="flex items-start gap-[10px]">
              <span
                className="mt-[4px] size-[7px] shrink-0 rounded-full"
                style={{ backgroundColor: "var(--color-bvc-warn)" }}
              />
              <span className="text-[13px] text-bvc-ink">Nhóm 1 thiếu bè Đàn nhị</span>
            </div>
            <div className="flex items-start gap-[10px]">
              <span
                className="mt-[4px] size-[7px] shrink-0 rounded-full"
                style={{ backgroundColor: "var(--color-bvc-warn)" }}
              />
              <span className="text-[13px] text-bvc-ink">Nhóm 2 thiếu bè Đàn bầu và Tỳ bà</span>
            </div>
            <div className="flex items-start gap-[10px]">
              <span
                className="mt-[4px] size-[7px] shrink-0 rounded-full"
                style={{ backgroundColor: "var(--color-bvc-ok)" }}
              />
              <span className="text-[13px] text-bvc-ink">Nhóm 3 đủ bè</span>
            </div>
          </div>

          <div className="mx-[18px] h-px bg-bvc-border-strong" />

          <div className="px-[18px] py-[14px]">
            <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-bvc-muted">
              Quy tắc
            </span>
            <ul className="mt-[10px] flex flex-col gap-[8px]">
              <li className="flex items-start gap-[8px] text-[13px] text-bvc-muted">
                <span className="mt-[6px] size-[5px] shrink-0 rounded-full bg-bvc-muted" />
                Mỗi nhóm cần ít nhất 3 bè
              </li>
              <li className="flex items-start gap-[8px] text-[13px] text-bvc-muted">
                <span className="mt-[6px] size-[5px] shrink-0 rounded-full bg-bvc-muted" />
                Cảnh báo nếu thiếu bè trước tuần 5
              </li>
              <li className="flex items-start gap-[8px] text-[13px] text-bvc-muted">
                <span className="mt-[6px] size-[5px] shrink-0 rounded-full bg-bvc-muted" />
                Sinh viên chỉ được ở 1 nhóm
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
