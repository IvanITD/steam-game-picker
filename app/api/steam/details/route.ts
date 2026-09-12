import { NextRequest, NextResponse } from "next/server";

interface GameDetails {
  genres: string[];
  tags: string[];
}

export async function GET(request: NextRequest) {
  const appids = request.nextUrl.searchParams.get("appids") ?? "";
  if (!appids) {
    return NextResponse.json({});
  }

  const ids = appids.split(",").map((id) => parseInt(id, 10)).filter(Boolean);
  const result: Record<number, GameDetails> = {};

  await Promise.all(
    ids.map(async (appid) => {
      try {
        const url = `https://store.steampowered.com/api/appdetails?appids=${appid}&filters=categories,genres`;
        const res = await fetch(url, { next: { revalidate: 86400 } });
        if (!res.ok) return;

        const data = await res.json();
        const entry = data?.[appid];
        if (!entry?.success) return;

        const genres = (entry.data?.genres ?? []).map((g: { description: string }) => g.description);
        const tags = (entry.data?.categories ?? [])
          .map((c: { description: string }) => c.description)
          .slice(0, 5);

        result[appid] = { genres, tags };
      } catch {
        // skip failed lookups
      }
    })
  );

  return NextResponse.json(result);
}
