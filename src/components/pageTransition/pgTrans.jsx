// pgTrans.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PageTransition({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const overlay = document.getElementById("page-transition-overlay");

    // Roll curtain back down to reveal new page
    overlay.animate(
      [{ transform: "translateY(0%)" }, { transform: "translateY(-100%)" }],
      { duration: 450, easing: "cubic-bezier(0.76, 0, 0.24, 1)", fill: "forwards" }
    );
  }, [location.pathname]);

  useEffect(() => {
    const overlay = document.getElementById("page-transition-overlay");

    const handleClick = (e) => {
      const link = e.target.closest("a[href]");
      if (!link) return;

      e.preventDefault();
      const path = link.getAttribute("href");

      // Wipe up first, then navigate
      overlay.animate(
        [{ transform: "translateY(100%)" }, { transform: "translateY(0%)" }],
        { duration: 450, easing: "cubic-bezier(0.76, 0, 0.24, 1)", fill: "forwards" }
      ).onfinish = () => navigate(path);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return <>{children}</>;
}