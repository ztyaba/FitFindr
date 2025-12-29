import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp, MapPin, Zap, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

const RANK_COLORS = {
  1: "from-yellow-400 to-yellow-600",
  2: "from-gray-300 to-gray-500",
  3: "from-blue-500 to-blue-700",
};

export default function Leaderboard({ players = [], tone = "light" }) {
  const isDark = tone === "dark";
  const [selectedSport, setSelectedSport] = useState("overall");

  // Ensure players is always an array
  const safePlayers = Array.isArray(players) ? players : [];

  const getPlayersByRating = (sport) => {
    if (sport === "overall") {
      return [...safePlayers]
        .sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0))
        .slice(0, 20);
    }

    return [...safePlayers]
      .filter(player => {
        const hasStats = player.stats_by_sport &&
          player.stats_by_sport[sport] &&
          typeof player.stats_by_sport[sport] === 'object';
        const playsSport = player.sports && player.sports.includes(sport);
        return playsSport && hasStats;
      })
      .sort((a, b) => {
        const aStats = a.stats_by_sport[sport] || {};
        const bStats = b.stats_by_sport[sport] || {};
        return (bStats.skill_rating || 0) - (aStats.skill_rating || 0);
      })
      .slice(0, 20);
  };

  const getWinRate = (player, sport) => {
    if (sport === "overall") {
      let totalWins = 0;
      let totalPlayed = 0;

      if (player.stats_by_sport) {
        Object.values(player.stats_by_sport).forEach(stats => {
          if (stats && typeof stats === 'object') {
            totalWins += stats.games_won || 0;
            totalPlayed += stats.games_played || 0;
          }
        });
      }

      return totalPlayed > 0 ? Math.round((totalWins / totalPlayed) * 100) : 0;
    }

    const stats = player.stats_by_sport?.[sport];
    if (!stats || typeof stats !== 'object' || !stats.games_played || stats.games_played === 0) return 0;
    return Math.round(((stats.games_won || 0) / stats.games_played) * 100);
  };

  const getGamesPlayed = (player, sport) => {
    if (sport === "overall") return player.total_games || 0;
    const stats = player.stats_by_sport?.[sport];
    return (stats && typeof stats === 'object') ? (stats.games_played || 0) : 0;
  };

  const getRating = (player, sport) => {
    if (sport === "overall") return player.overall_rating || 5;
    const stats = player.stats_by_sport?.[sport];
    return (stats && typeof stats === 'object') ? (stats.skill_rating || 5) : 5;
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />;
      case 2: return <Medal className="w-8 h-8 text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.5)]" />;
      case 3: return <Award className="w-8 h-8 text-amber-600 drop-shadow-[0_0_10px_rgba(180,83,9,0.5)]" />;
      default: return <span className="text-xl font-black text-slate-600">#{rank}</span>;
    }
  };

  const availableSports = ["overall", ...new Set(safePlayers.flatMap(p => p.sports || []))];

  const textPrimary = "text-white";
  const textSecondary = "text-slate-400";
  const panelBg = "bg-slate-900/50 backdrop-blur-xl border border-white/5";
  const tabListBg = "bg-white/5 border border-white/5 p-1 rounded-2xl";
  const tabTriggerBase = "rounded-xl px-6 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 font-bold uppercase text-[11px] tracking-widest transition-all";
  const rankingRowBg = "bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-300";

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-xl">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight">Hall of Fame</h2>
          </div>
          <p className="text-slate-400 font-medium text-lg">Top competitors in your local arena</p>
        </div>

        {/* Sport Tabs */}
        <Tabs value={selectedSport} onValueChange={setSelectedSport} className="w-full md:w-auto">
          <TabsList className={tabListBg}>
            <TabsTrigger value="overall" className={tabTriggerBase}>
              Overall
            </TabsTrigger>
            {availableSports.filter(sport => sport !== "overall").slice(0, 4).map((sport) => (
              <TabsTrigger key={sport} value={sport} className={tabTriggerBase}>
                <span className="mr-2">{SPORT_EMOJIS[sport]}</span>
                <span className="capitalize">{sport.replace(/_/g, ' ')}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSport}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Top 3 Podium - Modern Design */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-end">
              {getPlayersByRating(selectedSport).slice(0, 3).map((player, index) => {
                const rank = index + 1;
                const isWinner = rank === 1;
                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative ${isWinner ? 'md:order-2 z-10' : rank === 2 ? 'md:order-1' : 'md:order-3'}`}
                  >
                    <div className={`relative group ${isWinner ? 'scale-110' : 'scale-100'}`}>
                      {/* Glow Background */}
                      <div className={`absolute -inset-1 bg-gradient-to-r ${rank === 1 ? 'from-yellow-400 to-amber-600' :
                        rank === 2 ? 'from-slate-300 to-slate-500' :
                          'from-amber-600 to-orange-800'
                        } rounded-[2rem] opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500`} />

                      <Card className={`relative overflow-hidden ${panelBg} rounded-[2rem] border-white/10`}>
                        <CardContent className="p-8 text-center flex flex-col items-center">
                          <div className="mb-6">
                            {getRankIcon(rank)}
                          </div>

                          <div className="relative mb-6">
                            <Avatar className="w-24 h-24 border-4 border-white/10 shadow-2xl">
                              <AvatarImage src={player.avatar_url} alt={player.player_name} />
                              <AvatarFallback className="bg-blue-600 text-2xl font-black text-white">
                                {player.player_name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            {isWinner && (
                              <div className="absolute -top-4 -right-2 bg-yellow-500 text-black rounded-full p-2 shadow-lg animate-bounce">
                                <Zap className="w-4 h-4 fill-black" />
                              </div>
                            )}
                          </div>

                          <h3 className="text-xl font-black text-white mb-1 truncate w-full">
                            {player.player_name || 'Anonymous'}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">
                            <MapPin className="w-3.5 h-3.5 text-blue-500" />
                            {player.location?.city || 'Unknown'}
                          </div>

                          <div className="grid grid-cols-3 w-full gap-2 pt-6 border-t border-white/5">
                            <div className="text-center">
                              <div className="text-lg font-black text-white">{getRating(player, selectedSport).toFixed(1)}</div>
                              <div className="text-[9px] font-bold text-slate-500 uppercase">Rating</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-black text-emerald-400">{getWinRate(player, selectedSport)}%</div>
                              <div className="text-[9px] font-bold text-slate-500 uppercase">Wins</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-black text-blue-400">{getGamesPlayed(player, selectedSport)}</div>
                              <div className="text-[9px] font-bold text-slate-500 uppercase">Plays</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Rest of Rankings List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-6 mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ranking List</span>
                <Badge variant="outline" className="border-white/5 text-slate-400 text-[9px] font-bold">
                  {getPlayersByRating(selectedSport).length} Total Competitors
                </Badge>
              </div>

              <div className="grid gap-3">
                {getPlayersByRating(selectedSport).slice(3).map((player, index) => {
                  const rank = index + 4;
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex flex-col md:flex-row items-center justify-between p-5 rounded-2xl ${rankingRowBg}`}
                    >
                      <div className="flex items-center gap-6 w-full md:w-auto mb-4 md:mb-0">
                        <div className="w-10 text-center font-black text-xl text-slate-600">
                          {rank}
                        </div>

                        <Avatar className="w-12 h-12 border border-white/10">
                          <AvatarImage src={player.avatar_url} alt={player.player_name} />
                          <AvatarFallback className="bg-white/5 text-white font-bold">
                            {player.player_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="font-black text-white flex items-center gap-2">
                            {player.player_name || 'Anonymous'}
                            {getWinRate(player, selectedSport) > 70 && (
                              <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[8px] px-1 py-0 font-black">STREAK</Badge>
                            )}
                          </div>
                          <div className="text-[10px] flex items-center gap-1 font-bold text-slate-500 uppercase tracking-tighter">
                            <MapPin className="w-3 h-3 text-blue-600" />
                            {player.location?.city || 'Unknown'}, {player.location?.state || 'Unknown'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-center min-w-[60px]">
                          <div className="text-lg font-black text-white">{getRating(player, selectedSport).toFixed(1)}</div>
                          <div className="text-[9px] font-black text-slate-500 uppercase">Rating</div>
                        </div>
                        <div className="text-center min-w-[60px]">
                          <div className="text-lg font-black text-emerald-500">{getWinRate(player, selectedSport)}%</div>
                          <div className="text-[9px] font-black text-slate-500 uppercase">Win Rate</div>
                        </div>
                        <div className="text-center min-w-[60px]">
                          <div className="text-lg font-black text-blue-500">{getGamesPlayed(player, selectedSport)}</div>
                          <div className="text-[9px] font-black text-slate-500 uppercase">Games</div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-700 hidden md:block" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {getPlayersByRating(selectedSport).length === 0 && (
          <div className="text-center py-24 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
            <Trophy className="w-16 h-16 text-slate-700 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-white mb-2">The Arena is Quiet</h3>
            <p className="text-slate-400 font-medium">Be the first to compete in this category and claim the #1 spot!</p>
          </div>
        )}
      </div>
    </div>
  );
}
