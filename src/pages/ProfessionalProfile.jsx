import React, { useState, useEffect } from "react";
import { FitnessProfessional } from "@/api/entities";
import { ArrowLeft, MapPin, Star, DollarSign, Award, Clock, Phone, Mail, Globe, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

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

export default function ProfessionalProfile() {
  const navigate = useNavigate();
  const [professional, setProfessional] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const professionalId = urlParams.get('id');
    
    if (professionalId) {
      loadProfessional(professionalId);
    } else {
      navigate(createPageUrl("Browse"));
    }
  }, [navigate]);

  const loadProfessional = async (id) => {
    setIsLoading(true);
    try {
      const professionals = await FitnessProfessional.list();
      const found = professionals.find(p => p.id === id);
      setProfessional(found);
    } catch (error) {
      console.error("Error loading professional:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading professional...</p>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Professional Not Found</h2>
          <p className="text-slate-600 mb-6">
            The fitness professional you're looking for doesn't exist or has been removed.
          </p>
          <Button 
            onClick={() => navigate(createPageUrl("Browse"))}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  const handleContact = (method, value) => {
    switch (method) {
      case 'phone':
        window.open(`tel:${value}`);
        break;
      case 'email':
        window.open(`mailto:${value}`);
        break;
      case 'website':
        window.open(value, '_blank');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Browse"))}
            className="text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>

          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {/* Profile Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-1"
            >
              <div className="relative w-64 h-64 mx-auto lg:mx-0">
                {professional.profile_image ? (
                  <img
                    src={professional.profile_image}
                    alt={professional.full_name}
                    className="w-full h-full object-cover rounded-2xl shadow-2xl"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-2xl flex items-center justify-center">
                    <span className="text-6xl font-bold text-white">
                      {professional.full_name.charAt(0)}
                    </span>
                  </div>
                )}
                {professional.rating && (
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-slate-900">{professional.rating.toFixed(1)}</span>
                    {professional.reviews_count && (
                      <span className="text-slate-600 text-sm">({professional.reviews_count})</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Profile Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 text-center lg:text-left"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                {professional.full_name}
              </h1>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6 text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {professional.location.city}, {professional.location.state}
                </div>
                {professional.experience_years && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {professional.experience_years} years experience
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                  <span className="text-3xl font-bold">${professional.hourly_rate}</span>
                  <span className="text-slate-300">/hour</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
                {professional.specialties.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant="secondary"
                    className="bg-white/10 text-white border-white/20 backdrop-blur-sm"
                  >
                    {specialty.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
              </div>

              {/* Contact Buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                {professional.phone && (
                  <Button
                    onClick={() => handleContact('phone', professional.phone)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                )}
                {professional.email && (
                  <Button
                    variant="secondary"
                    onClick={() => handleContact('email', professional.email)}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                )}
                {professional.website && (
                  <Button
                    variant="outline"
                    onClick={() => handleContact('website', professional.website)}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            {professional.bio && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-2xl text-slate-900">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 leading-relaxed text-lg">{professional.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Specialties */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-2xl text-slate-900">Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {professional.specialties.map((specialty) => (
                      <div
                        key={specialty}
                        className={`p-4 rounded-xl text-center ${
                          SPECIALTY_COLORS[specialty] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <div className="font-medium">
                          {specialty.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Certifications */}
            {professional.certifications && professional.certifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-2xl text-slate-900 flex items-center gap-2">
                      <Award className="w-6 h-6 text-emerald-600" />
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {professional.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                          <Award className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <span className="font-medium text-slate-900">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {professional.phone && (
                    <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                         onClick={() => handleContact('phone', professional.phone)}>
                      <Phone className="w-5 h-5 text-emerald-600" />
                      <span className="text-slate-900">{professional.phone}</span>
                    </div>
                  )}
                  {professional.email && (
                    <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                         onClick={() => handleContact('email', professional.email)}>
                      <Mail className="w-5 h-5 text-emerald-600" />
                      <span className="text-slate-900">{professional.email}</span>
                    </div>
                  )}
                  {professional.website && (
                    <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                         onClick={() => handleContact('website', professional.website)}>
                      <Globe className="w-5 h-5 text-emerald-600" />
                      <span className="text-slate-900">Visit Website</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Availability */}
            {professional.availability && professional.availability.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                        <div key={day} className="flex justify-between items-center py-2">
                          <span className="font-medium text-slate-900 capitalize">{day}</span>
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            professional.availability.includes(day)
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {professional.availability.includes(day) ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {professional.location.address && (
                      <p className="text-slate-900">{professional.location.address}</p>
                    )}
                    <p className="text-slate-900">
                      {professional.location.city}, {professional.location.state}
                    </p>
                    {professional.location.zip_code && (
                      <p className="text-slate-600">{professional.location.zip_code}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}