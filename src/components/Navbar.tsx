import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Moon, Sun } from "lucide-react";

export function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full p-4 flex justify-between items-center z-50 pointer-events-none">
      <div className="pointer-events-auto">
        {location.pathname !== '/' && (
          <Link to="/" className="flex items-center gap-2 p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            <Home className="w-5 h-5" />
            <span className="font-semibold text-sm hidden sm:inline">الرئيسية</span>
          </Link>
        )}
      </div>
      
      <button 
        onClick={toggleTheme}
        className="pointer-events-auto p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
        aria-label="Toggle Theme"
      >
        {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
      </button>
    </nav>
  );
}
