import { useEffect, useState } from "react";
import logo from "@/assets/auren-logo.png";

const STORAGE_KEY = "auren.splash.shown";

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
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
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a] transition-opacity duration-700 ease-out ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ animation: "auren-splash-in 600ms ease-out" }}
    >
      <img
        src={logo}
        alt="Auren Plumbing Supplies"
        className="w-40 h-40 object-contain"
        style={{ animation: "auren-splash-zoom 2200ms ease-out" }}
      />
      <div
        className="mt-6 font-display tracking-[0.35em] text-foreground/80 text-sm uppercase"
        style={{ animation: "auren-splash-in 1200ms ease-out" }}
      >
        Auren Plumbing Supplies
      </div>
      <style>{`
        @keyframes auren-splash-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes auren-splash-zoom {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
