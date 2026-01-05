import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { FitnessProfessional } from "@/api/entities";
import { MapPin, Filter, Grid, Search, X, Users, Zap, Calendar, Star, Sparkles, SlidersHorizontal, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getProfessionalColor } from "@/lib/utils";

import SearchFilters from "../components/browse/SearchFilters";
import MapView from "../components/browse/MapView";
import LoadingState from "../components/browse/LoadingState";
import ProfileDrawer from "../components/browse/ProfileDrawer";
import { Drawer as VaulDrawer } from "vaul";
import LampDemo from "@/components/lamp-demo";

const MOBILE_DRAWER_SNAP_POINTS = [0.25, 0.5, 0.9];

/**
 * Browse Page - Full-screen map overlay UI
 * Map immediately shows over entire screen
 * Floating header with navigation tabs
 * Toggle button for grid view overlay
 */
export default function Browse() {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/99b4f91f-a089-4227-b05d-f4392b5d7598', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Browse.jsx:20', message: 'Browse component mounted', data: { timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
  // #endregion

  // Existing data state (preserved)
  const [professionals, setProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewportBounds, setViewportBounds] = useState(null);
  const [filters, setFilters] = useState({
    specialties: [],
    priceRange: [0, 200],
    location: "",
    rating: 0
  });

  const location = useLocation();
  const navigate = useNavigate();
  const gridCardRefs = useRef({});
  const scrollContainerRef = useRef(null);
  const zoomToProfessionalRef = useRef(null);
  const showAllRef = useRef(null);
  const [hoveredProfessional, setHoveredProfessional] = useState(null);
  const [tappedProfessional, setTappedProfessional] = useState(null);
  const [drawerPosition, setDrawerPosition] = useState({ x: 0, y: 0 });
  const [selectedProfessionalForCard, setSelectedProfessionalForCard] = useState(null);
  const [isShowAllMode, setIsShowAllMode] = useState(true); // Start in show all mode
  const [layoutMode, setLayoutMode] = useState("map"); // "map" or "grid"
  const [activeDrawerSnap, setActiveDrawerSnap] = useState(MOBILE_DRAWER_SNAP_POINTS[0]);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );

  // Auto-hide tapped professional tooltip after 5 seconds (mobile)
  useEffect(() => {
    if (tappedProfessional && isMobile) {
      const timer = setTimeout(() => {
        setTappedProfessional(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [tappedProfessional, isMobile]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset drawer to starting position on mount
  useEffect(() => {
    if (isMobile) {
      setActiveDrawerSnap(MOBILE_DRAWER_SNAP_POINTS[0]);
    }
  }, [isMobile]);

  // Navigation items for header
  const navigationItems = [
    {
      title: "Find Professionals",
      url: createPageUrl("Browse"),
      icon: Users,
    },
    {
      title: "FitFindr Versus",
      url: createPageUrl("Versus"),
      icon: Zap,
    },
    {
      title: "My Calendar",
      url: createPageUrl("Calendar"),
      icon: Calendar,
    },
    {
      title: "FitFindr AI",
      url: createPageUrl("FitFindr AI"),
      icon: Sparkles,
    },
  ];

  const loadProfessionals = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/99b4f91f-a089-4227-b05d-f4392b5d7598', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Browse.jsx:58', message: 'loadProfessionals called', data: { timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion
    setIsLoading(true);
    try {
      const data = await FitnessProfessional.list("-rating", 50);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/99b4f91f-a089-4227-b05d-f4392b5d7598', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Browse.jsx:63', message: 'Professionals loaded', data: { count: data?.length || 0, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion
      setProfessionals(data);
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/99b4f91f-a089-4227-b05d-f4392b5d7598', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Browse.jsx:67', message: 'Error loading professionals', data: { error: String(error), timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
      // #endregion
      console.error("Error loading professionals:", error);
    } finally {
      setIsLoading(false);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/99b4f91f-a089-4227-b05d-f4392b5d7598', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Browse.jsx:72', message: 'Loading finished', data: { isLoading: false, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = professionals;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prof =>
        prof.full_name.toLowerCase().includes(query) ||
        prof.specialties.some(spec => spec.toLowerCase().includes(query)) ||
        prof.location.city.toLowerCase().includes(query) ||
        prof.location.state.toLowerCase().includes(query)
      );
    }

    if (filters.specialties.length > 0) {
      filtered = filtered.filter(prof =>
        filters.specialties.some(spec => prof.specialties.includes(spec))
      );
    }

    filtered = filtered.filter(prof =>
      prof.hourly_rate >= filters.priceRange[0] &&
      prof.hourly_rate <= filters.priceRange[1]
    );

    if (filters.location.trim()) {
      const location = filters.location.toLowerCase();
      filtered = filtered.filter(prof =>
        prof.location.city.toLowerCase().includes(location) ||
        prof.location.state.toLowerCase().includes(location)
      );
    }

    if (filters.rating > 0) {
      filtered = filtered.filter(prof => prof.rating >= filters.rating);
    }

    setFilteredProfessionals(filtered);
  }, [professionals, searchQuery, filters]);

  useEffect(() => {
    loadProfessionals();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Filter professionals visible in current map viewport
  const visibleProfessionals = useMemo(() => {
    if (!viewportBounds) return filteredProfessionals;

    return filteredProfessionals.filter(prof => {
      if (!prof.location?.latitude || !prof.location?.longitude) return false;
      const lat = prof.location.latitude;
      const lng = prof.location.longitude;

      // Check if professional is within viewport bounds
      return (
        lat >= viewportBounds.south &&
        lat <= viewportBounds.north &&
        lng >= viewportBounds.west &&
        lng <= viewportBounds.east
      );
    });
  }, [filteredProfessionals, viewportBounds]);

  // Handle viewport changes from map
  const handleViewportChange = useCallback((bounds) => {
    setViewportBounds(bounds);
    // Detect if we're zoomed in (not in show all mode) based on bounds size
    // If bounds are small (zoomed in), exit show all mode
    const latRange = bounds.north - bounds.south;
    const lngRange = bounds.east - bounds.west;
    // If the viewport is small (zoomed in), we're not in show all mode
    if (latRange < 5 || lngRange < 5) {
      setIsShowAllMode(false);
    } else {
      // If zoomed out (large bounds), enter show all mode and close any open cards
      setIsShowAllMode(true);
      setSelectedProfessionalForCard(null);
    }
  }, []);

  // Handle professional card click - zoom to their location and open profile card
  const handleProfessionalClick = useCallback((professional) => {
    // Hide drawer when clicking
    setHoveredProfessional(null);
    // Exit show all mode when zooming to a specific professional
    setIsShowAllMode(false);
    if (isMobile) {
      setActiveDrawerSnap(MOBILE_DRAWER_SNAP_POINTS[0]);
    }

    if (zoomToProfessionalRef.current) {
      zoomToProfessionalRef.current(professional);
    }
    // Open the profile card in expanded view
    setSelectedProfessionalForCard(professional);
  }, []);

  const handleMarkerSelect = useCallback(() => {
    setIsShowAllMode(false);
    setSelectedProfessionalForCard(null);
    if (isMobile) {
      setActiveDrawerSnap(MOBILE_DRAWER_SNAP_POINTS[0]);
    }
  }, [isMobile]);

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/99b4f91f-a089-4227-b05d-f4392b5d7598', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Browse.jsx:152', message: 'Browse render called', data: { isLoading, filteredCount: filteredProfessionals.length, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
  // #endregion

  const isMapLayout = layoutMode === "map";

  const renderFloatingHeader = () => (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.2 }}
      className="absolute top-6 left-1/2 -translate-x-1/2 z-[220] w-auto"
    >
      <nav
        className="flex items-center gap-1 p-1.5 bg-slate-900/80 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl"
        aria-label="Primary"
      >
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.title}
              to={item.url}
              aria-label={item.title}
              className={`relative ${isMobile ? "px-3 py-2" : "px-5 py-2.5"} rounded-[2rem] text-[10px] md:text-sm font-black tracking-widest transition-all duration-300 flex items-center gap-2 ${isActive
                ? "text-white bg-blue-600 shadow-lg shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span className="sr-only">{item.title}</span>
              <span className="hidden md:inline">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </motion.header>
  );



  const renderMobileDrawer = () => {
    if (!isMobile) return null;

    return (
      <div className="absolute inset-0 pointer-events-none z-[160]">
        <VaulDrawer.Root
          open
          modal={false}
          dismissible={false}
          snapPoints={MOBILE_DRAWER_SNAP_POINTS}
          activeSnapPoint={activeDrawerSnap}
          setActiveSnapPoint={setActiveDrawerSnap}
        >
          <VaulDrawer.Content className="fixed bottom-0 left-0 right-0 max-h-[92vh] outline-none flex flex-col z-[190] pointer-events-auto">
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="flex-1 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-t-[2.5rem] shadow-2xl flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]"
            >
              <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 px-5 pt-2 pb-3">
                <div className="flex items-center justify-center">
                  <div className="drawer-handle shadow-sm" />
                </div>

                <div className="mt-3 relative flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">
                      Find a Pro
                    </p>
                    <span className="text-slate-700 mx-1">•</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-black text-blue-400">
                        {visibleProfessionals.length}
                      </span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        In View
                      </span>
                    </div>
                  </div>
                  <div className="absolute right-0">
                    <Button
                      onClick={() => setShowFilters(true)}
                      variant="ghost"
                      className="h-10 w-10 rounded-[2rem] bg-white/5 border border-white/10 text-white hover:bg-white/10"
                    >
                      <Filter className="w-4 h-4 text-blue-400" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pt-3 pb-[calc(6rem+env(safe-area-inset-bottom))] no-scrollbar">
                {visibleProfessionals.length === 0 ? (
                  <div className="text-center py-14 opacity-60">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Move map to discover
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {visibleProfessionals.map((professional, index) => (
                      <motion.button
                        type="button"
                        key={professional.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300, delay: index * 0.03 }}
                        onClick={() => handleProfessionalClick(professional)}
                        className="text-left rounded-[2rem] border border-white/10 bg-white/5 p-2.5 flex flex-col gap-3 transition-all duration-300 hover:bg-white/10 active:scale-[0.98]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="relative">
                            {professional.profile_image ? (
                              <img
                                src={professional.profile_image}
                                alt={professional.full_name}
                                className="w-10 h-10 rounded-[2rem] object-cover border border-white/10 shadow-lg"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-[2rem] bg-blue-900/20 flex items-center justify-center border border-white/10">
                                <span className="text-base font-black text-blue-400">
                                  {professional.full_name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div
                              className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0f172a]"
                              style={{ backgroundColor: getProfessionalColor(professional.id) }}
                            />
                          </div>
                          {professional.rating && (
                            <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-[2rem] border border-white/10">
                              <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                              <span className="text-[9px] font-black text-white">
                                {professional.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="text-[11px] font-black text-white leading-tight line-clamp-2">
                            {professional.full_name}
                          </h3>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {professional.location.city}
                          </p>
                        </div>

                        <div className="mt-auto flex items-center justify-between">
                          <span className="text-[12px] font-black text-blue-400">
                            ${professional.hourly_rate}
                          </span>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            /hr
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </VaulDrawer.Content>
        </VaulDrawer.Root>
      </div>
    );
  };

  return (
    <div
      className={`${isMapLayout ? "fixed inset-0 w-screen h-screen overflow-hidden" : "min-h-screen bg-slate-950 text-white relative"}`}
      style={isMapLayout ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0f172a',
        zIndex: 9999,
        visibility: 'visible',
        display: 'block'
      } : {}}
    >
      {isMapLayout ? (
        <>
          {/* Full-screen Map - Always visible in Map mode */}
          <div className="absolute inset-0" style={{ width: '100%', height: '100%', zIndex: 0 }}>
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                <LoadingState />
              </div>
            ) : (
              <div className="w-full h-full" style={{ width: '100%', height: '100%', minHeight: '100vh' }}>
                <MapView
                  professionals={filteredProfessionals}
                  onViewportChange={handleViewportChange}
                  onZoomToProfessional={zoomToProfessionalRef}
                  onShowAllReady={showAllRef}
                  selectedProfessional={selectedProfessionalForCard}
                  onCloseCard={() => {
                    setSelectedProfessionalForCard(null);
                    if (showAllRef.current && showAllRef.current.resetView) {
                      showAllRef.current.resetView();
                      setIsShowAllMode(true);
                      if (isMobile) {
                        setActiveDrawerSnap(MOBILE_DRAWER_SNAP_POINTS[0]);
                      }
                    }
                  }}
                  onMarkerClick={handleMarkerSelect}
                  isShowAllMode={isShowAllMode}
                />
              </div>
            )}
          </div>


          {/* Left Panel - Professionals in View (Desktop) */}
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.5 }}
            className="absolute left-6 top-6 bottom-6 w-96 hidden md:block"
            style={{ zIndex: 100 }}
          >
            <div className="h-full overflow-hidden flex flex-col rounded-3xl"
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(24px) saturate(160%)',
                WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Panel Header - Refined Design */}
              <div className="p-6 border-b border-white/10">
                {/* Logo Section */}
                <div className="flex items-center justify-between mb-6">
                  <Link to="/" className="flex items-center group">
                    <img
                      src="/landing/assets/images/logos/Logo4.png"
                      alt="FitFindr Logo"
                      className="h-10 w-auto object-contain transition-all duration-300 transform group-hover:scale-105"
                    />
                  </Link>
                  <Button
                    onClick={() => setLayoutMode("grid")}
                    size="sm"
                    className="bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest px-4"
                  >
                    <Grid className="w-4 h-4 mr-2 text-blue-400" />
                    Grid View
                  </Button>
                </div>

                {/* Title Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    Trainers In Your Area
                  </h3>
                  <div className="flex items-center justify-between gap-3 p-1 pl-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-white">
                        {visibleProfessionals.length}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Found
                      </span>
                    </div>
                    {/* Reset button removed as X on card now handles it */}
                  </div>
                </div>
              </div>

              {/* Scrollable List */}
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto overscroll-contain professional-panel-scroll p-4 space-y-4"
              >
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <LoadingState />
                  </div>
                ) : visibleProfessionals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                      <MapPin className="w-8 h-8 text-slate-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-400">
                      {viewportBounds
                        ? "No professionals in this area"
                        : "Zoom out to see more pros"}
                    </p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {visibleProfessionals.map((professional, index) => (
                      <motion.div
                        key={professional.id}
                        ref={(el) => {
                          if (el) gridCardRefs.current[professional.id] = el;
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.05
                        }}
                        layout
                        className="group"
                      >
                        <div
                          className="rounded-2xl p-4 transition-all duration-300 cursor-pointer relative border border-transparent hover:border-white/20 hover:bg-white/5 active:scale-[0.98]"
                          onClick={() => handleProfessionalClick(professional)}
                          onMouseEnter={(e) => {
                            if (!isMobile && isShowAllMode) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setDrawerPosition({ x: rect.right, y: rect.top });
                              setHoveredProfessional(professional.id);
                            }
                          }}
                          onMouseLeave={() => {
                            if (!isMobile) {
                              setHoveredProfessional(null);
                            }
                          }}
                        >
                          <div className="flex items-center gap-4">
                            {/* Avatar - More modern */}
                            <div className="relative">
                              {professional.profile_image ? (
                                <img
                                  src={professional.profile_image}
                                  alt={professional.full_name}
                                  className="w-14 h-14 rounded-xl object-cover border border-white/10 shadow-lg"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-700/20 to-blue-900/20 flex items-center justify-center border border-blue-500/20 shadow-lg">
                                  <span className="text-xl font-black text-blue-400">
                                    {professional.full_name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              {/* Online indicator or color code */}
                              <div
                                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0f172a] shadow-sm"
                                style={{ backgroundColor: getProfessionalColor(professional.id) }}
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-white truncate text-base mb-1 group-hover:text-blue-400 transition-colors">
                                {professional.full_name}
                              </h4>
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                                <span>{professional.location.city}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                <span className="text-blue-500">${professional.hourly_rate}/hr</span>
                              </div>
                            </div>

                            {/* Rating */}
                            {professional.rating && (
                              <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs font-black text-white">
                                  {professional.rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>


          {renderMobileDrawer()}

          {/* Profile Drawer - Appears on hover next to grid items (only in show all mode) */}
          {!isMobile && hoveredProfessional && isShowAllMode && !selectedProfessionalForCard && (
            <ProfileDrawer
              professional={visibleProfessionals.find(p => p.id === hoveredProfessional)}
              isOpen={!!hoveredProfessional}
              onClose={() => setHoveredProfessional(null)}
              position={drawerPosition}
            />
          )}

          {renderFloatingHeader()}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.2 }}
              className="absolute top-6 left-6 z-[220]"
            >
              <div className="h-16 w-16 rounded-[2.25rem] bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-center">
                <img
                  src="/landing/assets/images/logos/Logo4.png"
                  alt="FitFindr"
                  className="h-9 w-auto object-contain"
                />
              </div>
            </motion.div>
          )}


          {/* Floating Search Bar - Bottom Center (Desktop) */}
          {!isMobile && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.3 }}
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-[100] w-[calc(100%-3rem)] md:w-auto md:min-w-[600px]"
            >
              <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] border border-white/10 p-2 flex items-center gap-2 group">
                <div className="flex-1 relative flex items-center px-4">
                  <Search className="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    placeholder="Search by name, city, or specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white font-medium placeholder:text-slate-500 text-lg ml-0"
                  />
                </div>
                <div className="h-10 w-px bg-white/10 mx-2" />
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="ghost"
                  className="h-14 px-8 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 flex items-center gap-3 transition-all border border-white/5"
                >
                  <Filter className="w-5 h-5 text-blue-400" />
                  <span>Filters</span>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Mobile Floating Action Search Button removed */}


        </>
      ) : (
        <div className="min-h-screen bg-slate-950 overflow-x-hidden">
          {/* Sticky Top Header for Grid View */}
          <header className="sticky top-0 z-[200] w-full bg-slate-900/50 backdrop-blur-xl border-b border-white/10 px-8 h-20 flex items-center">
            <div className="flex-1">
              <Link to="/" className="flex items-center gap-3 group">
                <img src="/landing/assets/images/logos/Logo4.png" alt="FitFindr Logo" className="h-10 w-auto object-contain transition-all duration-300 transform group-hover:scale-110" />
              </Link>
            </div>

            <div className="flex-1 flex justify-center">
              <Button
                onClick={() => setLayoutMode("map")}
                variant="outline"
                className="h-11 px-8 rounded-xl bg-white/5 border-white/10 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/10 flex items-center gap-2 transition-all active:scale-95"
              >
                <MapIcon className="w-4 h-4 text-emerald-400" />
                View Map
              </Button>
            </div>

            <div className="flex-1 flex justify-end">
              <nav className="flex items-center gap-2 bg-white/5 rounded-2xl p-1 border border-white/10">
                {navigationItems.map((item) => {
                  const isActive = item.url.includes("Browse");
                  return (
                    <Link key={item.title} to={item.url}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-11 px-6 rounded-xl flex items-center gap-2 transition-all duration-300 ${isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                          }`}
                      >
                        <item.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                        <span className="text-xs font-black uppercase tracking-widest">{item.title}</span>
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </header>

          <section className="relative min-h-[400px] flex flex-col items-center justify-center pt-4">
            <LampDemo>
              <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-white text-slate-950 text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  <Sparkles className="w-4 h-4" />
                  Elite Training Network
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-6xl md:text-8xl font-black mb-8 text-white tracking-tighter"
                >
                  FitFindr
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                    Browse
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed"
                >
                  Discover vetted trainers, coaches, and athletes tailored to your goals.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap items-center justify-center gap-4"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setLayoutMode("map")}
                    className="h-16 px-10 bg-white/5 border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-sm rounded-[2rem] backdrop-blur-md active:scale-95 transition-all mx-auto"
                  >
                    <MapPin className="w-5 h-5 mr-3 text-emerald-400" />
                    View Map
                  </Button>
                </motion.div>
              </div>
            </LampDemo>
          </section>

          <section className="max-w-7xl mx-auto px-6 pt-0 pb-32">
            <div className="flex flex-col lg:flex-row justify-end items-start lg:items-center gap-8 mb-16">

              <div className="flex w-full lg:w-auto gap-3">
                <div className="relative flex-1 min-w-[320px] group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    placeholder="Search name, city, specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-16 pl-14 bg-white/5 border-white/10 rounded-[2rem] text-white placeholder:text-slate-500 focus:border-blue-500/50 transition-all font-medium"
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(true)}
                  variant="outline"
                  className="h-16 w-16 rounded-[2rem] bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <SlidersHorizontal className="w-6 h-6 text-blue-400" />
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-96 bg-white/5 rounded-[2.5rem] animate-pulse" />
                ))}
              </div>
            ) : filteredProfessionals.length === 0 ? (
              <div className="py-32 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <Users className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-white mb-2">No Professionals Found</h3>
                <p className="text-slate-400 max-w-sm mx-auto">Try adjusting your filters or search criteria to find experts.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProfessionals.map((professional) => (
                  <motion.div
                    key={professional.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:bg-white/10 transition-all duration-500 cursor-pointer"
                    onClick={() => {
                      setSelectedProfessionalForCard(professional);
                    }}
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      {professional.profile_image ? (
                        <img src={professional.profile_image} alt={professional.full_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <span className="text-4xl font-black text-slate-700">{professional.full_name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                      <div className="absolute top-6 left-6 flex gap-2">
                        {professional.specialties.slice(0, 2).map(spec => (
                          <div key={spec} className="bg-blue-600/80 backdrop-blur-md text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white">
                            {spec}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">
                            {professional.full_name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                            <MapPin className="w-3 h-3 text-blue-500" />
                            {professional.location.city}, {professional.location.state}
                          </div>
                        </div>
                        {professional.rating && (
                          <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-black text-white">{professional.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-1">
                          <span className="text-2xl font-black text-white">${professional.hourly_rate}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">/ hr</span>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(createPageUrl(`ProfessionalProfile?id=${professional.id}`));
                          }}
                          className="rounded-xl bg-blue-600 border border-blue-500 text-white font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all"
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Profile Drawer Component */}
      <ProfileDrawer
        professional={selectedProfessionalForCard}
        onClose={() => {
          setSelectedProfessionalForCard(null);
          if (isMobile) {
            setActiveDrawerSnap(MOBILE_DRAWER_SNAP_POINTS[0]);
          }
        }}
      />

      {/* Filters Overlay - Global */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Filters Panel */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`relative z-[510] w-full ${isMobile
                ? 'h-full flex flex-col justify-end'
                : 'max-w-4xl p-4'
                }`}
            >
              <div className={`${isMobile ? 'bg-slate-900 rounded-t-[3rem] pb-[env(safe-area-inset-bottom)]' : ''}`}>
                <SearchFilters
                  filters={filters}
                  setFilters={setFilters}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
