import { useMemo } from "react";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import type { SelectOption } from "@/shared/types/commonTypes";
import { musicLibraryApi } from "@/features/music-library/api/musicLibraryApi";
import type { CategoryRef } from "@/features/music-library/types/musicLibraryTypes";

const toOptions = (items: CategoryRef[] = []): SelectOption[] =>
  items.map((item) => ({ value: item.id, label: item.name }));

export function useMusicCategories() {
  const { data, error, isFirstLoad } = useAsyncData(() => musicLibraryApi.getCategories(), "music-categories");

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
