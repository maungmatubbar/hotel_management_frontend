"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/use-hydrated";
import { useThemeStore } from "@/store/theme-store";

export function ThemeToggle() {
  const hydrated = useHydrated();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = hydrated && theme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-10 w-10 rounded-full p-0"
      onClick={toggleTheme}
      aria-label="Toggle night mode"
      suppressHydrationWarning
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
