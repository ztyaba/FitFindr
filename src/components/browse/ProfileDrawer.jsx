import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, MessageSquare, MapPin, Star, DollarSign, Clock, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

/**
 * ProfileDrawer - Appears on hover next to grid items
 * Shows profile details with Call and Message buttons
 */
export default function ProfileDrawer({ professional, isOpen, onClose, position }) {
  if (!professional || !isOpen) return null;

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const rateDisplay =
    typeof professional.hourly_rate === "number"
      ? currencyFormatter.format(professional.hourly_rate)
      : "--";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 20, scale: 0.95 }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 400,
        }}
        className="fixed overflow-hidden z-[10000]"
        style={{
          left: position ? `${position.x + 20}px` : '0px',
          top: position ? `${position.y}px` : '0px',
          width: '380px',
          pointerEvents: 'none' // Makes it a pure non-blocking preview
        }}
      >
        <div className="relative bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.6)] p-6 overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-[64px] rounded-full" />

          <div className="relative flex items-start gap-5">
            {/* Profile Image */}
            <div className="relative flex-shrink-0">
              {professional.profile_image ? (
                <img
                  src={professional.profile_image}
                  alt={professional.full_name}
                  className="w-20 h-20 rounded-2xl object-cover border border-white/10 shadow-xl"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-blue-900/30 flex items-center justify-center border border-white/10 shadow-xl">
                  <span className="text-3xl font-black text-blue-400">
                    {professional.full_name?.charAt(0) || professional.name?.charAt(0) || "?"}
                  </span>
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#0f172a]" />
            </div>

            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-black text-white mb-1 truncate tracking-tight">
                {professional.full_name}
              </h3>
              <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-3">
                <MapPin className="w-3 h-3 text-blue-400" />
                <span>{professional.location?.city || "Unknown"}, {professional.location?.state || "Unknown"}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-black text-white">
                    {professional.rating?.toFixed(1) || "5.0"}
                  </span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-1 text-blue-400">
                  <span className="text-sm font-black tracking-tight">
                    {rateDisplay}/hr
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {/* Specialties */}
            {Array.isArray(professional.specialties) && professional.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {professional.specialties.slice(0, 3).map((specialty) => (
                  <Badge
                    key={specialty}
                    variant="secondary"
                    className="bg-white/5 text-slate-300 border-white/5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1"
                  >
                    {String(specialty).replace(/_/g, " ")}
                  </Badge>
                ))}
                {professional.specialties.length > 3 && (
                  <span className="text-[10px] font-bold text-slate-500 self-center">
                    +{professional.specialties.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Bio Preview */}
            {professional.bio && (
              <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 font-medium">
                {professional.bio}
              </p>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-600/10 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                  {professional.experience_years || "5+"} Years Exp.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-600/10 rounded-lg">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter text-nowrap">
                  Certified Pro
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

