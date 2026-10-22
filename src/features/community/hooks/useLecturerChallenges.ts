import { useState } from "react";
import { challengeApi } from "@/features/community/api/challengeApi";
import { parseApiError } from "@/features/classes/utils/mapApiErrors";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

const PAGE_SIZE = 10;

type ActionOutcome = { message: string } | { error: string };

export function useLecturerChallenges() {
  const [page, setPage] = useState(1);
  const [isWorking, setIsWorking] = useState(false);
  const { data, error, isLoading, reload } = useApiQuery(
    `challenges:${page}`,
    async () => (await challengeApi.list({ page, limit: PAGE_SIZE })).data.data
  );

  const total = data?.pagination.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const remove = async (challengeId: string): Promise<ActionOutcome> => {
    setIsWorking(true);
    try {
      const { data: response } = await challengeApi.remove(challengeId);
      // Deleting the last row of a page falls back to the previous page.
      if (page > 1 && (data?.items.length ?? 0) <= 1) setPage(page - 1);
      else reload();
      return { message: response.message };
    } catch (caught) {
      return { error: parseApiError(caught, "Thao tác thất bại. Vui lòng thử lại.").message };
    } finally {
      setIsWorking(false);
    }
  };

  return {
    items: data?.items ?? [],
    page,
    totalPages,
    setPage,
    isLoading,
    isWorking,
    error: error ? "Tải dữ liệu thất bại. Vui lòng thử lại." : null,
    reload,
    remove,
  };
}
