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
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md overflow-hidden">
        <CardContent className="p-0">
          {/* Profile Image */}
          <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
            {professional.profile_image ? (
              <img
                src={professional.profile_image}
                alt={professional.full_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-2xl font-bold text-emerald-600">
                    {professional.full_name.charAt(0)}
                  </span>
                </div>
              </div>
            )}
            
            {/* Rating Badge */}
            {professional.rating && (
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-slate-700">
                  {professional.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <div className="p-6">
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                {professional.full_name}
              </h3>
              
              <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {professional.location.city}, {professional.location.state}
                </div>
                {professional.experience_years && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {professional.experience_years} years
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span className="text-2xl font-bold text-slate-900">
                  ${professional.hourly_rate}
                </span>
                <span className="text-slate-600">/hour</span>
              </div>
            </div>

            {/* Specialties */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {professional.specialties.slice(0, 3).map((specialty) => (
                  <Badge
                    key={specialty}
                    variant="secondary"
                    className={`text-xs ${SPECIALTY_COLORS[specialty] || "bg-gray-100 text-gray-800"}`}
                  >
                    {specialty.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
                {professional.specialties.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{professional.specialties.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Bio Preview */}
            {professional.bio && (
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {professional.bio}
              </p>
            )}

            {/* Certifications */}
            {professional.certifications && professional.certifications.length > 0 && (
              <div className="flex items-center gap-1 mb-4 text-sm text-slate-600">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>{professional.certifications.length} certification{professional.certifications.length !== 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Action Button */}
            <Link to={profileUrl} className="block">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5">
                View Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}