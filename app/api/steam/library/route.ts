import { NextRequest, NextResponse } from "next/server";
import type { LibraryError, SteamGame } from "@/types/steam";
import { FetchTimeoutError, fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { headerImageUrl } from "@/lib/format";

const STEAM_TIMEOUT_MS = 15_000;

function isValidSteamId(id: string): boolean {
  return /^\d{17}$/.test(id);
}

export async function GET(request: NextRequest) {
  const steamId = request.nextUrl.searchParams.get("steamId") ?? "";
  const apiKey = request.nextUrl.searchParams.get("apiKey") ?? "";

  if (!steamId || !isValidSteamId(steamId)) {
    return NextResponse.json(
      {
        code: "invalid_steam_id",
        message: "Enter a valid 17-digit Steam ID64. Vanity URLs can be resolved in settings.",
      } satisfies LibraryError,
      { status: 400 }
    );
  }

  if (!apiKey) {
    return NextResponse.json(
      {
        code: "missing_api_key",
        message:
          "A Steam Web API key is required to read your library. Get one free at steamcommunity.com/dev/apikey.",
      } satisfies LibraryError,
      { status: 400 }
    );
  }

  const url = new URL("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("steamid", steamId);
  url.searchParams.set("include_appinfo", "1");
  url.searchParams.set("include_played_free_games", "1");
  url.searchParams.set("include_free_sub", "0");
  url.searchParams.set("format", "json");

  try {
    const res = await fetchWithTimeout(url.toString(), { next: { revalidate: 300 } }, STEAM_TIMEOUT_MS);
    if (!res.ok) {
      return NextResponse.json(
        {
          code: "api_error",
          message: `Steam API returned ${res.status}. Try again in a moment.`,
        } satisfies LibraryError,
        { status: 502 }
      );
    }

    const data = await res.json();
    const rawGames = data?.response?.games;

    if (!rawGames || rawGames.length === 0) {
      const playerCheck = await fetchWithTimeout(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}&format=json`,
        {},
        STEAM_TIMEOUT_MS
      );
      const playerData = await playerCheck.json();
      const player = playerData?.response?.players?.[0];

      if (!player) {
        return NextResponse.json(
          {
            code: "invalid_steam_id",
            message: "No Steam profile found for this ID.",
          } satisfies LibraryError,
          { status: 404 }
        );
      }

      if (player.communityvisibilitystate !== 3) {
        return NextResponse.json(
          {
            code: "private_profile",
            message:
              "Your Steam profile or game details are set to private. Set both to Public in Steam privacy settings.",
          } satisfies LibraryError,
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          code: "no_games",
          message: "No games found in this library. The account may have an empty library.",
        } satisfies LibraryError,
        { status: 404 }
      );
    }

    const games: SteamGame[] = rawGames.map(
      (g: {
        appid: number;
        name?: string;
        playtime_forever?: number;
        playtime_2weeks?: number;
        rtime_last_played?: number;
      }) => ({
        appid: g.appid,
        name: g.name ?? `App ${g.appid}`,
        playtimeForever: g.playtime_forever ?? 0,
        playtime2Weeks: g.playtime_2weeks,
        lastPlayed: g.rtime_last_played || undefined,
        headerImage: headerImageUrl(g.appid),
      })
    );

    games.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ games });
  } catch (error) {
    const timedOut = error instanceof FetchTimeoutError;
    return NextResponse.json(
      {
        code: "api_error",
        message: timedOut
          ? "Steam API timed out. Try again or switch to demo mode."
          : "Failed to reach the Steam API. Please try again.",
      } satisfies LibraryError,
      { status: 502 }
    );
  }
}
