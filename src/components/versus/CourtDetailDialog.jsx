import React from "react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Star, Zap, Clock, Trophy } from "lucide-react";

export default function CourtDetailDialog({ court, onClose }) {
    if (!court) return null;

    const location = court.location || {};
    const sports = Array.isArray(court.sports_supported) ? court.sports_supported : [];

    return (
        <Dialog open={!!court} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl bg-slate-900/90 backdrop-blur-[40px] border border-white/10 rounded-[3rem] overflow-hidden p-0 shadow-2xl">
                <div className="relative h-64 w-full overflow-hidden">
                    {court.image_url ? (
                        <img src={court.image_url} alt={court.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-900/40" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

                    <div className="absolute top-8 right-8 flex gap-3">
                        <Badge className="bg-purple-500/20 text-purple-300 border-0 px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                            {court.venue_type || "Sports Center"}
                        </Badge>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-0 px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                            Verified Venue
                        </Badge>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8">
                        <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-2">
                            {court.name}
                        </h2>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                            {court.venue_name || "Premium Athletic Facility"}
                        </p>
                    </div>
                </div>

                <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto glass-scrollbar">
                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                                    <MapPin className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <div className="text-lg font-black text-white tracking-tight">{location.address || "Location TBA"}</div>
                                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{location.city}, {location.state}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                                    <Star className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <div className="text-lg font-black text-white tracking-tight">{court.rating?.toFixed(1) || "4.9"} / 5.0</div>
                                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Facility Rating</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                                    <DollarSign className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-white tracking-tight">${court.rate_per_hour || 0}</div>
                                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Per Hour</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                                    <Zap className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-lg font-black text-white tracking-tight">Instant Booking</div>
                                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Available Now</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sports Supported */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Available Sports</h4>
                        <div className="flex flex-wrap gap-2">
                            {sports.length > 0 ? sports.map((sport) => (
                                <Badge key={sport} className="bg-white/5 text-white border-white/10 px-4 py-2 rounded-xl text-xs font-bold capitalize">
                                    {sport.replace(/_/g, " ")}
                                </Badge>
                            )) : (
                                <span className="text-slate-500 italic text-sm">Multi-sport facility</span>
                            )}
                        </div>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-slate-400" />
                            </div>
                            <span className="text-sm font-bold text-slate-300">Open 24/7 Access</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-slate-400" />
                            </div>
                            <span className="text-sm font-bold text-slate-300">Professional Standards</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-white"
                        >
                            Close Details
                        </Button>
                        <Button
                            className="h-16 px-12 rounded-[1.5rem] bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-purple-900/20 active:scale-95"
                        >
                            Book This Venue
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
