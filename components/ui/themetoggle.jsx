"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const THEME_STORAGE_KEY = "app-theme";

function resolveIsDark(theme) {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme) {
  const isDark = resolveIsDark(theme);
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  return isDark;
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    const initialTheme = saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
    setIsDark(applyTheme(initialTheme));

    if (initialTheme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => setIsDark(applyTheme("system"));
    media.addEventListener("change", syncSystemTheme);
    return () => media.removeEventListener("change", syncSystemTheme);
  }, []);

  const toggle = () => {
    const nextTheme = isDark ? "light" : "dark";
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setIsDark(applyTheme(nextTheme));
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative flex items-center w-16 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
      style={{
        backgroundColor: isDark ? "#1e1b4b" : "#e0e7ff",
      }}
    >
      <span
        className="absolute flex items-center justify-center w-6 h-6 rounded-full shadow-md transition-all duration-300"
        style={{
          left: isDark ? "calc(100% - 28px)" : "4px",
          backgroundColor: isDark ? "#6366f1" : "#ffffff",
        }}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.5} />
        )}
      </span>

      <Sun
        className="ml-1 w-3 h-3 transition-opacity duration-200"
        style={{ color: "#f59e0b", opacity: isDark ? 0.3 : 0 }}
        strokeWidth={2.5}
      />
      <Moon
        className="ml-auto mr-1 w-3 h-3 transition-opacity duration-200"
        style={{ color: "#818cf8", opacity: isDark ? 0 : 0.35 }}
        strokeWidth={2.5}
      />
    </button>
  );
}
