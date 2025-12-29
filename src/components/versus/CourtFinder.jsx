import { motion } from "framer-motion";
import { MapPin, Star, DollarSign, Clock, Phone, Globe, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SPORT_COLORS = {
  basketball: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  tennis: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  volleyball: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  badminton: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  table_tennis: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  squash: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  racquetball: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  pickleball: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  multi_sport: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function CourtFinder({ courts = [], onHover, onHoverExit }) {
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
      <div className="flex flex-col items-center justify-center text-center py-32 px-10 text-slate-300 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
        <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center mb-6">
          <MapPin className="w-10 h-10 text-blue-400 opacity-50" />
        </div>
        <h3 className="text-2xl font-black text-white mb-2">No venues discovered</h3>
        <p className="text-slate-400 font-medium max-w-sm">Try expanding your search radius or checking back soon.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {courts.map((court, index) => {
        const supportedSports = Array.isArray(court.sports_supported) ? court.sports_supported : [];

        return (
          <motion.div
            key={court.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onMouseEnter={(e) => onHover?.(court, e.currentTarget.getBoundingClientRect())}
            onMouseLeave={() => onHoverExit?.()}
          >
            <Card className="h-full bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden group hover:bg-slate-900/60 transition-all duration-500 shadow-2xl">
              <div className="relative h-48 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-900/60 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-6 right-6 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm font-black text-white">{court.rating?.toFixed(1) || "4.9"}</span>
                </div>
                {court.indoor !== undefined && (
                  <div className="absolute top-6 left-6 bg-blue-600/90 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-black text-white uppercase tracking-widest">
                    {court.indoor ? "Indoor" : "Outdoor"}
                  </div>
                )}
              </div>

              <CardHeader className="p-8 pb-4">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <CardTitle className="text-2xl font-black text-white tracking-tight group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                    {court.name}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  {court.location?.city || "Unknown"}, {court.location?.state || "Unknown"}
                </div>
              </CardHeader>

              <CardContent className="p-8 pt-0 space-y-8">
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Available Arenas</div>
                  <div className="flex flex-wrap gap-2">
                    {supportedSports.slice(0, 3).map((sport) => (
                      <Badge
                        key={sport}
                        className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${SPORT_COLORS[sport] || "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}
                      >
                        {sport.replace(/_/g, " ")}
                      </Badge>
                    ))}
                    {supportedSports.length > 3 && (
                      <Badge variant="outline" className="px-3 py-1 rounded-xl text-[10px] font-black text-slate-500 uppercase border-white/5">
                        +{supportedSports.length - 3} MORE
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-6 border-y border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xl font-black text-white tracking-tight">${court.hourly_rate || court.rate_per_hour}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">hourly rate</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      {court.hours_of_operation || "6AM - 11PM"}
                    </div>
                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Open Now</div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  {court.contact_info?.phone && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleContact("phone", court.contact_info.phone)}
                      className="flex-1 h-14 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-xs tracking-widest group/btn"
                    >
                      <Phone className="w-4 h-4 mr-2 text-blue-400 group-hover/btn:scale-110 transition-transform" />
                      Contact
                    </Button>
                  )}
                  {court.contact_info?.website && (
                    <Button
                      size="lg"
                      onClick={() => handleContact("website", court.contact_info.website)}
                      className="flex-1 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Book Now
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
