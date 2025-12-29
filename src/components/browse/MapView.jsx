import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import { DollarSign, Star } from "lucide-react";

import MapboxMap from "@/components/maps/MapboxMap";
import { Badge } from "@/components/ui/badge";
import MapViewCard from "./MapViewCard";
import { getProfessionalColor } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function MapView({ professionals = [], onViewportChange, onZoomToProfessional, onShowAllReady, selectedProfessional: externalSelected, onCloseCard, isShowAllMode = false }) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/99b4f91f-a089-4227-b05d-f4392b5d7598', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MapView.jsx:14', message: 'MapView component mounted', data: { professionalsCount: professionals?.length || 0, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
  // #endregion

  // State for selected professional in map view
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const mapRef = useRef(null);

  // Use external selected professional if provided (from grid click)
  const activeProfessional = externalSelected || selectedProfessional;

  // Auto-expand card when set externally (from grid click)
  useEffect(() => {
    if (externalSelected) {
      // Card will be expanded via initialExpanded prop
      setSelectedProfessional(externalSelected);
    }
  }, [externalSelected]);
  const validProfessionals = useMemo(
    () =>
      professionals.filter(
        (professional) =>
          professional?.location &&
          typeof professional.location.latitude === "number" &&
          typeof professional.location.longitude === "number"
      ),
    [professionals]
  );

  const markers = useMemo(
    () =>
      validProfessionals.map((professional) => ({
        id: professional.id,
        latitude: professional.location.latitude,
        longitude: professional.location.longitude,
        color: getProfessionalColor(professional.id),
        professional,
      })),
    [validProfessionals]
  );

  const renderPopup = useCallback(({ professional }) => {
    if (!professional) return null;

    const rateDisplay =
      typeof professional.hourly_rate === "number"
        ? currencyFormatter.format(professional.hourly_rate)
        : "--";

    return (
      <div className="p-4 space-y-4 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl min-w-[240px]">
        <div>
          <h3 className="text-lg font-extrabold text-white tracking-tight mb-1">
            {professional.full_name}
          </h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {professional.location.address ||
              `${professional.location.city}, ${professional.location.state}`}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600/20 rounded-lg">
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-extrabold text-white">
              {rateDisplay === "--" ? "Contact" : `${rateDisplay}/hr`}
            </span>
          </div>

          {typeof professional.rating === "number" && (
            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-black text-white">
                {professional.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {Array.isArray(professional.specialties) && professional.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {professional.specialties.slice(0, 3).map((specialty) => (
              <Badge
                key={specialty}
                variant="secondary"
                className="text-[10px] font-bold uppercase tracking-tighter bg-white/5 text-slate-300 border-white/10"
              >
                {String(specialty).replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }, []);

  // Handle marker click - show card with fade-in animation
  const handleMarkerClick = useCallback((markerData) => {
    const professional = markerData.professional;
    if (professional) {
      setSelectedProfessional(professional);
    }
  }, []);

  // Expose zoom function to parent
  useEffect(() => {
    if (onZoomToProfessional) {
      // Store map reference for external zoom calls
      onZoomToProfessional.current = (professional) => {
        if (professional?.location?.latitude && professional?.location?.longitude && mapRef.current) {
          // Zoom to professional location
          mapRef.current.zoomTo(
            professional.location.latitude,
            professional.location.longitude
          );
          // Show the professional card
          setSelectedProfessional(professional);
        }
      };
    }
  }, [onZoomToProfessional]);

  // Expose showAll function to parent
  useEffect(() => {
    if (onShowAllReady && mapRef.current) {
      onShowAllReady.current = () => {
        if (mapRef.current && markers.length > 0) {
          mapRef.current.showAll(markers);
        }
      };
    }
  }, [onShowAllReady, markers]);

  // Always render the map, even if no markers
  // The map will show the default view
  return (
    <div
      className="relative w-full h-full"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        backgroundColor: '#0f172a', // Dark background while map loads
        position: 'relative'
      }}
    >
      <MapboxMap
        ref={mapRef}
        markers={markers}
        renderPopup={renderPopup}
        height="100%" // Use 100% to fill parent container
        onMarkerClick={handleMarkerClick}
        onViewportChange={onViewportChange}
      />

      {/* Floating card that fades in when professional is selected (only when not in show all mode) */}
      {activeProfessional && !isShowAllMode && (
        <MapViewCard
          professional={activeProfessional}
          onClose={() => {
            if (externalSelected && onCloseCard) {
              onCloseCard();
            } else {
              setSelectedProfessional(null);
            }
          }}
          initialExpanded={!!externalSelected}
        />
      )}

      {/* Show message overlay if no markers but still show map */}
      {markers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl px-8 py-6 shadow-2xl border border-white/10 pointer-events-auto">
            <p className="text-sm font-bold text-white tracking-tight">
              No professionals in this area
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
