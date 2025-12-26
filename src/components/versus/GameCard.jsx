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
    
    // In a real app, this would update the game and add the user
    console.log("Joining game:", game.id);
    onJoin();
  };

  const isGameFull = game.current_players >= game.max_players;
  const spotsLeft = game.max_players - game.current_players;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md overflow-hidden">
        <CardHeader className="p-0">
          {/* Header with sport and status */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{SPORT_EMOJIS[game.sport]}</span>
                <Badge className={`${SPORT_COLORS[game.sport]} border-0`}>
                  {game.sport.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
              <Badge 
                variant={isGameFull ? "destructive" : "secondary"}
                className={isGameFull ? "" : "bg-green-100 text-green-800"}
              >
                {isGameFull ? "FULL" : "OPEN"}
              </Badge>
            </div>
            
            <h3 className="text-lg font-bold mb-2 group-hover:text-yellow-300 transition-colors">
              {game.title}
            </h3>
            
            <div className="flex items-center gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(game.date_time), "MMM d, h:mm a")}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {game.duration_minutes}min
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Location */}
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-slate-900">{game.location.venue_name}</div>
              <div className="text-slate-600">{game.location.city}, {game.location.state}</div>
            </div>
          </div>

          {/* Players */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium">
                {game.current_players}/{game.max_players} players
              </span>
            </div>
            <div className="text-xs text-slate-600">
              {spotsLeft > 0 && `${spotsLeft} spots left`}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isGameFull ? 'bg-red-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${(game.current_players / game.max_players) * 100}%` }}
            />
          </div>

          {/* Skills and Cost */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <Badge variant="outline" className="text-xs">
                {game.skill_level.replace(/_/g, ' ')}
              </Badge>
            </div>
            {game.cost_per_person > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-slate-900">
                <DollarSign className="w-4 h-4 text-green-600" />
                ${game.cost_per_person}
              </div>
            )}
          </div>

          {/* Description */}
          {game.description && (
            <p className="text-sm text-slate-600 line-clamp-2">
              {game.description}
            </p>
          )}

          {/* Organizer */}
          <div className="text-xs text-slate-500 border-t pt-3">
            Organized by {game.organizer_name || "Anonymous"}
          </div>

          {/* Action Button */}
          <Button
            onClick={handleJoinGame}
            disabled={isGameFull}
            className={`w-full font-medium ${
              isGameFull 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isGameFull ? (
              <>
                <Users className="w-4 h-4 mr-2" />
                Game Full
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Join Game
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}