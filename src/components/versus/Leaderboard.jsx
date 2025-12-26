import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp, MapPin } from "lucide-react";
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

export default function Leaderboard({ players }) {
  const [selectedSport, setSelectedSport] = useState("overall");

  const getPlayersByRating = (sport) => {
    if (sport === "overall") {
      return [...players]
        .sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0))
        .slice(0, 20);
    }

    return [...players]
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
      const totalGames = player.total_games || 0;
      if (totalGames === 0) return 0;
      
      // Calculate overall win rate from all sports
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
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-blue-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-slate-600 font-bold">#{rank}</span>;
    }
  };

  const availableSports = ["overall", ...new Set(players.flatMap(p => p.sports || []))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Local Leaderboard
        </h2>
        <p className="text-slate-600">Top players in your area by sport and skill rating</p>
      </div>

      {/* Sport Tabs */}
      <Tabs value={selectedSport} onValueChange={setSelectedSport}>
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
          <TabsTrigger value="overall" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Overall
          </TabsTrigger>
          {availableSports.filter(sport => sport !== "overall").slice(0, 5).map((sport) => (
            <TabsTrigger key={sport} value={sport} className="flex items-center gap-2">
              <span>{SPORT_EMOJIS[sport]}</span>
              <span className="hidden sm:inline capitalize">
                {sport.replace(/_/g, ' ')}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {availableSports.map((sport) => (
          <TabsContent key={sport} value={sport} className="mt-6">
            <div className="grid gap-4">
              {/* Top 3 Podium */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {getPlayersByRating(sport).slice(0, 3).map((player, index) => {
                  const rank = index + 1;
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative ${rank === 1 ? 'md:order-2 transform md:scale-105' : rank === 2 ? 'md:order-1' : 'md:order-3'}`}
                    >
                      <Card className={`relative overflow-hidden ${rank <= 3 ? 'bg-gradient-to-br ' + RANK_COLORS[rank] : ''} ${rank <= 3 ? 'text-white' : ''}`}>
                        <CardContent className="p-6 text-center">
                          <div className="flex justify-center mb-4">
                            {getRankIcon(rank)}
                          </div>
                          
                          <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-white/20">
                            <AvatarImage src={player.avatar_url} alt={player.player_name} />
                            <AvatarFallback className="bg-white/20 text-lg font-bold">
                              {player.player_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <h3 className="font-bold text-lg mb-2">{player.player_name || 'Unknown Player'}</h3>
                          
                          <div className="space-y-1 text-sm opacity-90">
                            <div className="flex items-center justify-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {player.location?.city || 'Unknown'}, {player.location?.state || 'Unknown'}
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
                            <div className="flex justify-between">
                              <span>Rating:</span>
                              <span className="font-bold">{getRating(player, sport).toFixed(1)}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Win Rate:</span>
                              <span className="font-bold">{getWinRate(player, sport)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Games:</span>
                              <span className="font-bold">{getGamesPlayed(player, sport)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Rest of Rankings */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Rankings 4-20
                    <Badge variant="secondary">{getPlayersByRating(sport).length} players</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getPlayersByRating(sport).slice(3).map((player, index) => {
                      const rank = index + 4;
                      return (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 flex items-center justify-center font-bold text-slate-600">
                              #{rank}
                            </div>
                            
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={player.avatar_url} alt={player.player_name} />
                              <AvatarFallback className="bg-slate-200">
                                {player.player_name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <div className="font-medium text-slate-900">{player.player_name || 'Unknown Player'}</div>
                              <div className="text-sm text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {player.location?.city || 'Unknown'}, {player.location?.state || 'Unknown'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <div className="font-bold text-slate-900">{getRating(player, sport).toFixed(1)}</div>
                              <div className="text-slate-500">Rating</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-emerald-600">{getWinRate(player, sport)}%</div>
                              <div className="text-slate-500">Win Rate</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-blue-600">{getGamesPlayed(player, sport)}</div>
                              <div className="text-slate-500">Games</div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {getPlayersByRating(sport).length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No players yet</h3>
                  <p className="text-slate-600">Be the first to join games and climb the leaderboard!</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}