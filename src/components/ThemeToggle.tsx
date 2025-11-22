"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    const stored = localStorage.getItem("arbinote-theme");
    return (stored as "light" | "dark") || "light";
  });

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") return;

    const html = document.documentElement;
    if (theme === "dark") {
      localStorage.setItem("arbinote-theme", "dark");
      html.classList.add("dark");
    } else {
      localStorage.setItem("arbinote-theme", "light");
      html.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label={theme === "light" ? "Passer en mode sombre" : "Passer en mode clair"}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
