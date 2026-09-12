"use client";

import { ExternalLink, Shuffle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { GamePosterCard } from "@/components/game-poster-card";
import { formatLastPlayed, formatPlaytime } from "@/lib/format";
import type { PickResult, SteamGame } from "@/types/steam";

const CATEGORY_LABELS: Record<PickResult["category"], string> = {
  "never-played": "Backlog pick",
  "neglected-favorite": "Neglected favorite",
  "recently-enjoyed": "Recently enjoyed",
  "comfort-pick": "Comfort pick",
  "backlog-gem": "Library gem",
};

interface PickResultCardProps {
  result: PickResult | null;
  previewGames: SteamGame[];
  onPick: () => void;
  onShuffle: () => void;
  picking: boolean;
  hasGames: boolean;
}

export function PickResultCard({
  result,
  previewGames,
  onPick,
  onShuffle,
  picking,
  hasGames,
}: PickResultCardProps) {
  const center = result?.game ?? previewGames[0];
  const others = previewGames.filter((g) => g.appid !== center?.appid);
  const left = others[0];
  const right = others[1];

  return (
    <div className="space-y-6">
      {center && (
        <div className="relative mx-auto w-full max-w-xl pt-4 sm:pt-8">
          {left && (
            <div className="pointer-events-none absolute bottom-3 left-0 hidden w-[40%] origin-bottom -rotate-[10deg] scale-[0.9] opacity-65 sm:block">
              <GamePosterCard game={left} />
            </div>
          )}
          {right && (
            <div className="pointer-events-none absolute bottom-3 right-0 hidden w-[40%] origin-bottom rotate-[10deg] scale-[0.9] opacity-65 sm:block">
              <GamePosterCard game={right} />
            </div>
          )}
          <div
            className={cn(
              "relative z-10 mx-auto w-[82%] max-w-[260px] transition duration-300 sm:w-[50%]",
              picking && "scale-[0.97] opacity-80"
            )}
          >
            <GamePosterCard
              game={center}
              featured
              onPick={onPick}
              picking={picking}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        {!center && (
          <Button
            size="lg"
            className="flex-1 gap-2 sm:flex-none"
            onClick={onPick}
            disabled={picking || !hasGames}
          >
            {picking ? "Picking…" : "Pick a game"}
          </Button>
        )}
        <Button
          size="lg"
          variant="secondary"
          className="gap-2 sm:w-auto"
          onClick={onShuffle}
          disabled={picking || !hasGames}
        >
          <Shuffle className="size-5" />
          Shuffle
        </Button>
      </div>

      {!hasGames && (
        <p className="text-muted-foreground text-center text-sm">
          No games match your current filters. Try relaxing them.
        </p>
      )}

      {result && (
        <div className="space-y-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Badge variant="secondary">{CATEGORY_LABELS[result.category]}</Badge>
            {result.game.playtimeForever > 0 && (
              <span className="text-muted-foreground text-sm">
                {formatPlaytime(result.game.playtimeForever)}
                {result.game.lastPlayed
                  ? ` · Last played ${formatLastPlayed(result.game.lastPlayed)}`
                  : ""}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">{result.reason}</p>
          {(result.game.genres?.length ?? 0) > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {result.game.genres!.map((g) => (
                <Badge key={g} variant="outline" className="text-xs">
                  {g}
                </Badge>
              ))}
            </div>
          )}
          <a
            href={`https://store.steampowered.com/app/${result.game.appid}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
          >
            <ExternalLink className="size-4" />
            View on Steam
          </a>
        </div>
      )}
    </div>
  );
}
