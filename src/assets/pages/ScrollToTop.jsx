// src/assets/pages/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const location = useLocation();
  const { pathname, hash, key } = location;

  useEffect(() => {
    // If there's a hash, try to scroll to that element (retry a few times).
    if (hash) {
      const id = hash.replace("#", "");
      let attempts = 0;
      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          // scroll to element
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (attempts < 8) {
          attempts += 1;
          // retry after short delay to let DOM mount
          setTimeout(tryScroll, 100 * attempts);
        } else {
          // fallback to top if element never appears
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      };
      // small delay so that route render can start
      setTimeout(tryScroll, 50);
      return;
    }

    // No hash: scroll to top on pathname or navigation key changes
    window.scrollTo({ top: 0, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hash, key]);

  return null;
}

export default ScrollToTop;
