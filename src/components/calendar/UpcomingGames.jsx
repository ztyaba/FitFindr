import React from "react";
import { format, isToday, isTomorrow } from "date-fns";
import { Clock, MapPin, Users, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const SPORT_EMOJIS = {
  basketball: "🏀",
  tennis: "🎾",
  soccer: "⚽",
  volleyball: "🏐",
  badminton: "🏸",
  table_tennis: "🏓",
  squash: "🎾",
  racquetball: "🎾",
  pickleball: "🏓",
  football: "🏈",
};

export default function UpcomingGames({ games, onGameSelect }) {
  const getDateLabel = (date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-white/5 pb-6">
        <CardTitle className="text-xl font-black text-white tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
            <Zap className="w-5 h-5 text-blue-400" />
          </div>
          Scheduled Matches
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {games.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-white/5 border border-dashed border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-slate-700" />
            </div>
            <p className="text-white font-black uppercase tracking-widest text-[10px] mb-2">No Scheduled Matches</p>
            <p className="text-slate-500 text-sm font-medium">Join some matches to see them here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {games.slice(0, 5).map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onGameSelect(game)}
                className="group p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer overflow-hidden relative"
              >
                <div className="flex items-start justify-between relative z-10 gap-x-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500">
                      {SPORT_EMOJIS[game.sport] || "🏆"}
                    </div>
                    <div>
                      <div className="font-black text-white text-base tracking-tight mb-0.5 line-clamp-1">{game.title}</div>
                      <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        {game.location.venue_name}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={`border-0 rounded-full px-4 py-1.5 font-black uppercase tracking-[0.1em] text-[10px] shadow-lg ${isToday(new Date(game.date_time)) ? 'bg-rose-500/20 text-rose-300 shadow-rose-900/10' :
                        isTomorrow(new Date(game.date_time)) ? 'bg-amber-500/20 text-amber-300 shadow-amber-900/10' :
                          'bg-emerald-500/20 text-emerald-300 shadow-emerald-900/10'
                      }`}
                  >
                    {getDateLabel(new Date(game.date_time))}
                  </Badge>
                </div>

                <div className="flex items-center gap-6 mt-5 pt-5 border-t border-white/5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold uppercase tracking-widest">{format(new Date(game.date_time), "h:mm a")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-widest">{game.current_players}/{game.max_players} Players</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {games.length > 5 && (
              <div className="text-center pt-4">
                <Button variant="ghost" className="text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors">
                  View {games.length - 5} More Matches
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}