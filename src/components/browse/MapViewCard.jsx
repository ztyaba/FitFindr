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
      <div className="fixed md:absolute bottom-[calc(15vh+1.5rem)] md:bottom-40 inset-x-0 z-[210] flex justify-center pointer-events-none px-4">
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
          className="w-full max-w-lg pointer-events-auto"
        >
          <motion.div
            layout
            className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10"
          >
            {/* Close button - High visibility */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-[30] p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all shadow-lg backdrop-blur-md border border-white/20"
              aria-label="Close professional card"
            >
              <X className="w-6 h-6" />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                {/* Profile Header with Gradient */}
                <div className="relative h-40 bg-gradient-to-br from-blue-900/60 to-indigo-900/60 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

                  {/* Profile Info in Header */}
                  <div className="absolute bottom-6 left-6 flex items-center gap-4 pr-12">
                    <div className="relative shrink-0">
                      {professional.profile_image ? (
                        <img
                          src={professional.profile_image}
                          alt={professional.full_name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-2xl"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-blue-600/30 flex items-center justify-center border-2 border-white/20 shadow-2xl backdrop-blur-md">
                          <span className="text-2xl font-black text-white">
                            {professional.full_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#0f172a]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-2xl font-black text-white tracking-tight leading-tight truncate">
                        {professional.full_name}
                      </h3>
                      <div className="flex items-center gap-2 text-blue-300 font-bold uppercase text-[10px] tracking-widest">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{professional.location.city}, {professional.location.state}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-5">
                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-slate-300">
                      <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      </div>
                      <span className="text-sm font-bold">{professional.rating?.toFixed(1) || "5.0"} Rating</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                        <DollarSign className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-sm font-black text-white">{rateDisplay}/hr</span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2">
                    {professional.specialties.slice(0, 3).map((specialty) => (
                      <Badge
                        key={specialty}
                        variant="secondary"
                        className="text-xs font-bold uppercase tracking-widest bg-blue-600/10 text-blue-400 border border-blue-600/20 px-3 py-1"
                      >
                        {specialty.replace(/_/g, " ")}
                      </Badge>
                    ))}
                    {professional.specialties.length > 3 && (
                      <span className="text-[10px] font-bold text-slate-500 self-center">
                        +{professional.specialties.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Bio Preview */}
                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 font-medium">
                    {professional.bio}
                  </p>

                  {/* Action Buttons */}
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
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
