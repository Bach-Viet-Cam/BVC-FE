import { useEffect, useState } from "react";

// Trùng breakpoint sm / lg / xl của lưới thư viện
const COLUMN_BREAKPOINTS = [
  { minWidth: 1280, columns: 5 },
  { minWidth: 1024, columns: 4 },
  { minWidth: 640, columns: 3 },
];
const MIN_COLUMNS = 2;
const FALLBACK_COLUMNS = 4;

function readColumns() {
  if (typeof window === "undefined" || !window.matchMedia) return FALLBACK_COLUMNS;
  const matched = COLUMN_BREAKPOINTS.find(({ minWidth }) => window.matchMedia(`(min-width: ${minWidth}px)`).matches);
  return matched?.columns ?? MIN_COLUMNS;
}

export function useLibraryGridColumns() {
  const [columns, setColumns] = useState(readColumns);

  useEffect(() => {
    if (!window.matchMedia) return;
    const lists = COLUMN_BREAKPOINTS.map(({ minWidth }) => window.matchMedia(`(min-width: ${minWidth}px)`));
    const sync = () => setColumns(readColumns());
    lists.forEach((list) => list.addEventListener("change", sync));
    return () => lists.forEach((list) => list.removeEventListener("change", sync));
  }, []);

  return columns;
}
