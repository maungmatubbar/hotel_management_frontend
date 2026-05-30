export type Theme = "light" | "dark";

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("hotelos-theme");
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { state?: { theme?: Theme }; theme?: Theme };
    return parsed.state?.theme ?? parsed.theme ?? null;
  } catch {
    return null;
  }
}
