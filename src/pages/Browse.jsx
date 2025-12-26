
import React, { useState, useEffect, useCallback } from "react";
import { FitnessProfessional } from "@/api/entities";
import { MapPin, Filter, Grid, Map, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

import SearchFilters from "../components/browse/SearchFilters";
import ProfessionalCard from "../components/browse/ProfessionalCard";
import MapView from "../components/browse/MapView";
import LoadingState from "../components/browse/LoadingState";

export default function Browse() {
  const [professionals, setProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState("grid");
  const [filters, setFilters] = useState({
    specialties: [],
    priceRange: [0, 200],
    location: "",
    rating: 0
  });

  const loadProfessionals = async () => {
    setIsLoading(true);
    try {
      const data = await FitnessProfessional.list("-rating", 50);
      setProfessionals(data);
    } catch (error) {
      console.error("Error loading professionals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = professionals;

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prof => 
        prof.full_name.toLowerCase().includes(query) ||
        prof.specialties.some(spec => spec.toLowerCase().includes(query)) ||
        prof.location.city.toLowerCase().includes(query) ||
        prof.location.state.toLowerCase().includes(query)
      );
    }

    // Specialties filter
    if (filters.specialties.length > 0) {
      filtered = filtered.filter(prof => 
        filters.specialties.some(spec => prof.specialties.includes(spec))
      );
    }

    // Price range filter
    filtered = filtered.filter(prof => 
      prof.hourly_rate >= filters.priceRange[0] && 
      prof.hourly_rate <= filters.priceRange[1]
    );

    // Location filter
    if (filters.location.trim()) {
      const location = filters.location.toLowerCase();
      filtered = filtered.filter(prof => 
        prof.location.city.toLowerCase().includes(location) ||
        prof.location.state.toLowerCase().includes(location)
      );
    }

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(prof => prof.rating >= filters.rating);
    }

    setFilteredProfessionals(filtered);
  }, [professionals, searchQuery, filters]); // Dependencies for useCallback

  useEffect(() => {
    loadProfessionals();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]); // Dependency for useEffect: re-run when applyFilters changes

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent"
            >
              Find Your Perfect
              <span className="block">Fitness Professional</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-300 mb-8"
            >
              Connect with certified trainers, nutritionists, and wellness experts in your area
            </motion.p>
            
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl mx-auto flex gap-3"
            >
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search by name, specialty, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-white/10 border-white/20 text-white placeholder-slate-300 backdrop-blur-sm"
                />
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="secondary"
                className="h-14 px-6 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <SearchFilters
            filters={filters}
            setFilters={setFilters}
            onClose={() => setShowFilters(false)}
          />
        )}
      </AnimatePresence>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeView} onValueChange={setActiveView}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {filteredProfessionals.length} Professionals Found
              </h2>
              {searchQuery && (
                <p className="text-slate-600 mt-1">
                  Results for "{searchQuery}"
                </p>
              )}
            </div>
            
            <TabsList className="bg-slate-100 rounded-lg p-1 grid grid-cols-2 gap-1">
              <TabsTrigger value="grid" className="flex items-center gap-2 data-[state=active]:bg-white">
                <Grid className="w-4 h-4" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2 data-[state=active]:bg-white">
                <Map className="w-4 h-4" />
                Map
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grid" className="mt-0">
            {isLoading ? (
              <LoadingState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredProfessionals.map((professional, index) => (
                    <ProfessionalCard
                      key={professional.id}
                      professional={professional}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
            
            {!isLoading && filteredProfessionals.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No professionals found</h3>
                <p className="text-slate-600 max-w-sm mx-auto">
                  Try adjusting your search criteria or filters to find fitness professionals in your area.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <MapView professionals={filteredProfessionals} />
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
