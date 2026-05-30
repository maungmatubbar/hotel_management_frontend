import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyTheme, type Theme } from "@/lib/theme";

type ThemeStore = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "light",
      toggleTheme: () =>
        set((state) => {
          const theme: Theme = state.theme === "light" ? "dark" : "light";
          applyTheme(theme);
          return { theme };
        }),
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    {
      name: "hotelos-theme",
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyTheme(state.theme);
        }
      },
    }
  )
);
