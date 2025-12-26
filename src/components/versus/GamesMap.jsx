import { useMemo, useCallback } from "react";
import { Calendar, DollarSign, MapPin, Users } from "lucide-react";

import MapboxMap from "@/components/maps/MapboxMap";
import { Badge } from "@/components/ui/badge";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default function GamesMap({ games = [] }) {
  const markers = useMemo(
    () =>
      games
        .filter(
          (game) =>
            game?.location &&
            typeof game.location.latitude === "number" &&
            typeof game.location.longitude === "number"
        )
        .map((game) => ({
          id: game.id,
          latitude: game.location.latitude,
          longitude: game.location.longitude,
          color: "#22c55e",
          game,
        })),
    [games]
  );

  const renderPopup = useCallback(({ game }) => {
    if (!game) return null;
    const gameDate = game.date_time ? new Date(game.date_time) : null;
    const sportLabel = game.sport ? game.sport.replace(/_/g, " ") : "Pickup game";
    const location = game.location || {};
    const maxPlayers = typeof game.max_players === "number" ? game.max_players : "--";
    const currentPlayers = typeof game.current_players === "number" ? game.current_players : 0;
    const costDisplay =
      typeof game.cost_per_person === "number" && game.cost_per_person > 0
        ? `$${game.cost_per_person} per player`
        : "Free to join";

    const title = game.title || "Pickup game";

    return (
      <div className="p-3 space-y-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <div className="text-sm text-slate-600 capitalize">{sportLabel}</div>
        </div>

        {gameDate && !Number.isNaN(gameDate.valueOf()) && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{dateFormatter.format(gameDate)}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="w-4 h-4 text-slate-400" />
            <span>
              {location.venue_name || "TBA"}
              {location.city || location.state
                ? ` • ${location.city || ""}${location.city && location.state ? ", " : ""}${location.state || ""}`
                : ""}
            </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Users className="w-4 h-4 text-slate-400" />
          <span>
            {currentPlayers}/{maxPlayers} players
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>{costDisplay}</span>
        </div>

        {Array.isArray(game.tags) && game.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {game.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {String(tag).replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }, []);

  if (markers.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-slate-100 text-slate-600 rounded-2xl">
        <div className="text-center px-6">
          <p className="text-lg font-medium mb-2">No games with map data</p>
          <p className="text-sm">Upcoming games need latitude and longitude to appear here.</p>
        </div>
      </div>
    );
  }

  return <MapboxMap markers={markers} renderPopup={renderPopup} height="28rem" markerColor="#22c55e" />;
}
