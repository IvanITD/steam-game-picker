"use client";

import { AlertCircle, Lock, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { LibraryError } from "@/types/steam";

interface ErrorAlertProps {
  error: LibraryError;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  const Icon =
    error.code === "private_profile" || error.code === "missing_api_key"
      ? Lock
      : error.code === "network_error" || error.code === "api_error"
        ? WifiOff
        : AlertCircle;

  const titles: Record<LibraryError["code"], string> = {
    invalid_steam_id: "Invalid Steam ID",
    private_profile: "Profile is private",
    missing_api_key: "API key required",
    api_error: "Steam API unavailable",
    no_games: "No games found",
    network_error: "Connection error",
  };

  return (
    <Alert variant="destructive">
      <Icon className="size-4" />
      <AlertTitle>{titles[error.code]}</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
}
