import { useCallback, useEffect, useRef, useState } from "react";
import { classesApi } from "@/features/classes/api/classesApi";
import { type Lecturer } from "@/features/classes/types/classTypes";

const DEBOUNCE_MS = 300;

// Tìm giảng viên theo email: debounce 300ms, bỏ qua chuỗi rỗng, chỉ nhận kết quả của lần gõ mới nhất
export function useLecturerLookup() {
  const [results, setResults] = useState<Lecturer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRequest = useRef(0);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => clearTimer, []);

  const search = useCallback((email: string) => {
    clearTimer();
    const keyword = email.trim();
    const requestId = ++latestRequest.current;
    if (!keyword) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    timer.current = setTimeout(() => {
      classesApi
        .lookupLecturers(keyword)
        .then(({ data }) => {
          if (requestId === latestRequest.current) setResults(data.data);
        })
        .catch(() => {
          if (requestId === latestRequest.current) setResults([]);
        })
        .finally(() => {
          if (requestId === latestRequest.current) setIsSearching(false);
        });
    }, DEBOUNCE_MS);
  }, []);

  return { results, isSearching, search };
}
