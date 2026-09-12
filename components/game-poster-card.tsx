"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCompactHours, libraryCapsuleUrl } from "@/lib/format";
import type { SteamGame } from "@/types/steam";

interface GamePosterCardProps {
  game: SteamGame;
  featured?: boolean;
  onPick?: () => void;
  picking?: boolean;
  className?: string;
}

function playtimeBarWidth(minutes: number): number {
  const hours = minutes / 60;
  return Math.min(100, Math.max(8, (hours / 50) * 100));
}

export function GamePosterCard({
  game,
  featured = false,
  onPick,
  picking = false,
  className,
}: GamePosterCardProps) {
  const [src, setSrc] = useState(libraryCapsuleUrl(game.appid));

  useEffect(() => {
    setSrc(libraryCapsuleUrl(game.appid));
  }, [game.appid]);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-[#121a22] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)]",
        featured &&
          "border-sky-400/25 shadow-[0_24px_60px_-16px_rgba(56,189,248,0.45),0_0_0_1px_rgba(56,189,248,0.18)]",
        className
      )}
    >
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={src}
          alt={game.name}
          fill
          unoptimized
          sizes={featured ? "(max-width: 768px) 80vw, 280px" : "(max-width: 640px) 50vw, 220px"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          onError={() => {
            if (src !== game.headerImage) setSrc(game.headerImage);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1419] via-[#0b1419]/50 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 space-y-2.5 p-3.5 sm:p-4">
          <h3
            className={cn(
              "leading-snug font-semibold tracking-tight text-white drop-shadow-sm",
              featured ? "text-lg sm:text-xl" : "text-sm sm:text-base"
            )}
          >
            {game.name}
          </h3>

          {featured && (
            <div className="h-1 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-sky-400"
                style={{ width: `${playtimeBarWidth(game.playtimeForever)}%` }}
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] text-white/90 backdrop-blur-sm">
              <Clock className="size-3 opacity-80" />
              {formatCompactHours(game.playtimeForever)}
            </span>

            {featured && onPick && (
              <button
                type="button"
                onClick={onPick}
                disabled={picking}
                className="rounded-full bg-sky-400 px-4 py-1.5 text-sm font-semibold text-slate-950 shadow-[0_0_22px_rgba(56,189,248,0.55)] transition hover:bg-sky-300 hover:shadow-[0_0_28px_rgba(56,189,248,0.75)] disabled:opacity-60"
              >
                {picking ? "…" : "Pick"}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
