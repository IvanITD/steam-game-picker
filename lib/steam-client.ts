import { FetchTimeoutError, fetchWithTimeout } from "@/lib/fetch-with-timeout";
import type { LibraryError, SteamGame } from "@/types/steam";

const CLIENT_TIMEOUT_MS = 20_000;

export async function fetchLibrary(
  steamId: string,
  apiKey: string
): Promise<{ games: SteamGame[] } | { error: LibraryError }> {
  try {
    const params = new URLSearchParams({ steamId, apiKey });
    const res = await fetchWithTimeout(
      `/api/steam/library?${params}`,
      {},
      CLIENT_TIMEOUT_MS
    );
    const data = await res.json();

    if (!res.ok) {
      return { error: data as LibraryError };
    }

    return { games: data.games as SteamGame[] };
  } catch (error) {
    if (error instanceof FetchTimeoutError) {
      return {
        error: {
          code: "api_error",
          message:
            "Steam took too long to respond. Check your connection or try demo mode.",
        },
      };
    }
    return {
      error: {
        code: "network_error",
        message: "Could not reach the server. Check your connection and try again.",
      },
    };
  }
}

export async function resolveVanityUrl(
  vanityUrl: string,
  apiKey: string
): Promise<{ steamId: string } | { error: LibraryError }> {
  try {
    const params = new URLSearchParams({ vanityUrl, apiKey });
    const res = await fetchWithTimeout(
      `/api/steam/resolve?${params}`,
      {},
      CLIENT_TIMEOUT_MS
    );
    const data = await res.json();

    if (!res.ok) {
      return { error: data as LibraryError };
    }

    return { steamId: data.steamId as string };
  } catch (error) {
    if (error instanceof FetchTimeoutError) {
      return {
        error: {
          code: "api_error",
          message: "Steam took too long to respond. Try again in a moment.",
        },
      };
    }
    return {
      error: {
        code: "network_error",
        message: "Could not resolve Steam ID. Check your connection.",
      },
    };
  }
}

export async function enrichGamesWithGenres(
  games: SteamGame[],
  limit = 30
): Promise<SteamGame[]> {
  const needsEnrichment = games.filter((g) => !g.genres?.length).slice(0, limit);
  if (needsEnrichment.length === 0) return games;

  try {
    const appIds = needsEnrichment.map((g) => g.appid).join(",");
    const res = await fetchWithTimeout(
      `/api/steam/details?appids=${appIds}`,
      {},
      10_000
    );
    if (!res.ok) return games;

    const details = await res.json();
    const detailMap = details as Record<number, { genres: string[]; tags: string[] }>;

    return games.map((game) => {
      const extra = detailMap[game.appid];
      if (!extra) return game;
      return { ...game, genres: extra.genres, tags: extra.tags };
    });
  } catch {
    return games;
  }
}
