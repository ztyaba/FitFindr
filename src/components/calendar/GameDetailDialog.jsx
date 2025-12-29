import React from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, DollarSign, Award } from "lucide-react";

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

export default function GameDetailDialog({ game, onClose, onJoin }) {
  if (!game) return null;

  const handleJoinGame = () => {
    // In a real app, this would create a GameParticipation record
    console.log("Joining game:", game.id);
    onJoin();
    onClose();
  };

  const isGameFull = game.current_players >= game.max_players;

  return (
    <Dialog open={!!game} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-slate-900/90 backdrop-blur-[40px] border border-white/10 rounded-[3rem] overflow-hidden p-0 shadow-2xl">
        <div className="relative h-64 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-900/40" />
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <span className="text-9xl transform -rotate-12">{SPORT_EMOJIS[game.sport] || "🏆"}</span>
          </div>
          <div className="absolute top-8 right-8 flex gap-3">
            <Badge className={`${SPORT_COLORS[game.sport]} border-0 px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]`}>
              {game.sport?.replace(/_/g, ' ')}
            </Badge>
            <Badge variant={isGameFull ? "destructive" : "secondary"} className={`border-0 px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] ${isGameFull ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"}`}>
              {isGameFull ? "FULL" : "OPEN"}
            </Badge>
          </div>

          <div className="absolute bottom-8 left-8 right-8">
            <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-2">
              {game.title}
            </h2>
          </div>
        </div>

        <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto glass-scrollbar">
          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-lg font-black text-white tracking-tight">{format(new Date(game.date_time), "EEEE, MMMM d")}</div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{format(new Date(game.date_time), "h:mm a")}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                  <MapPin className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-lg font-black text-white tracking-tight">{game.location.venue_name}</div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{game.location.city}, {game.location.state}</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-lg font-black text-white tracking-tight">{game.current_players}/{game.max_players} Players</div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    {game.max_players - game.current_players > 0
                      ? `${game.max_players - game.current_players} spots remaining`
                      : 'Matchup is full'
                    }
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-lg font-black text-white tracking-tight">{game.duration_minutes} Minutes</div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Match Duration</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-10 border-y border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-black text-white tracking-tight">${game.cost_per_person || 0}</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Per Spot</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                <Award className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <div className="text-lg font-black text-white tracking-tight capitalize">{game.skill_level?.replace(/_/g, ' ')}</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Skill Level</div>
              </div>
            </div>
          </div>

          {/* Description */}
          {game.description && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Match Logistics</h4>
              <p className="text-slate-300 leading-relaxed font-medium">{game.description}</p>
            </div>
          )}

          {/* Organizer Info */}
          <div className="pt-8 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Organizer</div>
                <div className="text-white font-black">{game.organizer_name}</div>
              </div>
              <Button
                onClick={handleJoinGame}
                disabled={isGameFull}
                className={`h-16 px-12 rounded-[1.5rem] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${isGameFull
                    ? 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 active:scale-95'
                  }`}
              >
                {isGameFull ? "Match Full" : "Join Matchup"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}