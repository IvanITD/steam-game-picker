export function formatPlaytime(minutes: number): string {
  if (minutes === 0) return "Never played";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

/** Banner-style chip, e.g. "24.5 hrs" */
export function formatCompactHours(minutes: number): string {
  if (minutes === 0) return "0 hrs";
  return `${(minutes / 60).toFixed(1)} hrs`;
}

export function formatLastPlayed(timestamp?: number): string {
  if (!timestamp) return "Never";
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return date.toLocaleDateString();
}

export function daysSincePlayed(timestamp?: number): number | null {
  if (!timestamp) return null;
  const diffMs = Date.now() - timestamp * 1000;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function headerImageUrl(appid: number): string {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;
}

/** Tall Steam library capsule — closest match to the banner posters. */
export function libraryCapsuleUrl(appid: number): string {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`;
}
