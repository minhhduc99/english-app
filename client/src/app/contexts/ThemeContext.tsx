import React, { createContext, useContext, useState, useEffect } from "react";

export type BackgroundTheme = "default" | "blue" | "green" | "purple" | "gradient" | "pink";
export type AppTheme = "light" | "dark" | "auto";

interface ThemeContextType {
  background: BackgroundTheme;
  setBackground: (bg: BackgroundTheme) => void;
  getBackgroundClass: () => string;
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
}

export const backgrounds = [
  { id: "default", name: "Default", preview: "bg-[#F8F9FA]", class: "bg-[#F8F9FA]" },
  { id: "blue", name: "Ocean Blue", preview: "bg-gradient-to-br from-blue-50 to-blue-100", class: "bg-gradient-to-br from-blue-50 to-blue-100" },
  { id: "green", name: "Fresh Green", preview: "bg-gradient-to-br from-green-50 to-green-100", class: "bg-gradient-to-br from-green-50 to-green-100" },
  { id: "purple", name: "Royal Purple", preview: "bg-gradient-to-br from-purple-50 to-purple-100", class: "bg-gradient-to-br from-purple-50 to-purple-100" },
  { id: "gradient", name: "Sunset", preview: "bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50", class: "bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50" },
  { id: "pink", name: "Cherry Pink", preview: "bg-gradient-to-br from-pink-50 to-pink-100", class: "bg-gradient-to-br from-pink-50 to-pink-100" },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [background, setBackgroundState] = useState<BackgroundTheme>("default");
  const [theme, setThemeState] = useState<AppTheme>("light");

  useEffect(() => {
    const savedBg = localStorage.getItem("app_bg") as BackgroundTheme;
    if (savedBg && backgrounds.some(b => b.id === savedBg)) {
      setBackgroundState(savedBg);
    }
    
    const savedTheme = localStorage.getItem("app_theme") as AppTheme;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    const isDark = 
      theme === "dark" || 
      (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const setBackground = (bg: BackgroundTheme) => {
    setBackgroundState(bg);
    localStorage.setItem("app_bg", bg);
  };

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
    localStorage.setItem("app_theme", t);
  };

  const getBackgroundClass = () => {
    const isDark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      return "bg-gray-900 text-gray-100";
    }
    const bg = backgrounds.find(b => b.id === background);
    return bg ? bg.class : backgrounds[0].class;
  };

  return (
    <ThemeContext.Provider value={{ background, setBackground, getBackgroundClass, theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
