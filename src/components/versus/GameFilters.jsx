import React from "react";
import { motion } from "framer-motion";
import { X, DollarSign, MapPin, Award, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const SPORTS = [
  "basketball", "tennis", "soccer", "volleyball", "badminton",
  "table_tennis", "squash", "racquetball", "pickleball", "football"
];

const SKILL_LEVELS = [
  "all_levels", "beginner", "intermediate", "advanced"
];

export default function GameFilters({ filters, setFilters, onClose }) {
  const clearFilters = () => {
    setFilters({
      sport: "",
      skill_level: "",
      date_range: "",
      location: "",
      cost_range: [0, 100]
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden"
    >
      <div className="p-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-3xl font-black text-white tracking-tight">Refine Matchups</h3>
            <p className="text-slate-400 font-medium">Find the perfect competition for your skill level.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-slate-400 hover:text-white font-black uppercase text-[10px] tracking-widest px-4 h-10 bg-white/5 border border-white/5 rounded-xl transition-all"
            >
              Reset Filters
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Sport */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Sport Discipline</Label>
            <Select
              value={filters.sport}
              onValueChange={(value) => setFilters(prev => ({ ...prev, sport: value }))}
            >
              <SelectTrigger className="h-14 bg-white/5 border-white/5 rounded-2xl text-white font-bold focus:ring-blue-500/20 transition-all">
                <SelectValue placeholder="Any Discipline" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 rounded-2xl p-2">
                <SelectItem value={null}>Any Discipline</SelectItem>
                {SPORTS.map((sport) => (
                  <SelectItem key={sport} value={sport} className="rounded-xl focus:bg-blue-600 focus:text-white py-3">
                    {sport.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skill Level */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Skill Intensity
            </Label>
            <Select
              value={filters.skill_level}
              onValueChange={(value) => setFilters(prev => ({ ...prev, skill_level: value }))}
            >
              <SelectTrigger className="h-14 bg-white/5 border-white/5 rounded-2xl text-white font-bold focus:ring-blue-500/20 transition-all">
                <SelectValue placeholder="Any Intensity" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 rounded-2xl p-2">
                <SelectItem value={null}>Any Intensity</SelectItem>
                {SKILL_LEVELS.map((level) => (
                  <SelectItem key={level} value={level} className="rounded-xl focus:bg-blue-600 focus:text-white py-3">
                    {level.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Radius / Area
            </Label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="City or Arena"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="h-14 pl-11 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-slate-500 focus:border-blue-500/50 transition-all font-bold"
              />
            </div>
          </div>

          {/* Cost Range */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Budget Limit
            </Label>
            <div className="pt-2 px-1">
              <Slider
                value={filters.cost_range}
                onValueChange={(value) => setFilters(prev => ({ ...prev, cost_range: value }))}
                max={100}
                min={0}
                step={5}
                className="py-4"
              />
              <div className="flex justify-between items-center mt-4">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entry Fee</div>
                <div className="text-sm font-black text-white bg-blue-600/20 px-3 py-1 rounded-lg border border-blue-500/20">
                  ${filters.cost_range[0]} - ${filters.cost_range[1]}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <Button
            onClick={onClose}
            className="h-14 px-10 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-900/20 transition-all active:scale-95"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </motion.div>
  );
}