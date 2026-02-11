"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";

const getInitialTheme = (): Theme => {
  if (typeof document === "undefined") return "light";
  const current = document.documentElement.getAttribute("data-theme");
  return current === "dark" ? "dark" : "light";
};

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>("light");
  const isLightMode = theme === "light";

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  const handleToggle = () => {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={handleToggle}
      aria-label={`Switch to ${isLightMode ? "dark" : "light"} mode`}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {isLightMode ? (
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M18 14.5A7.5 7.5 0 1 1 9.5 6a6.2 6.2 0 0 0 8.5 8.5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M12 2.75v2.1M12 19.15v2.1M2.75 12h2.1M19.15 12h2.1M5.45 5.45l1.5 1.5M17.05 17.05l1.5 1.5M5.45 18.55l1.5-1.5M17.05 6.95l1.5-1.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
};
