import React, { useState, useEffect } from "react";
import { PickupGame, GameParticipation } from "@/api/entities";
import { Calendar as CalendarIcon, Clock, MapPin, Users, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";

import GameDetailDialog from "../components/calendar/GameDetailDialog";
import UpcomingGames from "../components/calendar/UpcomingGames";

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
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`min-h-[100px] p-2 border border-slate-100 cursor-pointer transition-all duration-200 ${
            isCurrentMonth ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50'
          } ${isDayToday ? 'ring-2 ring-emerald-400' : ''}`}
          onClick={() => setSelectedDate(currentDay)}
        >
          <div className={`text-sm font-medium mb-1 ${
            isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
          } ${isDayToday ? 'text-emerald-600 font-bold' : ''}`}>
            {format(currentDay, 'd')}
          </div>
          
          {/* My Games (highlighted) */}
          {myGamesOnDay.map((game, index) => (
            <div
              key={game.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedGame(game);
              }}
              className="mb-1 p-1 bg-emerald-100 border border-emerald-200 rounded text-xs text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1">
                <span>{SPORT_EMOJIS[game.sport]}</span>
                <span className="truncate font-medium">My Game</span>
              </div>
              <div className="text-emerald-600">
                {format(new Date(game.date_time), 'h:mm a')}
              </div>
            </div>
          ))}

          {/* Other Available Games */}
          {gamesOnDay.filter(game => !myGamesOnDay.includes(game)).slice(0, 2).map((game, index) => (
            <div
              key={game.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedGame(game);
              }}
              className="mb-1 p-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1">
                <span>{SPORT_EMOJIS[game.sport]}</span>
                <span className="truncate">{game.title}</span>
              </div>
              <div className="text-blue-600">
                {format(new Date(game.date_time), 'h:mm a')}
              </div>
            </div>
          ))}

          {/* Show count if more games */}
          {gamesOnDay.length > (myGamesOnDay.length + 2) && (
            <div className="text-xs text-slate-500 mt-1">
              +{gamesOnDay.length - myGamesOnDay.length - 2} more
            </div>
          )}
        </motion.div>
      );

      day = addDays(day, 1);
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <CalendarIcon className="w-8 h-8" />
              My Fitness Calendar
            </h1>
            <p className="text-xl text-emerald-100">
              Track your games, appointments, and fitness schedule
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b bg-slate-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-slate-900">
                    {format(currentDate, 'MMMM yyyy')}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentDate(new Date())}
                      size="sm"
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Calendar Header */}
                <div className="grid grid-cols-7 border-b">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-slate-600 bg-slate-50">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 42 }).map((_, i) => (
                      <div key={i} className="min-h-[100px] p-2 border border-slate-100 bg-slate-50 animate-pulse" />
                    ))
                  ) : (
                    renderCalendarDays()
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-100 border border-emerald-200 rounded"></div>
                <span className="text-slate-600">My Scheduled Games</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
                <span className="text-slate-600">Available Games</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <UpcomingGames games={myGames} onGameSelect={setSelectedGame} />
            
            {/* Quick Stats */}
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Games Scheduled</span>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                    {myGames.filter(game => 
                      isSameMonth(new Date(game.date_time), currentDate)
                    ).length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Available Games</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {allGames.filter(game => 
                      isSameMonth(new Date(game.date_time), currentDate)
                    ).length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Game Detail Dialog */}
      <GameDetailDialog
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
        onJoin={loadData}
      />
    </div>
  );
}