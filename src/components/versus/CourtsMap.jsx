import { useMemo, useCallback } from "react";
import { DollarSign, MapPin, Star } from "lucide-react";

import MapboxMap from "@/components/maps/MapboxMap";
import { Badge } from "@/components/ui/badge";

export default function CourtsMap({ courts = [] }) {
  const markers = useMemo(
    () =>
      courts
        .filter(
          (court) =>
            court?.location &&
            typeof court.location.latitude === "number" &&
            typeof court.location.longitude === "number"
        )
        .map((court) => ({
          id: court.id,
          latitude: court.location.latitude,
          longitude: court.location.longitude,
          color: "#7c3aed",
          court,
        })),
    [courts]
  );

  const renderPopup = useCallback(({ court }) => {
    if (!court) return null;
    const location = court.location || {};
    const hourlyRate = typeof court.hourly_rate === "number" ? `$${court.hourly_rate} per hour` : "Contact for pricing";
    const sports = Array.isArray(court.sports_supported) ? court.sports_supported : [];

    return (
      <div className="p-3 space-y-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-900">{court.name}</h3>
          <p className="text-sm text-slate-600">{court.venue_name || "Community venue"}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="w-4 h-4 text-slate-400" />
            <span>
              {location.address || location.venue_name || "Location TBA"}
              {location.city || location.state
                ? ` • ${location.city || ""}${location.city && location.state ? ", " : ""}${location.state || ""}`
                : ""}
            </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>{hourlyRate}</span>
        </div>

        {typeof court.rating === "number" && (
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>{court.rating.toFixed(1)} rating</span>
          </div>
        )}

        {sports.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {sports.slice(0, 3).map((sport) => (
              <Badge key={sport} variant="secondary" className="text-xs capitalize">
                {sport.replace(/_/g, " ")}
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
          <p className="text-lg font-medium mb-2">No courts with map data</p>
          <p className="text-sm">Venues need latitude and longitude to appear here.</p>
        </div>
      </div>
    );
  }

  return <MapboxMap markers={markers} renderPopup={renderPopup} height="28rem" markerColor="#7c3aed" />;
}
