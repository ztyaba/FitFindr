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
      className="bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white tracking-tight">Filter Professionals</h3>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={clearFilters} 
              size="sm"
              className="text-white border-white/20 hover:bg-white/10 hover:text-white"
            >
              Clear All
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Specialties */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Specialties
            </Label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {SPECIALTIES.map((specialty) => (
                <div key={specialty.value} className="flex items-center space-x-3 group cursor-pointer">
                  <Checkbox
                    id={specialty.value}
                    checked={filters.specialties.includes(specialty.value)}
                    onCheckedChange={(checked) => handleSpecialtyChange(specialty.value, checked)}
                    className="border-white/30 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label 
                    htmlFor={specialty.value}
                    className="text-sm text-slate-400 group-hover:text-slate-200 cursor-pointer transition-colors"
                  >
                    {specialty.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Hourly Rate
            </Label>
            <div className="px-2 pt-4 space-y-6">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                max={200}
                min={0}
                step={5}
                className="[&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-600"
              />
              <div className="flex justify-between items-center">
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 min-w-[60px] text-center">
                  <span className="text-sm font-bold text-white">${filters.priceRange[0]}</span>
                </div>
                <div className="w-4 h-px bg-white/20" />
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 min-w-[60px] text-center">
                  <span className="text-sm font-bold text-white">${filters.priceRange[1]}+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <div className="relative">
              <Input
                placeholder="City or State"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-600/50"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4" />
              Minimum Rating
            </Label>
            <div className="space-y-3">
              {[4, 3, 2, 1].map((rating) => (
                <div 
                  key={rating} 
                  className="flex items-center space-x-3 group cursor-pointer"
                  onClick={() => setFilters(prev => ({ ...prev, rating }))}
                >
                  <div className={`w-4 h-4 rounded-full border border-white/30 flex items-center justify-center transition-all ${filters.rating === rating ? 'bg-blue-600 border-blue-600' : 'group-hover:border-white/50'}`}>
                    {filters.rating === rating && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <Label className="flex items-center gap-1.5 text-sm text-slate-400 group-hover:text-slate-200 cursor-pointer">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'}`} 
                        />
                      ))}
                    </div>
                    <span>& up</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}