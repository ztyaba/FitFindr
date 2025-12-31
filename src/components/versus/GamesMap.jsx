import { useMemo, useCallback, forwardRef, useImperativeHandle, useRef } from "react";
import { Calendar, DollarSign, MapPin, Users } from "lucide-react";

import MapboxMap from "@/components/maps/MapboxMap";
import { Badge } from "@/components/ui/badge";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const GamesMap = forwardRef(({ games = [], height = "28rem", onViewDetails, onMarkerClick, onItemClick, isShowAllMode }, ref) => {
  const mapRef = useRef(null);

  useImperativeHandle(ref, () => ({
    zoomTo: (lat, lng) => mapRef.current?.zoomTo(lat, lng),
    showPopup: (id) => mapRef.current?.showPopup(id),
    closeAllPopups: () => mapRef.current?.closeAllPopups(),
    resetView: () => mapRef.current?.resetView(),
  }));
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
      <div className="p-4 space-y-4 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl min-w-[260px]">
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
              {sportLabel}
            </span>
          </div>
          <h3 className="text-lg font-black text-white tracking-tight leading-tight">
            {title}
          </h3>
        </div>

        <div className="space-y-2.5">
          {gameDate && !Number.isNaN(gameDate.valueOf()) && (
            <div className="flex items-center gap-3 text-slate-300">
              <div className="p-1.5 bg-white/5 rounded-lg border border-white/5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-tight">
                {dateFormatter.format(gameDate)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 text-slate-300">
            <div className="p-1.5 bg-white/5 rounded-lg border border-white/5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-tight truncate">
              {location.venue_name || "TBA"}
              {location.city ? ` • ${location.city}` : ""}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-tight">
              {currentPlayers}/{maxPlayers} players joined
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-xs font-black text-white uppercase tracking-tight">
              {costDisplay}
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onViewDetails) onViewDetails(game);
          }}
          className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20"
        >
          View Matchup Details
        </button>

        {Array.isArray(game.tags) && game.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {game.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] font-black uppercase tracking-tighter bg-white/5 text-slate-300 border-white/10"
              >
                {String(tag).replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }, [onViewDetails]);

  if (markers.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-slate-100 text-slate-600 rounded-2xl"
        style={{
          height: height === "100%" ? "100%" : height === "100vh" ? "100vh" : height,
          minHeight: height === "100%" ? "100vh" : height,
        }}
      >
        <div className="text-center px-6">
          <p className="text-lg font-medium mb-2">No games with map data</p>
          <p className="text-sm">Upcoming games need latitude and longitude to appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <MapboxMap
      ref={mapRef}
      markers={markers}
      renderPopup={renderPopup}
      height={height}
      markerColor="#22c55e"
      onMarkerClick={(marker) => {
        if (onMarkerClick) onMarkerClick(marker.game);
        if (onItemClick) onItemClick(marker.game);
      }}
      isShowAllMode={isShowAllMode}
    />
  );
});

export default GamesMap;
