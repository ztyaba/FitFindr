import { useMemo, useCallback } from "react";
import { DollarSign, Star } from "lucide-react";

import MapboxMap from "@/components/maps/MapboxMap";
import { Badge } from "@/components/ui/badge";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function MapView({ professionals = [] }) {
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
        color: "#2563eb",
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
      <div className="p-3 space-y-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {professional.full_name}
          </h3>
          <p className="text-sm text-slate-600">
            {professional.location.address ||
              `${professional.location.city}, ${professional.location.state}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-900">
            {rateDisplay === "--" ? "Contact for rate" : `${rateDisplay}/hour`}
          </span>
        </div>

        {typeof professional.rating === "number" && (
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-medium text-slate-700">
              {professional.rating.toFixed(1)} rating
            </span>
          </div>
        )}

        {Array.isArray(professional.specialties) && professional.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {professional.specialties.slice(0, 3).map((specialty) => (
              <Badge key={specialty} variant="secondary" className="text-xs">
                {String(specialty).replace(/_/g, " ")}
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
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No location data available</p>
          <p className="text-sm">
            Professionals need location coordinates to appear on the map
          </p>
        </div>
      </div>
    );
  }

  return <MapboxMap markers={markers} renderPopup={renderPopup} height="24rem" />;
}
