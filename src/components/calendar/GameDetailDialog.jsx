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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span className="text-3xl">{SPORT_EMOJIS[game.sport]}</span>
            {game.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sport and Status */}
          <div className="flex items-center gap-3">
            <Badge className={`${SPORT_COLORS[game.sport]} border-0`}>
              {game.sport.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            <Badge variant={isGameFull ? "destructive" : "secondary"} className={isGameFull ? "" : "bg-green-100 text-green-800"}>
              {isGameFull ? "FULL" : "OPEN"}
            </Badge>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-500" />
                <div>
                  <div className="font-medium">{format(new Date(game.date_time), "EEEE, MMMM d")}</div>
                  <div className="text-slate-600">{format(new Date(game.date_time), "h:mm a")}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <div className="font-medium">{game.location.venue_name}</div>
                  <div className="text-slate-600">{game.location.city}, {game.location.state}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-500" />
                <div>
                  <div className="font-medium">{game.current_players}/{game.max_players} Players</div>
                  <div className="text-slate-600">
                    {game.max_players - game.current_players > 0 && 
                      `${game.max_players - game.current_players} spots left`
                    }
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-500" />
                <div>
                  <div className="font-medium">{game.duration_minutes} minutes</div>
                  <div className="text-slate-600">Game duration</div>
                </div>
              </div>

              {game.cost_per_person > 0 && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-slate-500" />
                  <div>
                    <div className="font-medium">${game.cost_per_person}</div>
                    <div className="text-slate-600">per person</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-slate-500" />
                <div>
                  <div className="font-medium capitalize">{game.skill_level.replace(/_/g, ' ')}</div>
                  <div className="text-slate-600">Skill level</div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {game.description && (
            <div>
              <h4 className="font-medium mb-2">Game Details</h4>
              <p className="text-slate-600">{game.description}</p>
            </div>
          )}

          {/* Equipment */}
          {(game.equipment_provided?.length > 0 || game.equipment_needed?.length > 0) && (
            <div className="grid grid-cols-2 gap-4">
              {game.equipment_provided?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Equipment Provided</h4>
                  <ul className="text-slate-600 text-sm space-y-1">
                    {game.equipment_provided.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {game.equipment_needed?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Bring Your Own</h4>
                  <ul className="text-slate-600 text-sm space-y-1">
                    {game.equipment_needed.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Organizer */}
          {game.organizer_name && (
            <div className="pt-4 border-t">
              <div className="text-sm text-slate-600">
                Organized by <span className="font-medium">{game.organizer_name}</span>
                {game.organizer_contact && (
                  <span> • {game.organizer_contact}</span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button
              onClick={handleJoinGame}
              disabled={isGameFull}
              className={`flex-1 ${
                isGameFull 
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isGameFull ? "Game Full" : "Join Game"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}