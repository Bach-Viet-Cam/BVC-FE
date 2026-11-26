import { useState } from "react";
import { challengeApi } from "@/features/community/api/challengeApi";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

const PAGE_SIZE = 12;

export function useStudentChallenges() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading, reload } = useApiQuery(
    `student-challenges:${page}`,
    async () => (await challengeApi.listForStudent({ page, limit: PAGE_SIZE })).data.data
  );
  const total = data?.pagination.total ?? 0;
  return {
    items: data?.items ?? [],
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    setPage,
    isLoading,
    error: error ? "Tải dữ liệu thất bại. Vui lòng thử lại." : null,
    reload,
  };
}
