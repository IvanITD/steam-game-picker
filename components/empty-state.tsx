"use client";

import { Gamepad2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  onUseDemo: () => void;
}

export function EmptyState({ onUseDemo }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Gamepad2 className="size-7 text-muted-foreground" />
        </div>
        <div className="max-w-sm space-y-2">
          <h2 className="text-lg font-semibold">What should Ivan play?</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Connect your Steam library or try the demo to get a smart pick based on mood,
            time, and what you have not played lately — not just your most-played game.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={onUseDemo}>Try demo library</Button>
          <Button variant="outline" className="gap-2">
            <Settings className="size-4" />
            Open settings to connect Steam
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
