import { useEffect, useState } from "react";
import splash from "@/assets/splash-screen.png";

const STORAGE_KEY = "auren.splash.shown";

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Show once per session
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(true);
    const fadeTimer = setTimeout(() => setFadeOut(true), 1400);
    const hideTimer = setTimeout(() => setVisible(false), 2200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a] transition-opacity duration-700 ease-out ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ animation: "auren-splash-in 600ms ease-out" }}
    >
      <img
        src={splash}
        alt=""
        className="h-full w-full object-cover"
        style={{ animation: "auren-splash-zoom 2200ms ease-out" }}
      />
      <style>{`
        @keyframes auren-splash-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes auren-splash-zoom {
          from { transform: scale(1.04); filter: brightness(0.85); }
          to { transform: scale(1); filter: brightness(1); }
        }
      `}</style>
    </div>
  );
}
