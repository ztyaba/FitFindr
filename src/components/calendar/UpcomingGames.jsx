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
    <Card className="shadow-md border-0">
      <CardHeader>
        <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-600" />
          Upcoming Games
        </CardTitle>
      </CardHeader>
      <CardContent>
        {games.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 text-sm">No upcoming games</p>
            <p className="text-slate-500 text-xs mt-1">Join some games to see them here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {games.slice(0, 5).map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onGameSelect(game)}
                className="p-3 border border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50/50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{SPORT_EMOJIS[game.sport]}</span>
                    <div>
                      <div className="font-medium text-slate-900 text-sm">{game.title}</div>
                      <div className="text-slate-600 text-xs">{game.location.venue_name}</div>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      isToday(new Date(game.date_time)) ? 'bg-red-100 text-red-800' :
                      isTomorrow(new Date(game.date_time)) ? 'bg-yellow-100 text-yellow-800' :
                      'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {getDateLabel(new Date(game.date_time))}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(game.date_time), "h:mm a")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {game.current_players}/{game.max_players}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {games.length > 5 && (
              <div className="text-center pt-2">
                <span className="text-sm text-slate-500">+{games.length - 5} more games</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}