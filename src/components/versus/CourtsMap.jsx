import { useMemo, useCallback, forwardRef, useImperativeHandle, useRef } from "react";
import { DollarSign, MapPin, Star } from "lucide-react";

import MapboxMap from "@/components/maps/MapboxMap";
import { Badge } from "@/components/ui/badge";

const CourtsMap = forwardRef(({ courts = [], height = "28rem", onViewDetails, onMarkerClick, isShowAllMode }, ref) => {
  const mapRef = useRef(null);

  useImperativeHandle(ref, () => ({
    zoomTo: (lat, lng) => mapRef.current?.zoomTo(lat, lng),
    showPopup: (id) => mapRef.current?.showPopup(id),
    closeAllPopups: () => mapRef.current?.closeAllPopups(),
    resetView: () => mapRef.current?.resetView(),
  }));
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
      <div className="p-4 space-y-4 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl min-w-[260px]">
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">
              {court.venue_type || "Court"}
            </span>
          </div>
          <h3 className="text-lg font-black text-white tracking-tight leading-tight">
            {court.name}
          </h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
            {court.venue_name || "Premium Venue"}
          </p>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-slate-300">
            <div className="p-1.5 bg-white/5 rounded-lg border border-white/5">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-tight truncate">
              {location.address || "Location TBA"}
              {location.city ? ` • ${location.city}` : ""}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-xs font-black text-white uppercase tracking-tight">
              {hourlyRate}
            </span>
          </div>

          {typeof court.rating === "number" && (
            <div className="flex items-center gap-3 text-slate-300">
              <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-tight">
                {court.rating.toFixed(1)} Facility Rating
              </span>
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onViewDetails) onViewDetails(court);
          }}
          className="w-full h-10 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-purple-600/20"
        >
          View Venue Details
        </button>

        {sports.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {sports.slice(0, 3).map((sport) => (
              <Badge
                key={sport}
                variant="secondary"
                className="text-[10px] font-black uppercase tracking-tighter bg-white/5 text-slate-300 border-white/10 capitalize"
              >
                {sport.replace(/_/g, " ")}
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
          <p className="text-lg font-medium mb-2">No courts with map data</p>
          <p className="text-sm">Venues need latitude and longitude to appear here.</p>
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
      markerColor="#7c3aed"
      onMarkerClick={onMarkerClick}
      isShowAllMode={isShowAllMode}
    />
  );
});

export default CourtsMap;
