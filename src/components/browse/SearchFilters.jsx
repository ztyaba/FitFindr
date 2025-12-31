import React from "react";
import { motion } from "framer-motion";
import { X, DollarSign, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

const SPECIALTIES = [
  { value: "personal_training", label: "Personal Training" },
  { value: "yoga", label: "Yoga" },
  { value: "pilates", label: "Pilates" },
  { value: "crossfit", label: "CrossFit" },
  { value: "nutrition", label: "Nutrition" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "strength_training", label: "Strength Training" },
  { value: "cardio", label: "Cardio" },
  { value: "rehabilitation", label: "Rehabilitation" },
  { value: "sports_conditioning", label: "Sports Conditioning" },
  { value: "group_fitness", label: "Group Fitness" },
  { value: "martial_arts", label: "Martial Arts" },
];

export default function SearchFilters({ filters, setFilters, onClose }) {
  const handleSpecialtyChange = (specialty, checked) => {
    setFilters(prev => ({
      ...prev,
      specialties: checked
        ? [...prev.specialties, specialty]
        : prev.specialties.filter(s => s !== specialty)
    }));
  };

  const clearFilters = () => {
    setFilters({
      specialties: [],
      priceRange: [0, 200],
      location: "",
      rating: 0
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] rounded-[3rem] overflow-hidden"
    >
      <div className="p-8 sm:p-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-3xl font-black text-white tracking-tight">Filter Pros</h3>
            <p className="text-slate-400 font-medium">Find the perfect expert for your workout.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-slate-400 hover:text-white font-black uppercase text-[10px] tracking-widest px-4 h-10 bg-white/5 border border-white/5 rounded-xl transition-all"
            >
              Reset
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
          {/* Specialties */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
              Area of Expertise
            </Label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 glass-scrollbar">
              {SPECIALTIES.map((specialty) => (
                <div key={specialty.value}
                  onClick={() => handleSpecialtyChange(specialty.value, !filters.specialties.includes(specialty.value))}
                  className="flex items-center space-x-3 group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-all"
                >
                  <Checkbox
                    id={specialty.value}
                    checked={filters.specialties.includes(specialty.value)}
                    onCheckedChange={(checked) => handleSpecialtyChange(specialty.value, checked)}
                    className="border-white/30 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-md"
                  />
                  <Label
                    htmlFor={specialty.value}
                    className="text-sm font-bold text-slate-400 group-hover:text-white cursor-pointer transition-colors"
                  >
                    {specialty.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Hourly Investment
            </Label>
            <div className="px-2 pt-4 space-y-6">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                max={200}
                min={0}
                step={5}
                className="py-4"
              />
              <div className="flex justify-between items-center">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rate Range</div>
                <div className="text-sm font-black text-white bg-blue-600/20 px-3 py-1 rounded-lg border border-blue-500/20">
                  ${filters.priceRange[0]} - ${filters.priceRange[1]}+
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Service Area
            </Label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <Input
                placeholder="City or zip..."
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="h-14 pl-11 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-slate-500 focus:border-blue-500/50 transition-all font-bold"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Performance Level
            </Label>
            <div className="space-y-2">
              {[4, 3, 2].map((rating) => (
                <div
                  key={rating}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${filters.rating === rating
                      ? 'bg-blue-600/10 border-blue-500'
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                    }`}
                  onClick={() => setFilters(prev => ({ ...prev, rating: prev.rating === rating ? 0 : rating }))}
                >
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'}`}
                      />
                    ))}
                    <span className="text-[11px] font-bold text-slate-300 ml-1">& Up</span>
                  </div>
                  {filters.rating === rating && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <Button
            onClick={onClose}
            className="w-full sm:w-auto h-14 px-10 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-900/20 transition-all active:scale-95"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
