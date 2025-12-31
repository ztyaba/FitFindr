import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Star, DollarSign, Calendar, Users, Clock, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

/**
 * VersusMapCard - Floating card for Versus map view (games and courts)
 * Similar to MapViewCard but adapted for games/courts
 */
export default function VersusMapCard({ game, court, onClose, onViewDetails }) {
    const item = game || court;
    if (!item) return null;

    const isGame = !!game;
    const location = item.location || {};

    // Game-specific data
    const gameDate = isGame && item.date_time ? new Date(item.date_time) : null;
    const sportLabel = isGame ? (item.sport?.replace(/_/g, " ") || "Pickup Game") : null;
    const maxPlayers = isGame ? (typeof item.max_players === "number" ? item.max_players : "--") : null;
    const currentPlayers = isGame ? (typeof item.current_players === "number" ? item.current_players : 0) : null;
    const costDisplay = isGame
        ? (typeof item.cost_per_person === "number" && item.cost_per_person > 0
            ? `$${item.cost_per_person}`
            : "Free")
        : null;

    // Court-specific data
    const hourlyRate = !isGame && typeof item.hourly_rate === "number"
        ? `$${item.hourly_rate}/hr`
        : (!isGame ? "Contact for pricing" : null);
    const sports = !isGame && Array.isArray(item.sports_supported) ? item.sports_supported : [];

    const dateFormatter = new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

    return (
        <AnimatePresence>
            <div className="fixed md:absolute bottom-[calc(15vh+1.5rem)] md:bottom-40 inset-x-0 z-[210] flex justify-center pointer-events-none px-4">
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.95 }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                        duration: 0.5
                    }}
                    className="w-full max-w-lg pointer-events-auto"
                >
                    <motion.div
                        layout
                        className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-[30] p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all shadow-lg backdrop-blur-md border border-white/20"
                            aria-label="Close card"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key="expanded"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="relative"
                            >
                                {/* Header with gradient */}
                                <div className={`relative h-40 w-full overflow-hidden ${isGame ? 'bg-gradient-to-br from-emerald-900/60 to-blue-900/60' : 'bg-gradient-to-br from-purple-900/60 to-indigo-900/60'}`}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

                                    {/* Type Badge */}
                                    <div className="absolute top-6 left-6">
                                        <Badge className={`${isGame ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'} border px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] text-[10px]`}>
                                            {isGame ? sportLabel : (item.venue_type || "Venue")}
                                        </Badge>
                                    </div>

                                    {/* Icon */}
                                    <div className="absolute bottom-6 left-6 flex items-center gap-4 pr-12">
                                        <div className={`w-14 h-14 rounded-2xl ${isGame ? 'bg-emerald-500/20' : 'bg-purple-500/20'} flex items-center justify-center border border-white/10 shrink-0`}>
                                            {isGame ? (
                                                <Trophy className="w-7 h-7 text-emerald-400" />
                                            ) : (
                                                <MapPin className="w-7 h-7 text-purple-400" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-xl font-black text-white tracking-tight leading-tight truncate">
                                                {isGame ? (item.title || "Pickup Game") : item.name}
                                            </h3>
                                            <p className="text-sm font-bold text-slate-400 truncate">
                                                {isGame ? (location.venue_name || "Location TBA") : (item.venue_name || "Premium Venue")}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-6 space-y-5">
                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Location */}
                                        <div className="flex items-center gap-3 text-slate-300">
                                            <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                                                <MapPin className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <span className="text-sm font-bold truncate">
                                                {location.city || location.address || "TBA"}
                                            </span>
                                        </div>

                                        {/* Cost/Rate */}
                                        <div className="flex items-center gap-3 text-slate-300">
                                            <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                                                <DollarSign className="w-4 h-4 text-emerald-400" />
                                            </div>
                                            <span className="text-sm font-black text-white">
                                                {isGame ? costDisplay : hourlyRate}
                                            </span>
                                        </div>

                                        {/* Game-specific: Date and Players */}
                                        {isGame && gameDate && (
                                            <div className="flex items-center gap-3 text-slate-300">
                                                <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                                                    <Calendar className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <span className="text-sm font-bold">
                                                    {dateFormatter.format(gameDate)}
                                                </span>
                                            </div>
                                        )}

                                        {isGame && (
                                            <div className="flex items-center gap-3 text-slate-300">
                                                <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                                                    <Users className="w-4 h-4 text-emerald-400" />
                                                </div>
                                                <span className="text-sm font-bold">
                                                    {currentPlayers}/{maxPlayers} joined
                                                </span>
                                            </div>
                                        )}

                                        {/* Court-specific: Rating */}
                                        {!isGame && typeof item.rating === "number" && (
                                            <div className="flex items-center gap-3 text-slate-300">
                                                <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                </div>
                                                <span className="text-sm font-bold">
                                                    {item.rating.toFixed(1)} Rating
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Sports badges (court only) */}
                                    {!isGame && sports.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {sports.slice(0, 4).map((sport) => (
                                                <Badge
                                                    key={sport}
                                                    variant="secondary"
                                                    className="text-xs font-bold uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 capitalize"
                                                >
                                                    {sport.replace(/_/g, " ")}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Tags (game only) */}
                                    {isGame && Array.isArray(item.tags) && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {item.tags.slice(0, 4).map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="text-xs font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1"
                                                >
                                                    {String(tag).replace(/_/g, " ")}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-4 pt-2">
                                        <Button
                                            onClick={() => onViewDetails && onViewDetails(item)}
                                            className={`flex-[2] h-12 ${isGame ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20'} text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]`}
                                        >
                                            {isGame ? "Join Matchup" : "Book Venue"}
                                        </Button>
                                        <Button
                                            onClick={onClose}
                                            variant="outline"
                                            className="flex-1 h-12 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 rounded-xl font-bold transition-all"
                                        >
                                            Dismiss
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
