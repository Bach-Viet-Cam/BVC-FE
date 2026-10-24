import { Link, useSearchParams } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { EmptyState } from "@/shared/components/bvc/EmptyState";
import { PillTabs } from "@/shared/components/bvc/PillTabs";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";
import { cn } from "@/shared/utils/cn";
import { CoverArt } from "@/features/music-library/components/CoverArt";
import { SAVED_GRID_COLUMNS, SavedItemRow } from "@/features/music-library/components/SavedItemRow";
import { useSavedContent } from "@/features/music-library/hooks/useSavedContent";
import { sheetViewerHref } from "@/features/music-library/utils/sheetUtils";

type SavedTab = "songs" | "sheets";

const COLUMN_HEADERS: Record<SavedTab, string[]> = {
  songs: ["Bài hát", "Nhạc cụ", "Trình độ", "Đã lưu", ""],
  sheets: ["Bản · bài hát", "Nhạc cụ", "Trình độ", "Đã lưu", ""],
};

function instrumentSummary(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  return `${names[0]} +${names.length - 1}`;
}

export function SavedPage() {
  const [params, setParams] = useSearchParams();
  const tab: SavedTab = params.get("tab") === "sheets" ? "sheets" : "songs";
  const saved = useSavedContent();

  const changeTab = (next: SavedTab) => setParams(next === "songs" ? {} : { tab: next }, { replace: true });

  const isEmpty = tab === "songs" ? saved.savedSongs?.length === 0 : saved.savedSheets?.length === 0;

  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-5 px-[18px] pt-4 pb-8 md:px-14 md:pt-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-[27px] leading-tight font-extrabold tracking-[-0.025em] text-bvc-ink md:text-[40px] md:tracking-[-0.03em]">
            Nội dung đã lưu
          </h1>
          <p className="text-sm text-bvc-muted md:text-[15px]">Mới lưu nằm trên cùng.</p>
        </div>

        <PillTabs<SavedTab>
          label="Loại nội dung đã lưu"
          value={tab}
          onChange={changeTab}
          tabs={[
            { value: "songs", label: "Bài hát", count: saved.savedSongs?.length },
            { value: "sheets", label: "Bản nhạc", count: saved.savedSheets?.length },
          ]}
        />

        {saved.error ? (
          <EmptyState
            title="Không tải được nội dung đã lưu"
            description={saved.error}
            actions={<ActionButton onClick={saved.reload}>Thử lại</ActionButton>}
          />
        ) : saved.isLoading ? (
          <div aria-hidden className="flex animate-pulse flex-col gap-3">
            {Array.from({ length: 5 }, (_, index) => (
              <span key={index} className="h-[60px] rounded-2xl bg-bvc-surface" />
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyState
            icon={<Bookmark className="size-10" strokeWidth={1.5} />}
            title={tab === "songs" ? "Bạn chưa lưu bài hát nào" : "Bạn chưa lưu bản nhạc nào"}
            description="Bấm biểu tượng lưu ở thư viện, trang bài hát hoặc khi xem bản nhạc để xem lại nhanh ở đây."
            actions={
              <Link to="/library" className={actionButtonClass("primary", "md", "hover:text-white")}>
                Mở thư viện
              </Link>
            }
          />
        ) : (
          <div>
            <div
              aria-hidden
              className={cn(
                "hidden px-3.5 pb-2.5 text-xs font-bold tracking-[0.06em] text-bvc-muted uppercase",
                SAVED_GRID_COLUMNS
              )}
            >
              {COLUMN_HEADERS[tab].map((header, index) => (
                <span key={index}>{header}</span>
              ))}
            </div>
            <ul className="border-b border-bvc-border">
              {tab === "songs"
                ? saved.savedSongs?.map((item) => (
                    <SavedItemRow
                      key={item.song.id}
                      cover={
                        <CoverArt
                          title={item.song.title}
                          tone={item.song.coverTone}
                          url={item.song.coverUrl}
                          size="thumb"
                        />
                      }
                      title={item.song.title}
                      subtitle={item.song.genre.name}
                      instruments={instrumentSummary(item.song.instruments.map((instrument) => instrument.name))}
                      savedAt={item.savedAt}
                      href={`/library/${item.song.id}`}
                      isAvailable={item.isAvailable}
                      isPending={saved.isPending(item.song.id)}
                      onUnsave={() => saved.unsaveSong(item)}
                    />
                  ))
                : saved.savedSheets?.map((item) => (
                    <SavedItemRow
                      key={item.sheet.id}
                      cover={
                        <CoverArt
                          title={item.song.title}
                          tone={item.song.coverTone}
                          url={item.song.coverUrl}
                          size="thumb"
                        />
                      }
                      title={item.sheet.name}
                      subtitle={item.song.title}
                      instruments={item.sheet.instrument.name}
                      level={item.sheet.level.name}
                      savedAt={item.savedAt}
                      href={sheetViewerHref(item.song.id, item.sheet.id)}
                      isAvailable={item.isAvailable}
                      isPending={saved.isPending(item.sheet.id)}
                      onUnsave={() => saved.unsaveSheet(item)}
                    />
                  ))}
            </ul>
          </div>
        )}

        <p className="text-[13px] text-bvc-muted">
          Bài hát hoặc bản nhạc đã bị ẩn hiện mờ với nhãn “Không khả dụng”: bạn không mở được nhưng vẫn bỏ lưu được.
        </p>
      </div>
    </StudentShell>
  );
}
