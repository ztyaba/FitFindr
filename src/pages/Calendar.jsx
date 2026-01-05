import React, { useState, useEffect } from "react";
import { PickupGame, GameParticipation } from "@/api/entities";
import { Calendar as CalendarIcon, Clock, MapPin, Users, Zap, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";

import GameDetailDialog from "../components/calendar/GameDetailDialog";
import UpcomingGames from "../components/calendar/UpcomingGames";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { X } from "lucide-react";



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

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [myGames, setMyGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load all upcoming games
      const games = await PickupGame.list("-date_time", 100);
      const futureGames = games.filter(game => new Date(game.date_time) > new Date());
      setAllGames(futureGames);

      // In a real app, you'd filter by user's participations
      // For demo purposes, we'll simulate some joined games
      const simulatedMyGames = futureGames.slice(0, Math.min(3, futureGames.length));
      setMyGames(simulatedMyGames);
    } catch (error) {
      console.error("Error loading calendar data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const getGamesForDate = (date) => {
    return allGames.filter(game =>
      isSameDay(new Date(game.date_time), date)
    );
  };

  const getMyGamesForDate = (date) => {
    return myGames.filter(game =>
      isSameDay(new Date(game.date_time), date)
    );
  };

  const renderCalendarDays = () => {
    const days = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      const currentDay = day;
      const gamesOnDay = getGamesForDate(currentDay);
      const myGamesOnDay = getMyGamesForDate(currentDay);
      const isCurrentMonth = isSameMonth(currentDay, currentDate);
      const isDayToday = isToday(currentDay);

      days.push(
        <motion.div
          key={currentDay.toISOString()}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`min-h-[80px] sm:min-h-[140px] p-2 sm:p-4 border border-white/5 cursor-pointer transition-all duration-300 relative group overflow-hidden ${isCurrentMonth ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-900/30 opacity-40 hover:opacity-100'
            } ${isDayToday ? 'ring-2 ring-blue-500/50 bg-blue-500/5' : ''}`}
          onClick={() => setSelectedDate(currentDay)}
        >
          <div className={`text-sm font-black mb-3 ${isCurrentMonth ? 'text-white' : 'text-slate-500'
            } ${isDayToday ? 'text-blue-400' : ''}`}>
            {format(currentDay, 'd')}
          </div>

          <div className="space-y-1.5 relative z-10">
            {myGamesOnDay.map((game) => (
              <div
                key={game.id}
                className="text-[9px] font-black uppercase tracking-tight py-1 px-2 rounded-lg border bg-blue-600/20 border-blue-500/30 text-blue-300 flex items-center gap-1.5 transition-all"
              >
                <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                <span className="truncate">My Game</span>
              </div>
            ))}
            {gamesOnDay.filter(game => !myGamesOnDay.some(mg => mg.id === game.id)).slice(0, 2).map((game) => (
              <div
                key={game.id}
                className="text-[9px] font-black uppercase tracking-tight py-1 px-2 rounded-lg border bg-white/5 border-white/10 text-slate-400 group-hover:text-slate-300 flex items-center gap-1.5 transition-all"
              >
                <div className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="truncate">{game.title}</span>
              </div>
            ))}
            {gamesOnDay.length > (myGamesOnDay.length + 2) && (
              <div className="text-[9px] font-black text-slate-500 pl-2 uppercase tracking-widest mt-1">
                + {gamesOnDay.length - myGamesOnDay.length - 2} More
              </div>
            )}
          </div>
        </motion.div>
      );

      day = addDays(day, 1);
    }

    return days;
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-white selection:bg-blue-500/30">

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
          {/* Main Calendar Card */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">My Matchups</h2>
                <p className="text-slate-400 font-medium capitalize">{format(currentDate, 'MMMM yyyy')}</p>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="rounded-xl hover:bg-white/5 text-slate-400 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className="font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-white"
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="rounded-xl hover:bg-white/5 text-slate-400 hover:text-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
              <div className="grid grid-cols-7 border-b border-white/5 bg-white/5">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="py-3 sm:py-6 text-center text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] sm:tracking-[0.2em]">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.charAt(0)}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 glass-scrollbar overflow-y-auto max-h-[50dvh] sm:max-h-[700px]">
                {isLoading ? (
                  Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="min-h-[140px] p-4 border border-white/5 bg-white/5 animate-pulse" />
                  ))
                ) : (
                  renderCalendarDays()
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <UpcomingGames
              games={myGames}
              onGameSelect={(game) => setSelectedGame(game)}
            />

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              <div className="relative z-10">
                <h3 className="text-2xl font-black tracking-tight mb-4 leading-tight">Host Your Own Matchup</h3>
                <p className="text-blue-100 text-sm font-medium mb-8 leading-relaxed opacity-80">Can't find a game? Create yours and let players join you.</p>
                <Link to={createPageUrl("Versus")}>
                  <Button className="w-full h-14 bg-white text-blue-600 hover:bg-blue-50 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-950/20">
                    Create a Game
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Selected Day Dialog */}
      <AnimatePresence>
        {selectedDate && (
          <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDate(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-t-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl max-h-[90dvh] sm:max-h-none flex flex-col"
            >
              <div className="p-6 sm:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tight leading-none mb-1">
                      {format(selectedDate, 'EEEE')}
                    </h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                      {format(selectedDate, 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedDate(null)}
                    className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-lg"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 glass-scrollbar">
                  {getGamesForDate(selectedDate).length === 0 ? (
                    <div className="py-12 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                      <CalendarIcon className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No matches scheduled</p>
                    </div>
                  ) : (
                    getGamesForDate(selectedDate).map((game) => (
                      <div
                        key={game.id}
                        onClick={() => {
                          setSelectedGame(game);
                          setSelectedDate(null);
                        }}
                        className="group p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{SPORT_EMOJIS[game.sport] || "🏆"}</div>
                          <div>
                            <div className="text-white font-black tracking-tight">{game.title}</div>
                            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {format(new Date(game.date_time), "h:mm a")}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-10 pt-8 border-t border-white/5">
                  <Link to={createPageUrl("Versus")}>
                    <Button className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-900/20">
                      Schedule a Match
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <GameDetailDialog
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
        onJoin={loadData}
      />
    </div>
  );
}
