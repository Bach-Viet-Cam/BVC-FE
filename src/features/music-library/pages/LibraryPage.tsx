import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { FilterChips, TagBadge } from "@/shared/components/bvc";

type TagVariant = "verified" | "community" | "pending" | "error" | "ok" | "warn" | "muted";

interface Song {
  id: string;
  name: string;
  tagVariant: TagVariant;
  tagLabel: string;
  genre: string;
  level: string;
  instrumentCount: number;
}

const SONGS: Song[] = [
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
    id: "trong-com",
    name: "Trống cơm",
    tagVariant: "verified",
    tagLabel: "Đã duyệt",
    genre: "Dân ca Bắc Bộ",
    level: "Hòa tấu",
    instrumentCount: 6,
  },
  {
    id: "luu-thuy-kim-tien",
    name: "Lưu thủy kim tiền",
    tagVariant: "pending",
    tagLabel: "Chờ duyệt",
    genre: "Nhạc lễ",
    level: "Nâng cao",
    instrumentCount: 5,
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
  {
    id: "ru-con-nam-bo",
    name: "Ru con Nam Bộ",
    tagVariant: "verified",
    tagLabel: "Đã duyệt",
    genre: "Dân ca",
    level: "Cơ bản",
    instrumentCount: 3,
  },
];

const CHIPS = [
  { value: "all", label: "Tất cả" },
  { value: "dan-ca", label: "Dân ca" },
  { value: "nhac-le", label: "Nhạc lễ" },
  { value: "quan-ho", label: "Quan họ" },
  { value: "hoa-tau", label: "Hòa tấu" },
];

export function LibraryPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredSongs = SONGS.filter((s) => {
    const matchesSearch =
      search.trim() === "" ||
      s.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex min-h-dvh justify-center bg-bvc-surface">
      <div className="flex h-dvh w-full max-w-[428px] flex-col overflow-hidden bg-white">
        {/* Top bar */}
        <div className="shrink-0">
          <h1 className="px-[14px] pt-[20px] text-[22px] font-extrabold text-bvc-ink">
            Thư viện
          </h1>

          {/* Search */}
          <div className="mx-[14px] mt-3 flex h-[44px] items-center gap-2 rounded-[14px] border border-bvc-border-strong bg-white px-[14px]">
            <Search size={17} className="shrink-0 text-bvc-faint" strokeWidth={1.8} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm bài nhạc..."
              className="flex-1 bg-transparent text-[14px] text-bvc-ink placeholder:text-bvc-faint focus:outline-none"
            />
          </div>

          {/* Filter chips */}
          <div className="mt-3 pb-[2px]">
            <FilterChips
              chips={CHIPS}
              active={activeFilter}
              onChange={setActiveFilter}
            />
          </div>
        </div>

        {/* Song list */}
        <div className="flex-1 overflow-y-auto pt-3">
          {filteredSongs.map((song) => (
            <button
              key={song.id}
              type="button"
              onClick={() => navigate(`/library/${song.id}`)}
              className="mx-[14px] mb-3 block w-[calc(100%-28px)] cursor-pointer rounded-[18px] border border-bvc-border p-[13px_14px] text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[15px] font-bold text-bvc-ink">
                  {song.name}
                </span>
                <TagBadge label={song.tagLabel} variant={song.tagVariant} />
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
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
