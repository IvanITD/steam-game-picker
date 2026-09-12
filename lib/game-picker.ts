import { daysSincePlayed, formatLastPlayed, formatPlaytime } from "@/lib/format";
import type {
  GameFilters,
  Mood,
  PickCategory,
  PickResult,
  PlaytimeBucket,
  SteamGame,
  TimeAvailable,
} from "@/types/steam";

function matchesPlaytimeBucket(minutes: number, bucket: PlaytimeBucket): boolean {
  const hours = minutes / 60;
  switch (bucket) {
    case "any":
      return true;
    case "never":
      return minutes === 0;
    case "under1h":
      return hours > 0 && hours < 1;
    case "1to10h":
      return hours >= 1 && hours < 10;
    case "10to50h":
      return hours >= 10 && hours < 50;
    case "over50h":
      return hours >= 50;
    default:
      return true;
  }
}

function applyFilters(games: SteamGame[], filters: GameFilters): SteamGame[] {
  return games.filter((game) => {
    if (filters.neverPlayedOnly && game.playtimeForever > 0) return false;
    if (!matchesPlaytimeBucket(game.playtimeForever, filters.playtimeBucket)) return false;

    if (filters.notPlayedInDays !== null) {
      const days = daysSincePlayed(game.lastPlayed);
      if (days !== null && days < filters.notPlayedInDays) return false;
      if (days === null && game.playtimeForever > 0) return false;
    }

    if (filters.genres.length > 0) {
      const gameGenres = game.genres ?? [];
      if (!filters.genres.some((g) => gameGenres.includes(g))) return false;
    }

    return true;
  });
}

function categorizeGame(game: SteamGame): PickCategory {
  const days = daysSincePlayed(game.lastPlayed);
  const hours = game.playtimeForever / 60;

  if (game.playtimeForever === 0) return "never-played";
  if (hours >= 5 && days !== null && days >= 30) return "neglected-favorite";
  if (days !== null && days <= 14 && hours >= 2) return "recently-enjoyed";
  if (hours >= 10 && days !== null && days <= 7) return "comfort-pick";
  return "backlog-gem";
}

function moodWeight(game: SteamGame, mood: Mood): number {
  const hours = game.playtimeForever / 60;
  const days = daysSincePlayed(game.lastPlayed);
  const category = categorizeGame(game);

  switch (mood) {
    case "something-new":
      return game.playtimeForever === 0 ? 5 : 0.2;
    case "quick":
      if (hours === 0) return 3;
      if (hours < 5) return 4;
      if (hours < 20) return 2.5;
      return 0.8;
    case "deep":
      if (hours >= 20) return 4;
      if (hours >= 5) return 3;
      if (hours === 0) return 1.5;
      return 1;
    case "comfort":
      if (days !== null && days <= 14 && hours >= 5) return 5;
      if (hours >= 10) return 2;
      return 0.5;
    case "revisit":
      if (category === "neglected-favorite") return 5;
      if (hours >= 5 && days !== null && days >= 21) return 3;
      return 0.4;
    case "balanced":
    default:
      if (category === "never-played") return 2.5;
      if (category === "neglected-favorite") return 3;
      if (category === "recently-enjoyed") return 2.8;
      if (category === "comfort-pick") return 2.2;
      return 1.5;
  }
}

function timeWeight(game: SteamGame, time: TimeAvailable): number {
  const hours = game.playtimeForever / 60;
  const tags = (game.tags ?? []).map((t) => t.toLowerCase());
  const genres = (game.genres ?? []).map((g) => g.toLowerCase());

  const isQuickFriendly =
    tags.some((t) =>
      ["roguelike", "puzzle", "casual", "arcade", "bullet hell", "fast-paced"].includes(t)
    ) ||
    genres.includes("casual") ||
    (hours > 0 && hours < 10);

  const isLongSession =
    tags.some((t) =>
      ["open world", "story rich", "rpg", "turn-based", "sandbox"].includes(t)
    ) ||
    genres.includes("rpg") ||
    hours >= 20;

  switch (time) {
    case "15min":
    case "30min":
      return isQuickFriendly ? 4 : hours === 0 ? 2 : 0.6;
    case "1hour":
      return isQuickFriendly ? 3 : 1.5;
    case "2hours-plus":
      return isLongSession ? 4 : hours === 0 ? 2.5 : 1.2;
    case "any":
    default:
      return 1;
  }
}

function buildReason(game: SteamGame, category: PickCategory, mood: Mood): string {
  const playtime = formatPlaytime(game.playtimeForever);
  const lastPlayed = formatLastPlayed(game.lastPlayed);

  const categoryReasons: Record<PickCategory, string> = {
    "never-played": `Still sitting in your backlog with ${playtime.toLowerCase()} — a great time to finally start.`,
    "neglected-favorite": `You put ${playtime} into this but haven't played since ${lastPlayed.toLowerCase()}. Worth revisiting.`,
    "recently-enjoyed": `You were enjoying this recently (${lastPlayed.toLowerCase()}, ${playtime} total) — keep the momentum going.`,
    "comfort-pick": `A reliable favorite with ${playtime} logged. Easy choice when you want something familiar.`,
    "backlog-gem": `A solid pick from your library (${playtime}, last played ${lastPlayed.toLowerCase()}).`,
  };

  const moodHints: Partial<Record<Mood, string>> = {
    quick: " Fits a shorter session.",
    deep: " Good for settling in for a while.",
    "something-new": " Fresh territory for you.",
    comfort: " Low friction, high enjoyment.",
    revisit: " Time to dust this one off.",
  };

  return categoryReasons[category] + (moodHints[mood] ?? "");
}

function weightedRandomPick(scored: { game: SteamGame; score: number; category: PickCategory }[]): {
  game: SteamGame;
  score: number;
  category: PickCategory;
} {
  const total = scored.reduce((sum, s) => sum + s.score, 0);
  let roll = Math.random() * total;
  for (const entry of scored) {
    roll -= entry.score;
    if (roll <= 0) return entry;
  }
  return scored[scored.length - 1];
}

export function pickGame(
  games: SteamGame[],
  filters: GameFilters,
  excludeAppIds: number[] = []
): PickResult | null {
  const filtered = applyFilters(games, filters).filter(
    (g) => !excludeAppIds.includes(g.appid)
  );

  if (filtered.length === 0) return null;

  const scored = filtered.map((game) => {
    const category = categorizeGame(game);
    const base = moodWeight(game, filters.mood);
    const time = timeWeight(game, filters.timeAvailable);
    const jitter = 0.7 + Math.random() * 0.6;
    const score = base * time * jitter;

    return { game, score, category };
  });

  const winner = weightedRandomPick(scored);
  const reason = buildReason(winner.game, winner.category, filters.mood);

  return {
    game: winner.game,
    reason,
    category: winner.category,
    score: winner.score,
  };
}

export function getAvailableGenres(games: SteamGame[]): string[] {
  const genres = new Set<string>();
  for (const game of games) {
    for (const genre of game.genres ?? []) {
      genres.add(genre);
    }
  }
  return Array.from(genres).sort();
}

export function filterGamesForDisplay(games: SteamGame[], filters: GameFilters): SteamGame[] {
  return applyFilters(games, filters);
}
