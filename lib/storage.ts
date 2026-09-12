import type { GameFilters, UserSettings } from "@/types/steam";

const SETTINGS_KEY = "steam-picker-settings";
const FILTERS_KEY = "steam-picker-filters";

export const DEFAULT_SETTINGS: UserSettings = {
  steamId: "",
  apiKey: "",
  useDemoMode: true,
};

export const DEFAULT_FILTERS: GameFilters = {
  playtimeBucket: "any",
  neverPlayedOnly: false,
  notPlayedInDays: null,
  genres: [],
  mood: "balanced",
  timeAvailable: "any",
};

export function loadSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadFilters(): GameFilters {
  if (typeof window === "undefined") return DEFAULT_FILTERS;
  try {
    const raw = localStorage.getItem(FILTERS_KEY);
    if (!raw) return DEFAULT_FILTERS;
    return { ...DEFAULT_FILTERS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_FILTERS;
  }
}

export function saveFilters(filters: GameFilters): void {
  localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
}
