import { useNavigate } from "react-router-dom";
import { Bookmark, Download } from "lucide-react";
import { MobileHeader, TagBadge } from "@/shared/components/bvc";

type TagVariant = "verified" | "community" | "pending" | "error" | "ok" | "warn" | "muted";

interface SavedSong {
  id: string;
  name: string;
  tagVariant: TagVariant;
  tagLabel: string;
  genre: string;
  level: string;
  instrumentCount: number;
}

interface DownloadedSheet {
  id: string;
  name: string;
  sizeMb: string;
}

const SAVED_SONGS: SavedSong[] = [
  {
    id: "ly-ngua-o",
    name: "Lý ngựa ô",
    tagVariant: "verified",
    tagLabel: "Đã duyệt",
    genre: "Dân ca Nam Bộ",
    level: "Trung cấp",
    instrumentCount: 4,
  },
  {
    id: "beo-dat-may-troi",
    name: "Bèo dạt mây trôi",
    tagVariant: "community",
    tagLabel: "Cộng đồng",
    genre: "Dân ca",
    level: "Cơ bản",
    instrumentCount: 3,
  },
  {
    id: "se-chi-luon-kim",
    name: "Se chỉ luồn kim",
    tagVariant: "verified",
    tagLabel: "Đã duyệt",
    genre: "Quan họ",
    level: "Cơ bản",
    instrumentCount: 4,
  },
];

const DOWNLOADED_SHEETS: DownloadedSheet[] = [
  { id: "ly-ngua-o-dan-tranh", name: "Lý ngựa ô - Đàn tranh", sizeMb: "1.2 MB" },
  { id: "beo-dat-dan-tranh", name: "Bèo dạt mây trôi - Đàn tranh", sizeMb: "0.9 MB" },
];

export function SavedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        <MobileHeader title="Đã lưu" />

        <div className="flex-1 overflow-y-auto">
          {/* Saved songs section */}
          <div className="mt-4 px-[14px]">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-bvc-muted">
                Bài nhạc đã lưu
              </span>
              <span className="flex size-[20px] items-center justify-center rounded-full bg-bvc-surface text-[12px] font-bold text-bvc-muted">
                {SAVED_SONGS.length}
              </span>
            </div>

            <div className="mt-2">
              {SAVED_SONGS.map((song) => (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => navigate(`/library/${song.id}`)}
                  className="mb-3 block w-full cursor-pointer rounded-[18px] border border-bvc-border p-[13px_14px] text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[15px] font-bold text-bvc-ink">
                      {song.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <TagBadge label={song.tagLabel} variant={song.tagVariant} />
                      <Bookmark
                        size={16}
                        className="shrink-0 text-bvc-accent"
                        fill="currentColor"
                        strokeWidth={0}
                      />
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[12px] text-bvc-muted">
                      {song.genre} · {song.level}
                    </span>
                    <span className="text-[12px] text-bvc-muted">
                      {song.instrumentCount} nhạc cụ
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Downloaded sheets section */}
          <div className="mt-5 px-[14px]">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-bvc-muted">
                Bản nhạc đã tải về
              </span>
              <span className="flex size-[20px] items-center justify-center rounded-full bg-bvc-surface text-[12px] font-bold text-bvc-muted">
                {DOWNLOADED_SHEETS.length}
              </span>
            </div>

            <div className="mt-2">
              {DOWNLOADED_SHEETS.map((sheet, idx) => (
                <div key={sheet.id}>
                  <div className="flex h-[52px] items-center justify-between gap-3">
                    <span className="flex-1 text-[14px] font-semibold text-bvc-ink">
                      {sheet.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Download
                        size={16}
                        className="text-bvc-ok"
                        strokeWidth={1.8}
                      />
                      <span className="text-[12px] text-bvc-muted">
                        {sheet.sizeMb}
                      </span>
                    </div>
                  </div>
                  {idx < DOWNLOADED_SHEETS.length - 1 && (
                    <div className="h-px bg-bvc-border" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}
