export interface SteamGame {
  appid: number;
  name: string;
  playtimeForever: number; // minutes
  playtime2Weeks?: number;
  lastPlayed?: number; // unix timestamp
  headerImage: string;
  genres?: string[];
  tags?: string[];
}

export interface UserSettings {
  steamId: string;
  apiKey: string;
  useDemoMode: boolean;
}

export type PlaytimeBucket = "any" | "never" | "under1h" | "1to10h" | "10to50h" | "over50h";

export type Mood =
  | "balanced"
  | "quick"
  | "deep"
  | "something-new"
  | "comfort"
  | "revisit";

export type TimeAvailable = "any" | "15min" | "30min" | "1hour" | "2hours-plus";

export interface GameFilters {
  playtimeBucket: PlaytimeBucket;
  neverPlayedOnly: boolean;
  notPlayedInDays: number | null;
  genres: string[];
  mood: Mood;
  timeAvailable: TimeAvailable;
}

export type PickCategory =
  | "never-played"
  | "neglected-favorite"
  | "recently-enjoyed"
  | "comfort-pick"
  | "backlog-gem";

export interface PickResult {
  game: SteamGame;
  reason: string;
  category: PickCategory;
  score: number;
}

export type LibraryLoadState =
  | "idle"
  | "loading"
  | "success"
  | "error";

export type LibraryErrorCode =
  | "invalid_steam_id"
  | "private_profile"
  | "missing_api_key"
  | "api_error"
  | "no_games"
  | "network_error";

export interface LibraryError {
  code: LibraryErrorCode;
  message: string;
}
