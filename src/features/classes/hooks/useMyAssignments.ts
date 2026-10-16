import { useEffect, useState } from "react";
import { assignmentApi } from "@/features/classes/api/assignmentApi";
import { type AssignmentListItem, type MyAssignmentsParams } from "@/features/classes/types/assignmentTypes";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

const LOAD_ERROR = "Tải dữ liệu thất bại. Vui lòng thử lại.";

export function useMyAssignments(type: MyAssignmentsParams["type"]) {
  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const nextQuery = searchText.trim();
    if (nextQuery === query) return;
    const timer = window.setTimeout(() => setQuery(nextQuery), 300);
    return () => window.clearTimeout(timer);
  }, [searchText, query]);

  const params: MyAssignmentsParams = { type, q: query || undefined, sortBy: "deadline", sortDir: "asc" };
  const { data, error, isLoading } = useAsyncData<AssignmentListItem[]>(
    () => assignmentApi.listMine(params).then(({ data: body }) => body.data),
    JSON.stringify(params),
    LOAD_ERROR
  );

  return { items: data ?? [], error, isLoading, searchText, setSearchText };
}
