"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Gamepad2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SettingsDialog } from "@/components/settings-dialog";
import { FiltersPanel } from "@/components/filters-panel";
import { PickResultCard } from "@/components/pick-result";
import { GameLibrary } from "@/components/game-library";
import { EmptyState } from "@/components/empty-state";
import { ErrorAlert } from "@/components/error-alert";
import { getMockLibrary } from "@/lib/mock-library";
import {
  filterGamesForDisplay,
  getAvailableGenres,
  pickGame,
} from "@/lib/game-picker";
import { enrichGamesWithGenres, fetchLibrary } from "@/lib/steam-client";
import {
  DEFAULT_FILTERS,
  DEFAULT_SETTINGS,
  loadFilters,
  loadSettings,
  saveFilters,
  saveSettings,
} from "@/lib/storage";
import type {
  GameFilters,
  LibraryError,
  LibraryLoadState,
  PickResult,
  SteamGame,
  UserSettings,
} from "@/types/steam";

export default function HomePage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [filters, setFilters] = useState<GameFilters>(DEFAULT_FILTERS);
  const [games, setGames] = useState<SteamGame[]>(() => getMockLibrary());
  const [loadState, setLoadState] = useState<LibraryLoadState>("success");
  const [error, setError] = useState<LibraryError | null>(null);
  const [pick, setPick] = useState<PickResult | null>(null);
  const [picking, setPicking] = useState(false);
  const [recentPicks, setRecentPicks] = useState<number[]>([]);
  const loadIdRef = useRef(0);
  const initializedRef = useRef(false);

  const loadLibrary = useCallback(async (s: UserSettings) => {
    const loadId = ++loadIdRef.current;
    setError(null);
    setPick(null);
    setRecentPicks([]);

    if (s.useDemoMode) {
      setGames(getMockLibrary());
      setLoadState("success");
      return;
    }

    setLoadState("loading");

    try {
      const result = await fetchLibrary(s.steamId, s.apiKey);
      if (loadId !== loadIdRef.current) return;

      if ("error" in result) {
        setError(result.error);
        setGames([]);
        setLoadState("error");
        return;
      }

      setGames(result.games);
      setLoadState("success");

      // Enrich genres in the background — don't block the library from showing.
      enrichGamesWithGenres(result.games).then((enriched) => {
        if (loadId === loadIdRef.current) {
          setGames(enriched);
        }
      });
    } catch {
      if (loadId !== loadIdRef.current) return;
      setError({
        code: "network_error",
        message: "Something went wrong loading your library. Please try again.",
      });
      setGames([]);
      setLoadState("error");
    }
  }, []);

  // Read saved settings once after mount, then load the appropriate library.
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const savedSettings = loadSettings();
    const savedFilters = loadFilters();
    setSettings(savedSettings);
    setFilters(savedFilters);
    void loadLibrary(savedSettings);
  }, [loadLibrary]);

  const handleSaveSettings = (next: UserSettings) => {
    setSettings(next);
    saveSettings(next);
    void loadLibrary(next);
  };

  const handleFiltersChange = (next: GameFilters) => {
    setFilters(next);
    saveFilters(next);
    setPick(null);
  };

  const matchingGames = useMemo(
    () => filterGamesForDisplay(games, filters),
    [games, filters]
  );

  const availableGenres = useMemo(() => getAvailableGenres(games), [games]);

  const handlePick = (shuffle = false) => {
    setPicking(true);
    const exclude = shuffle ? recentPicks : [];
    const result = pickGame(games, filters, exclude);

    if (result) {
      setPick(result);
      setRecentPicks((prev) => {
        const next = [result.game.appid, ...prev.filter((id) => id !== result.game.appid)];
        return next.slice(0, 5);
      });
    } else {
      setPick(null);
    }

    setTimeout(() => setPicking(false), 300);
  };

  const handleUseDemo = () => {
    handleSaveSettings({ ...settings, useDemoMode: true });
  };

  const showEmpty =
    loadState === "success" && games.length === 0 && !settings.useDemoMode;

  return (
    <div className="banner-stage min-h-full">
      <header className="border-b border-white/5 bg-[#0b1419]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Gamepad2 className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">Steam Game Picker</h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Hey Ivan — let&apos;s find something great to play right now.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {settings.useDemoMode && (
              <Badge variant="secondary" className="hidden sm:inline-flex">Demo</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadLibrary(settings)}
              disabled={loadState === "loading"}
              className="gap-2"
            >
              <RefreshCw className={`size-4 ${loadState === "loading" ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <SettingsDialog settings={settings} onSave={handleSaveSettings} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {error && <div className="mb-6"><ErrorAlert error={error} /></div>}

        {showEmpty && <EmptyState onUseDemo={handleUseDemo} />}

        {!showEmpty && (
          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            <aside className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-card/80 p-5 backdrop-blur-sm">
                <h2 className="mb-4 font-semibold">Filters & mood</h2>
                <FiltersPanel
                  filters={filters}
                  availableGenres={availableGenres}
                  matchingCount={matchingGames.length}
                  onChange={handleFiltersChange}
                />
              </div>
            </aside>

            <div className="space-y-6">
              <section className="overflow-visible rounded-2xl border border-white/10 bg-[#0b1419]/70 p-5 pt-8 sm:p-8">
                <PickResultCard
                  result={pick}
                  previewGames={matchingGames}
                  onPick={() => handlePick(false)}
                  onShuffle={() => handlePick(true)}
                  picking={picking}
                  hasGames={matchingGames.length > 0}
                />
              </section>

              <Separator />

              <section>
                <Tabs defaultValue="matching">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-semibold">Your library</h2>
                    <TabsList>
                      <TabsTrigger value="matching">
                        Matching ({matchingGames.length})
                      </TabsTrigger>
                      <TabsTrigger value="all">
                        All ({games.length})
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="matching">
                    <GameLibrary games={matchingGames} loading={loadState === "loading"} />
                  </TabsContent>
                  <TabsContent value="all">
                    <GameLibrary games={games} loading={loadState === "loading"} />
                  </TabsContent>
                </Tabs>
              </section>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t py-6 text-center">
        <p className="text-muted-foreground text-xs">
          Uses official Steam Web API &amp; public store data only. No client automation.
        </p>
      </footer>
    </div>
  );
}
