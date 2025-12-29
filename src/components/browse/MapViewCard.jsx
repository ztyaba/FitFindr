import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { X, MapPin, Star, DollarSign, Award, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * MapViewCard - Modern floating card for map view
 * Fades in when professional is selected, expands to show details
 */
export default function MapViewCard({ professional, onClose, initialExpanded = false }) {
  // Always start expanded - no collapsed view
  const [isExpanded, setIsExpanded] = useState(true);

  // Update expanded state when initialExpanded changes (e.g., when clicked from grid)
  useEffect(() => {
    setIsExpanded(true); // Always expanded
  }, [initialExpanded]);
  const profileUrl = createPageUrl(`ProfessionalProfile?id=${professional.id}`);

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const rateDisplay =
    typeof professional.hourly_rate === "number"
      ? currencyFormatter.format(professional.hourly_rate)
      : "--";

  if (!professional) return null;

  return (
    <AnimatePresence>
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
        className="absolute bottom-32 md:bottom-40 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-2rem)] md:w-full max-w-lg px-0 md:px-4"
      >
        <motion.div
          layout
          className="bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10"
        >
          {/* Close button - more modern placement and style */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-all shadow-lg backdrop-blur-md border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              {/* Profile Image with subtle overlay */}
              <div className="relative h-60 w-full overflow-hidden">
                {professional.profile_image ? (
                  <img
                    src={professional.profile_image}
                    alt={professional.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-indigo-900/40">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                      <span className="text-4xl font-bold text-white uppercase tracking-wider">
                        {professional.full_name.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Visual Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

                {/* Rating Badge - moved to bottom of image */}
                {professional.rating && (
                  <div className="absolute bottom-4 left-6 bg-blue-600/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-blue-400/30">
                    <Star className="w-4 h-4 fill-white text-white" />
                    <span className="text-sm font-bold text-white">
                      {professional.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-8">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-3xl font-extrabold text-white tracking-tight leading-none">
                        {professional.full_name}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-blue-400">
                          {rateDisplay === "--" ? "Contact" : rateDisplay}
                        </span>
                        {rateDisplay !== "--" && <span className="text-slate-400 text-sm font-medium">/hr</span>}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">
                          {professional.location.city}, {professional.location.state}
                        </span>
                      </div>
                      {professional.experience_years && (
                        <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="text-sm">{professional.experience_years} years exp.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Specialties - modern chip style */}
                  {Array.isArray(professional.specialties) && professional.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {professional.specialties.map((specialty) => (
                        <Badge
                          key={specialty}
                          variant="secondary"
                          className="text-xs font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1"
                        >
                          {specialty.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Bio - refined typography */}
                  {professional.bio && (
                    <p className="text-slate-300 leading-relaxed text-sm line-clamp-3 font-medium">
                      {professional.bio}
                    </p>
                  )}

                  {/* Certifications - subtle style */}
                  {professional.certifications && professional.certifications.length > 0 && (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span>
                        {professional.certifications.length} Professional Certification
                        {professional.certifications.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons - Premium styling */}
                  <div className="flex gap-4 pt-2">
                    <Link to={profileUrl} className="flex-[2]">
                      <Button className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]">
                        Book Now
                      </Button>
                    </Link>
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="flex-1 h-12 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 rounded-xl font-bold transition-all"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

