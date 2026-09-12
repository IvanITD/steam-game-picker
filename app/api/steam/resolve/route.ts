import { NextRequest, NextResponse } from "next/server";
import type { LibraryError } from "@/types/steam";
import { FetchTimeoutError, fetchWithTimeout } from "@/lib/fetch-with-timeout";

const STEAM_TIMEOUT_MS = 15_000;

export async function GET(request: NextRequest) {
  const vanityUrl = request.nextUrl.searchParams.get("vanityUrl") ?? "";
  const apiKey = request.nextUrl.searchParams.get("apiKey") ?? "";

  if (!vanityUrl) {
    return NextResponse.json(
      {
        code: "invalid_steam_id",
        message: "Enter a vanity URL or custom URL name.",
      } satisfies LibraryError,
      { status: 400 }
    );
  }

  if (!apiKey) {
    return NextResponse.json(
      {
        code: "missing_api_key",
        message: "An API key is required to resolve vanity URLs.",
      } satisfies LibraryError,
      { status: 400 }
    );
  }

  const url = new URL("https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("vanityurl", vanityUrl);
  url.searchParams.set("format", "json");

  try {
    const res = await fetchWithTimeout(url.toString(), {}, STEAM_TIMEOUT_MS);
    const data = await res.json();

    if (data?.response?.success !== 1) {
      return NextResponse.json(
        {
          code: "invalid_steam_id",
          message: `Could not find a Steam profile for "${vanityUrl}".`,
        } satisfies LibraryError,
        { status: 404 }
      );
    }

    return NextResponse.json({ steamId: data.response.steamid });
  } catch (error) {
    const timedOut = error instanceof FetchTimeoutError;
    return NextResponse.json(
      {
        code: "api_error",
        message: timedOut
          ? "Steam API timed out while resolving your profile."
          : "Failed to resolve vanity URL.",
      } satisfies LibraryError,
      { status: 502 }
    );
  }
}
