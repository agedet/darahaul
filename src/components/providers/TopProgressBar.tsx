import { useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useLocation } from "react-router-dom";

// Optional: Configure NProgress settings
NProgress.configure({ showSpinner: false, speed: 500 });

export const TopProgressBar = () => {
  const location = useLocation()

  useEffect(() => {
    // Start the bar when location changes
    NProgress.start();

    // Finish the bar shortly after (simulating the "navigation complete")
    // In a generic SPA, navigation is instant, so we mimic the "loading" visual.
    const timer = setTimeout(() => {
      NProgress.done();
    }, 200); // 200ms delay to make it visible

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location]);

  return null; // This component renders nothing visually
};
