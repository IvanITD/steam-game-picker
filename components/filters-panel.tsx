"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { GameFilters, Mood, PlaytimeBucket, TimeAvailable } from "@/types/steam";

interface FiltersPanelProps {
  filters: GameFilters;
  availableGenres: string[];
  matchingCount: number;
  onChange: (filters: GameFilters) => void;
}

const MOODS: { value: Mood; label: string; hint: string }[] = [
  { value: "balanced", label: "Balanced", hint: "Mix of backlog, favorites, and recent" },
  { value: "quick", label: "Quick session", hint: "Shorter, lighter games" },
  { value: "deep", label: "Deep dive", hint: "Longer RPGs and story games" },
  { value: "something-new", label: "Something new", hint: "Never-played titles" },
  { value: "comfort", label: "Comfort pick", hint: "Recently enjoyed favorites" },
  { value: "revisit", label: "Revisit", hint: "Neglected games you loved" },
];

export function FiltersPanel({
  filters,
  availableGenres,
  matchingCount,
  onChange,
}: FiltersPanelProps) {
  function update<K extends keyof GameFilters>(key: K, value: GameFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  function toggleGenre(genre: string) {
    const next = filters.genres.includes(genre)
      ? filters.genres.filter((g) => g !== genre)
      : [...filters.genres, genre];
    update("genres", next);
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className="mb-2 block text-sm font-medium">Mood</Label>
        <Select
          value={filters.mood}
          onValueChange={(v) => update("mood", v as Mood)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MOODS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                <span>{m.label}</span>
                <span className="text-muted-foreground ml-2 text-xs">— {m.hint}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block text-sm font-medium">Time available</Label>
        <Select
          value={filters.timeAvailable}
          onValueChange={(v) => update("timeAvailable", v as TimeAvailable)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any length</SelectItem>
            <SelectItem value="15min">~15 minutes</SelectItem>
            <SelectItem value="30min">~30 minutes</SelectItem>
            <SelectItem value="1hour">~1 hour</SelectItem>
            <SelectItem value="2hours-plus">2+ hours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block text-sm font-medium">Playtime</Label>
        <Select
          value={filters.playtimeBucket}
          onValueChange={(v) => update("playtimeBucket", v as PlaytimeBucket)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any playtime</SelectItem>
            <SelectItem value="never">Never played</SelectItem>
            <SelectItem value="under1h">Under 1 hour</SelectItem>
            <SelectItem value="1to10h">1 – 10 hours</SelectItem>
            <SelectItem value="10to50h">10 – 50 hours</SelectItem>
            <SelectItem value="over50h">50+ hours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <Checkbox
          id="never-only"
          checked={filters.neverPlayedOnly}
          onCheckedChange={(checked) => update("neverPlayedOnly", checked === true)}
        />
        <Label htmlFor="never-only" className="cursor-pointer text-sm">
          Only never-played games
        </Label>
      </div>

      <div>
        <Label className="mb-3 block text-sm font-medium">
          Not played in at least{" "}
          {filters.notPlayedInDays === null ? "—" : `${filters.notPlayedInDays} days`}
        </Label>
        <Slider
          min={0}
          max={365}
          step={7}
          value={[filters.notPlayedInDays ?? 0]}
          onValueChange={(v) => {
            const val = Array.isArray(v) ? v[0] : v;
            update("notPlayedInDays", val === 0 ? null : val);
          }}
        />
        <p className="text-muted-foreground mt-1 text-xs">
          Slide to 0 to disable this filter
        </p>
      </div>

      {availableGenres.length > 0 && (
        <div>
          <Label className="mb-2 block text-sm font-medium">Genres</Label>
          <div className="flex flex-wrap gap-2">
            {availableGenres.map((genre) => {
              const active = filters.genres.includes(genre);
              return (
                <Badge
                  key={genre}
                  variant={active ? "default" : "outline"}
                  className="cursor-pointer select-none"
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-muted-foreground text-sm">
        <span className="font-medium text-foreground">{matchingCount}</span> games match
        your filters
      </p>
    </div>
  );
}
