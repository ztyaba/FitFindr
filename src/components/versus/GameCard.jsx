import React from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, DollarSign, Zap, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";

const SPORT_COLORS = {
  basketball: "bg-blue-100 text-blue-800",
  tennis: "bg-green-100 text-green-800",
  soccer: "bg-blue-100 text-blue-800",
  volleyball: "bg-purple-100 text-purple-800",
  badminton: "bg-yellow-100 text-yellow-800",
  table_tennis: "bg-red-100 text-red-800",
  squash: "bg-cyan-100 text-cyan-800",
  racquetball: "bg-indigo-100 text-indigo-800",
  pickleball: "bg-pink-100 text-pink-800",
  football: "bg-gray-100 text-gray-800",
};

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

export default function GameCard({ game, index, onJoin }) {
  const handleJoinGame = async () => {
    if (game.current_players >= game.max_players) return;
    console.log("Joining game:", game.id);
    onJoin();
  };

  const isGameFull = game.current_players >= game.max_players;
  const spotsLeft = game.max_players - game.current_players;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Card className="h-full bg-slate-900/50 backdrop-blur-xl border border-white/5 hover:border-blue-500/30 transition-all duration-500 shadow-xl hover:shadow-[0_20px_50px_-12px_rgba(59,130,246,0.3)] overflow-hidden group">
        <CardContent className="p-0">
          {/* Header Image/Gradient Area */}
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-900/40 group-hover:scale-110 transition-transform duration-700" />

            {/* Status Badge */}
            <div className="absolute top-4 right-4 z-10">
              <Badge
                className={`${isGameFull
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/20"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/20"
                  } backdrop-blur-md px-3 py-1 font-bold uppercase tracking-wider text-[10px]`}
              >
                {isGameFull ? "Full" : "Open"}
              </Badge>
            </div>

            {/* Sport Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
              <span className="text-8xl transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                {SPORT_EMOJIS[game.sport] || "🏆"}
              </span>
            </div>

            {/* Price Tag */}
            {game.cost_per_person > 0 && (
              <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
                <span className="text-sm font-black text-white">${game.cost_per_person}</span>
                <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">/ Session</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/5 text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                  {game.sport?.replace(/_/g, ' ')}
                </Badge>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  <Award className="w-3 h-3 text-yellow-500" />
                  {game.skill_level?.replace(/_/g, ' ')}
                </div>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">
                {game.title}
              </h3>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="p-2 bg-white/5 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-sm font-bold tracking-tight">
                  {format(new Date(game.date_time), "MMM d, h:mm a")}
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-400">
                <div className="p-2 bg-white/5 rounded-lg">
                  <MapPin className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-sm font-bold tracking-tight truncate">
                  {game.location.venue_name}, {game.location.city}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-black text-white">
                    {game.current_players}/{game.max_players}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                    Joined
                  </span>
                </div>
                {spotsLeft > 0 && !isGameFull && (
                  <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-400/10 px-2 py-0.5 rounded-md">
                    {spotsLeft} Left
                  </span>
                )}
              </div>

              {/* Modern Progress Line */}
              <div className="relative w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(game.current_players / game.max_players) * 100}%` }}
                  className={`absolute left-0 top-0 h-full rounded-full ${isGameFull ? 'bg-rose-500' : 'bg-blue-500'}`}
                />
              </div>
            </div>

            <Button
              onClick={handleJoinGame}
              disabled={isGameFull}
              className={`w-full h-12 rounded-xl font-black uppercase tracking-[0.1em] transition-all ${isGameFull
                  ? 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-[0.98]'
                }`}
            >
              {isGameFull ? "Game Full" : "Join Matchup"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}