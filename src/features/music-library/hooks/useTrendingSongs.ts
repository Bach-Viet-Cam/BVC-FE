import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { musicLibraryApi } from "@/features/music-library/api/musicLibraryApi";

// Top bài có nhiều lượt nộp nhất trong tuần; banner chỉ là phần phụ nên lỗi thì ẩn, không chặn trang
export function useTrendingSongs() {
  const { data, error, isFirstLoad } = useAsyncData(
    () => musicLibraryApi.listTrendingSongs(),
    "library-trending",
    undefined,
    {
      cache: true,
    }
  );

  return { songs: data?.items ?? [], error, isFirstLoad };
}
