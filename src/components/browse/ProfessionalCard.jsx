import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin, Star, DollarSign, Award, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SPECIALTY_COLORS = {
  personal_training: "bg-blue-100 text-blue-800",
  yoga: "bg-purple-100 text-purple-800",
  pilates: "bg-pink-100 text-pink-800",
  crossfit: "bg-red-100 text-red-800",
  nutrition: "bg-green-100 text-green-800",
  weight_loss: "bg-blue-100 text-blue-800",
  strength_training: "bg-gray-100 text-gray-800",
  cardio: "bg-cyan-100 text-cyan-800",
  rehabilitation: "bg-teal-100 text-teal-800",
  sports_conditioning: "bg-indigo-100 text-indigo-800",
  group_fitness: "bg-lime-100 text-lime-800",
  martial_arts: "bg-slate-100 text-slate-800",
};

export default function ProfessionalCard({ professional, index }) {
  const profileUrl = createPageUrl(`ProfessionalProfile?id=${professional.id}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Card className="h-full bg-slate-900 border border-white/5 hover:border-blue-500/30 transition-all duration-500 shadow-xl hover:shadow-[0_20px_50px_-12px_rgba(59,130,246,0.3)] overflow-hidden group">
        <CardContent className="p-0">
          {/* Profile Image with modern hover */}
          <div className="relative h-56 bg-slate-800 overflow-hidden">
            {professional.profile_image ? (
              <img
                src={professional.profile_image}
                alt={professional.full_name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-indigo-900/40">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                  <span className="text-3xl font-bold text-white">
                    {professional.full_name.charAt(0)}
                  </span>
                </div>
              </div>
            )}

            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

            {/* Price Tag - Floating on image */}
            <div className="absolute top-4 left-4 bg-blue-600 px-3 py-1.5 rounded-lg shadow-lg border border-blue-400/30">
              <span className="text-sm font-bold text-white">${professional.hourly_rate}</span>
              <span className="text-[10px] text-blue-100 font-medium ml-1">/hr</span>
            </div>

            {/* Rating Badge */}
            {professional.rating && (
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-bold text-white">
                  {professional.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col h-[calc(100%-14rem)]">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors tracking-tight">
                {professional.full_name}
              </h3>

              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-400 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  {professional.location.city}, {professional.location.state}
                </div>
                {professional.experience_years && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    {professional.experience_years} years exp.
                  </div>
                )}
              </div>

              {/* Specialties - Horizontal scrollable or wrap */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {professional.specialties.slice(0, 3).map((specialty) => (
                  <Badge
                    key={specialty}
                    variant="secondary"
                    className="text-[10px] uppercase font-bold tracking-wider bg-white/5 text-slate-300 border border-white/10"
                  >
                    {specialty.replace(/_/g, ' ')}
                  </Badge>
                ))}
                {professional.specialties.length > 3 && (
                  <Badge variant="outline" className="text-[10px] bg-transparent border-white/5 text-slate-500">
                    +{professional.specialties.length - 3}
                  </Badge>
                )}
              </div>

              {/* Bio Preview - Better line clamping */}
              {professional.bio && (
                <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                  {professional.bio}
                </p>
              )}
            </div>

            {/* Footer Action */}
            <div className="mt-auto flex items-center justify-between gap-4">
              <Link to={profileUrl} className="flex-1">
                <Button className="w-full h-11 bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/10 hover:border-white/20 rounded-xl font-bold transition-all text-sm group-hover:bg-blue-600 group-hover:border-blue-500">
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}