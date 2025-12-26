import React, { useState } from "react";
import { PickupGame } from "@/api/entities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SPORTS = [
  { value: "basketball", label: "Basketball", emoji: "🏀" },
  { value: "tennis", label: "Tennis", emoji: "🎾" },
  { value: "soccer", label: "Soccer", emoji: "⚽" },
  { value: "volleyball", label: "Volleyball", emoji: "🏐" },
  { value: "badminton", label: "Badminton", emoji: "🏸" },
  { value: "table_tennis", label: "Table Tennis", emoji: "🏓" },
  { value: "squash", label: "Squash", emoji: "🎾" },
  { value: "racquetball", label: "Racquetball", emoji: "🎾" },
  { value: "pickleball", label: "Pickleball", emoji: "🏓" },
  { value: "football", label: "Football", emoji: "🏈" },
];

const SKILL_LEVELS = [
  { value: "all_levels", label: "All Levels Welcome" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function CreateGameDialog({ open, onClose, onGameCreated, courts }) {
  const [formData, setFormData] = useState({
    title: "",
    sport: "",
    skill_level: "all_levels",
    date_time: "",
    duration_minutes: 90,
    max_players: 4,
    cost_per_person: 0,
    description: "",
    organizer_name: "",
    organizer_contact: "",
    location: {
      venue_name: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
    }
  });
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleCourtSelect = (court) => {
    setSelectedCourt(court);
    setFormData(prev => ({
      ...prev,
      location: {
        venue_name: court.venue_name,
        address: court.location.address,
        city: court.location.city,
        state: court.location.state,
        zip_code: court.location.zip_code || "",
        latitude: court.location.latitude,
        longitude: court.location.longitude,
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await PickupGame.create(formData);
      onGameCreated();
      setFormData({
        title: "",
        sport: "",
        skill_level: "all_levels",
        date_time: "",
        duration_minutes: 90,
        max_players: 4,
        cost_per_person: 0,
        description: "",
        organizer_name: "",
        organizer_contact: "",
        location: {
          venue_name: "",
          address: "",
          city: "",
          state: "",
          zip_code: "",
        }
      });
      setSelectedCourt(null);
    } catch (error) {
      console.error("Error creating game:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableCourts = courts.filter(court => 
    !formData.sport || court.sports_supported.includes(formData.sport) || court.sports_supported.includes("multi_sport")
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            🎯 Create Pickup Game
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Game Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Friday Night Basketball"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sport">Sport *</Label>
              <Select
                value={formData.sport}
                onValueChange={(value) => handleInputChange('sport', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  {SPORTS.map((sport) => (
                    <SelectItem key={sport.value} value={sport.value}>
                      <span className="flex items-center gap-2">
                        <span>{sport.emoji}</span>
                        {sport.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date, Time, Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_time" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date & Time *
              </Label>
              <Input
                id="date_time"
                type="datetime-local"
                value={formData.date_time}
                onChange={(e) => handleInputChange('date_time', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duration (mins)
              </Label>
              <Input
                id="duration"
                type="number"
                min="30"
                max="300"
                value={formData.duration_minutes}
                onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_players" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Max Players *
              </Label>
              <Input
                id="max_players"
                type="number"
                min="2"
                max="20"
                value={formData.max_players}
                onChange={(e) => handleInputChange('max_players', parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Skill Level and Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skill_level">Skill Level</Label>
              <Select
                value={formData.skill_level}
                onValueChange={(value) => handleInputChange('skill_level', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cost" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cost per Person
              </Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost_per_person}
                onChange={(e) => handleInputChange('cost_per_person', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Court Selection */}
          {availableCourts.length > 0 && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Select Court/Venue (Optional)
              </Label>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {availableCourts.slice(0, 5).map((court) => (
                  <div
                    key={court.id}
                    onClick={() => handleCourtSelect(court)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCourt?.id === court.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{court.name}</div>
                        <div className="text-sm text-slate-600">{court.venue_name}</div>
                        <div className="text-xs text-slate-500">
                          {court.location.city}, {court.location.state} • ${court.hourly_rate}/hr
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual Location */}
          {!selectedCourt && (
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location Details *
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Venue name"
                  value={formData.location.venue_name}
                  onChange={(e) => handleInputChange('location.venue_name', e.target.value)}
                  required
                />
                <Input
                  placeholder="Address"
                  value={formData.location.address}
                  onChange={(e) => handleInputChange('location.address', e.target.value)}
                />
                <Input
                  placeholder="City"
                  value={formData.location.city}
                  onChange={(e) => handleInputChange('location.city', e.target.value)}
                  required
                />
                <Input
                  placeholder="State"
                  value={formData.location.state}
                  onChange={(e) => handleInputChange('location.state', e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Game Description</Label>
            <Textarea
              id="description"
              placeholder="Any additional details about the game..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Organizer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizer_name">Your Name</Label>
              <Input
                id="organizer_name"
                placeholder="How players should know you"
                value={formData.organizer_name}
                onChange={(e) => handleInputChange('organizer_name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="organizer_contact">Contact Info</Label>
              <Input
                id="organizer_contact"
                placeholder="Phone or email"
                value={formData.organizer_contact}
                onChange={(e) => handleInputChange('organizer_contact', e.target.value)}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 px-8"
            >
              {isSubmitting ? "Creating..." : "Create Game"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}