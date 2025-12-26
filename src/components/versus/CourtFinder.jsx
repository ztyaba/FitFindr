import { motion } from "framer-motion";
import { MapPin, Star, DollarSign, Clock, Phone, Globe, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SPORT_COLORS = {
  basketball: "bg-blue-100 text-blue-800",
  tennis: "bg-green-100 text-green-800",
  volleyball: "bg-purple-100 text-purple-800",
  badminton: "bg-yellow-100 text-yellow-800",
  table_tennis: "bg-red-100 text-red-800",
  squash: "bg-cyan-100 text-cyan-800",
  racquetball: "bg-indigo-100 text-indigo-800",
  pickleball: "bg-pink-100 text-pink-800",
  multi_sport: "bg-gray-100 text-gray-800",
};

export default function CourtFinder({ courts = [] }) {
  const handleContact = (method, value) => {
    switch (method) {
      case "phone":
        window.open(`tel:${value}`);
        break;
      case "email":
        window.open(`mailto:${value}`);
        break;
      case "website":
        window.open(value, "_blank");
        break;
    }
  };

  if (courts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No courts found</h3>
        <p className="text-slate-600">Try adjusting your search or check back later for new venues.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courts.map((court, index) => {
        const supportedSports = Array.isArray(court.sports_supported) ? court.sports_supported : [];

        return (
          <motion.div
            key={court.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
          <Card className="h-full bg-white hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-lg text-slate-900">{court.name}</CardTitle>
                {typeof court.rating === "number" && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{court.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="text-slate-600 font-medium">{court.venue_name}</div>

              <div className="flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="w-4 h-4" />
                {court.location.city}, {court.location.state}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">Available Sports</div>
                <div className="flex flex-wrap gap-1">
                  {supportedSports.slice(0, 3).map((sport) => (
                    <Badge
                      key={sport}
                      variant="secondary"
                      className={`text-xs ${SPORT_COLORS[sport] || "bg-gray-100 text-gray-800"}`}
                    >
                      {sport.replace(/_/g, " ")}
                    </Badge>
                  ))}
                  {supportedSports.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{supportedSports.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-900">${court.hourly_rate}</span>
                <span className="text-slate-600 text-sm">/hour</span>
              </div>

              <div className="space-y-2 text-sm">
                {court.indoor !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${court.indoor ? "bg-blue-500" : "bg-green-500"}`} />
                    <span className="text-slate-600">{court.indoor ? "Indoor" : "Outdoor"}</span>
                  </div>
                )}
                {court.court_surface && (
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 capitalize">{court.court_surface} surface</span>
                  </div>
                )}
                {court.hours_of_operation && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{court.hours_of_operation}</span>
                  </div>
                )}
              </div>

              {Array.isArray(court.amenities) && court.amenities.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-slate-700 mb-1">Amenities</div>
                  <div className="text-sm text-slate-600">
                    {court.amenities.slice(0, 3).join(" • ")}
                    {court.amenities.length > 3 && "..."}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                {court.contact_info?.phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContact("phone", court.contact_info.phone)}
                    className="flex-1"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </Button>
                )}
                {court.contact_info?.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContact("website", court.contact_info.website)}
                    className="flex-1"
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    Visit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        );
      })}
    </div>
  );
}
