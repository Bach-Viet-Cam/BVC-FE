import { useMemo } from "react";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import type { SelectOption } from "@/shared/types/commonTypes";
import { lecturerApi } from "@/features/music-library/api/lecturerApi";
import { musicLibraryApi } from "@/features/music-library/api/musicLibraryApi";
import type { CategoryRef } from "@/features/music-library/types/musicLibraryTypes";

// Cùng endpoint /library/filters; màn giảng viên đọc qua lecturerApi
const LOADERS = {
  library: () => musicLibraryApi.getCategories(),
  lecturer: () => lecturerApi.getFilters().then(({ data }) => data.data),
};

const toOptions = (items: CategoryRef[] = []): SelectOption[] =>
  items.map((item) => ({ value: item.id, label: item.name }));

export function useMusicCategories(source: keyof typeof LOADERS = "library") {
  const { data, error, isFirstLoad } = useAsyncData(LOADERS[source], `music-categories:${source}`, undefined, {
    cache: true,
  });

  const options = useMemo(
    () => ({
      genres: toOptions(data?.genres),
      instruments: toOptions(data?.instruments),
      levels: toOptions(data?.levels),
    }),
    [data]
  );

  return { categories: data, options, error, isLoading: isFirstLoad };
}
