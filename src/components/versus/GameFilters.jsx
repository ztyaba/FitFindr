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
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white border border-slate-200 rounded-lg shadow-sm mb-6"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Filter Games</h3>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={clearFilters} size="sm">
              Clear All
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sport */}
          <div className="space-y-2">
            <Label>Sport</Label>
            <Select
              value={filters.sport}
              onValueChange={(value) => setFilters(prev => ({ ...prev, sport: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Any sport</SelectItem>
                {SPORTS.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skill Level */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Skill Level
            </Label>
            <Select
              value={filters.skill_level}
              onValueChange={(value) => setFilters(prev => ({ ...prev, skill_level: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Any level</SelectItem>
                {SKILL_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Input
              placeholder="City or State"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          {/* Cost Range */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Max Cost per Person
            </Label>
            <div className="space-y-3">
              <Slider
                value={filters.cost_range}
                onValueChange={(value) => setFilters(prev => ({ ...prev, cost_range: value }))}
                max={100}
                min={0}
                step={5}
              />
              <div className="flex justify-between text-sm text-slate-600">
                <span>Free</span>
                <span>${filters.cost_range[1]}+</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}