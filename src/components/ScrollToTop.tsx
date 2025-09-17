import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // If a restoreScroll value was provided via navigation state, use it; otherwise scroll to top
    const restore = (location.state as any)?.restoreScroll;
    if (typeof restore === 'number') {
      window.scrollTo({ top: restore, behavior: 'auto' });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return null;
};

export default ScrollToTop;
