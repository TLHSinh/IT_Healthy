// components/DarkModeToggle.jsx
import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const DarkModeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center gap-2 p-2 rounded-xl border border-indigo-200 dark:border-indigo-600 bg-white dark:bg-indigo-900 text-indigo-600 dark:text-yellow-300 transition-all duration-300 hover:scale-105"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      <span className="text-sm">{theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}</span>
    </button>
  );
};

export default DarkModeToggle;
