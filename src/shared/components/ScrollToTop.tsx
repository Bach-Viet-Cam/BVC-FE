import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Mở màn mới thì về đầu trang; bấm Back/Forward (POP) thì để trình duyệt giữ vị trí cũ
export function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType !== "POP") window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, navigationType]);

  return null;
}
