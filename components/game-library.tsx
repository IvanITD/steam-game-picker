"use client";

import { GamePosterCard } from "@/components/game-poster-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SteamGame } from "@/types/steam";

interface GameLibraryProps {
  games: SteamGame[];
  loading: boolean;
}

export function GameLibrary({ games, loading }: GameLibraryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No games to show. Load a library or adjust your filters.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {games.map((game) => (
        <GamePosterCard key={game.appid} game={game} />
      ))}
    </div>
  );
}
