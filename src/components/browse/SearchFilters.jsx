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
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white border-b border-slate-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Filter Professionals</h3>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={clearFilters} size="sm">
              Clear All
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Specialties */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-3 block">
              Specialties
            </Label>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {SPECIALTIES.map((specialty) => (
                <div key={specialty.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={specialty.value}
                    checked={filters.specialties.includes(specialty.value)}
                    onCheckedChange={(checked) => handleSpecialtyChange(specialty.value, checked)}
                  />
                  <Label 
                    htmlFor={specialty.value}
                    className="text-sm text-slate-600 cursor-pointer"
                  >
                    {specialty.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-3 block flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Hourly Rate
            </Label>
            <div className="space-y-4">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                max={200}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-600">
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}+</span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-3 block flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Input
              placeholder="City or State"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="w-full"
            />
          </div>

          {/* Rating */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-3 block flex items-center gap-2">
              <Star className="w-4 h-4" />
              Minimum Rating
            </Label>
            <div className="space-y-3">
              {[4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`rating-${rating}`}
                    name="rating"
                    checked={filters.rating === rating}
                    onChange={() => setFilters(prev => ({ ...prev, rating }))}
                    className="text-emerald-600"
                  />
                  <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1 text-sm cursor-pointer">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-slate-600">& up</span>
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