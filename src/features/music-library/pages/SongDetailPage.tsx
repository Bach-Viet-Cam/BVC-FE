import { useNavigate } from "react-router-dom";
import { MobileHeader, TagBadge } from "@/shared/components/bvc";

const SONG = {
  title: "Lý ngựa ô",
  genre: "Dân ca Nam Bộ",
  difficulty: "Trung cấp",
  timeSignature: "2/4",
  bpm: "84 BPM",
  duration: "2:54",
  sheets: [
    { id: "dan-tranh", instrument: "Đàn tranh" },
    { id: "dan-bau", instrument: "Đàn bầu" },
    { id: "dan-nhi", instrument: "Đàn nhị" },
    { id: "dan-ty-ba", instrument: "Đàn tỳ bà" },
  ],
};

const META_ROWS = [
  { label: "Độ khó", value: SONG.difficulty, mono: false },
  { label: "Nhịp", value: SONG.timeSignature, mono: true },
  { label: "Nhịp độ", value: SONG.bpm, mono: true },
  { label: "Thời lượng", value: SONG.duration, mono: true },
];

export function SongDetailPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        <MobileHeader
          title="Lý ngựa ô"
          subtitle="Thư viện"
        />

        <div className="flex-1 overflow-y-auto">
          {/* Hero section */}
          <div className="mx-[14px] mt-3 rounded-[20px] border border-bvc-border p-[16px]">
            <div className="flex items-center gap-2">
              <TagBadge label="Đã duyệt" variant="verified" />
              <span className="text-[13px] text-bvc-muted">{SONG.genre}</span>
            </div>
            <h1 className="mt-2 text-[22px] font-extrabold text-bvc-ink">
              {SONG.title}
            </h1>

            {/* Meta grid 2×2 */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              {META_ROWS.map(({ label, value, mono }) => (
                <div
                  key={label}
                  className="rounded-[14px] bg-bvc-surface p-[10px_12px]"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-bvc-muted">
                    {label}
                  </p>
                  <p
                    className={`mt-[2px] text-[15px] font-bold text-bvc-ink ${
                      mono ? "font-bvc-mono" : ""
                    }`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sheet versions card */}
          <div className="mx-[14px] mt-3 rounded-[20px] border border-bvc-border p-[14px]">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-bvc-ink">
                Bản nhạc
              </span>
              <span className="text-[13px] text-bvc-muted">
                {SONG.sheets.length} phiên bản
              </span>
            </div>

            <div className="mt-3 flex flex-col gap-1">
              {SONG.sheets.map((sheet, idx) => (
                <div key={sheet.id}>
                  <div className="flex h-[44px] items-center justify-between">
                    <span className="text-[14px] text-bvc-ink">
                      {sheet.instrument}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/library/ly-ngua-o/sheet?instrument=${sheet.id}`)
                      }
                      className="cursor-pointer text-[13px] font-semibold text-bvc-accent-text"
                    >
                      Xem
                    </button>
                  </div>
                  {idx < SONG.sheets.length - 1 && (
                    <div className="h-px bg-bvc-border" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Practice button */}
          <div className="mx-[14px] mt-4">
            <button
              type="button"
              onClick={() => navigate("/practice/ly-ngua-o")}
              className="flex h-[54px] w-full cursor-pointer items-center justify-center rounded-[16px] bg-bvc-ink text-[16px] font-bold text-white"
            >
              Luyện tập ngay
            </button>
          </div>

          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}
