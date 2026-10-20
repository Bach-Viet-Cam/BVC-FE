import { useCallback, useState } from "react";
import { toast } from "@/shared/components/ui/toast";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { lecturerApi } from "@/features/music-library/api/lecturerApi";
import { MANAGE_PAGE_SIZE } from "@/features/music-library/constants/musicLibraryConstants";
import type { LecturerPiece, LecturerPieceQuery } from "@/features/music-library/types/lecturerTypes";
import type { EditableVisibility, ManagedSongQuery } from "@/features/music-library/types/musicLibraryTypes";

const LOAD_ERROR = "Tải danh sách bài hát thất bại. Vui lòng thử lại.";

export const INITIAL_MANAGED_QUERY: ManagedSongQuery = {
  keyword: "",
  genreId: "",
  instrumentId: "",
  levelId: "",
  visibility: "",
  page: 1,
};

function toApiQuery(query: ManagedSongQuery): LecturerPieceQuery {
  return {
    q: query.keyword || undefined,
    genreId: query.genreId || undefined,
    instrumentId: query.instrumentId || undefined,
    levelId: query.levelId || undefined,
    visibility: query.visibility || "ALL",
    page: query.page,
    pageSize: MANAGE_PAGE_SIZE,
  };
}

export function useManagedSongs() {
  const [query, setQuery] = useState<ManagedSongQuery>(INITIAL_MANAGED_QUERY);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { data, error, isLoading, isFirstLoad, reload, mutate } = useAsyncData(
    () => lecturerApi.listPieces(toApiQuery(query)).then(({ data: body }) => body.data),
    `lecturer-pieces:${JSON.stringify(query)}`,
    LOAD_ERROR
  );

  // Đổi bộ lọc thì về trang 1
  const updateQuery = useCallback((changes: Partial<ManagedSongQuery>) => {
    setQuery((current) => ({ ...current, page: 1, ...changes }));
  }, []);

  const changeVisibility = useCallback(
    async (song: LecturerPiece, visibility: EditableVisibility) => {
      setUpdatingId(song.id);
      try {
        const { data: body } = await lecturerApi.setPieceVisibility(song.id, visibility);
        const updated = body.data.piece;
        mutate((current) => ({
          ...current,
          items: current.items.map((item) => (item.id === updated.id ? updated : item)),
        }));
        toast.success(body.message, song.title);
      } catch (changeError) {
        toast.error("Không đổi được trạng thái", getErrorMessage(changeError));
      } finally {
        setUpdatingId(null);
      }
    },
    [mutate]
  );

  return {
    query,
    updateQuery,
    result: data,
    error,
    isLoading,
    isFirstLoad,
    reload,
    changeVisibility,
    updatingId,
  };
}
