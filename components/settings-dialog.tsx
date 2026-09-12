"use client";

import { useState } from "react";
import { Settings, KeyRound, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { UserSettings } from "@/types/steam";
import { resolveVanityUrl } from "@/lib/steam-client";

interface SettingsDialogProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

export function SettingsDialog({ settings, onSave }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<UserSettings>(settings);
  const [vanityUrl, setVanityUrl] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  function openDialog() {
    setDraft(settings);
    setResolveError(null);
    setOpen(true);
  }

  async function handleResolveVanity() {
    if (!vanityUrl.trim() || !draft.apiKey) {
      setResolveError("Enter a vanity URL and API key first.");
      return;
    }
    setResolving(true);
    setResolveError(null);
    const result = await resolveVanityUrl(vanityUrl.trim(), draft.apiKey);
    setResolving(false);
    if ("error" in result) {
      setResolveError(result.error.message);
      return;
    }
    setDraft((d) => ({ ...d, steamId: result.steamId }));
  }

  function handleSave() {
    onSave(draft);
    setOpen(false);
  }

  return (
    <>
      <Button variant="outline" size="sm" className="gap-2" onClick={openDialog}>
        <Settings className="size-4" />
        <span className="hidden sm:inline">Settings</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Steam connection</DialogTitle>
            <DialogDescription>
              Your Steam ID and API key are stored only in this browser. We use official
              Steam Web API endpoints — no client automation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Checkbox
                id="demo-mode"
                checked={draft.useDemoMode}
                onCheckedChange={(checked) =>
                  setDraft((d) => ({ ...d, useDemoMode: checked === true }))
                }
              />
              <Label htmlFor="demo-mode" className="cursor-pointer text-sm leading-snug">
                Use demo library (no credentials needed)
              </Label>
            </div>

            {!draft.useDemoMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="steam-id" className="flex items-center gap-2">
                    <User className="size-4" />
                    Steam ID64
                  </Label>
                  <Input
                    id="steam-id"
                    placeholder="76561198000000000"
                    value={draft.steamId}
                    onChange={(e) => setDraft((d) => ({ ...d, steamId: e.target.value.trim() }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Or resolve vanity URL</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="your-steam-username"
                      value={vanityUrl}
                      onChange={(e) => setVanityUrl(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleResolveVanity}
                      disabled={resolving}
                    >
                      {resolving ? "…" : "Resolve"}
                    </Button>
                  </div>
                  {resolveError && (
                    <p className="text-destructive text-xs">{resolveError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key" className="flex items-center gap-2">
                    <KeyRound className="size-4" />
                    Steam Web API key
                  </Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="From steamcommunity.com/dev/apikey"
                    value={draft.apiKey}
                    onChange={(e) => setDraft((d) => ({ ...d, apiKey: e.target.value.trim() }))}
                  />
                </div>

                <Alert>
                  <AlertDescription className="text-xs">
                    Set your Steam profile and Game details to <strong>Public</strong> in
                    privacy settings so GetOwnedGames can read your library.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
