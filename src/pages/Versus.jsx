import { useState, useEffect, useCallback, useMemo } from "react";
import { PickupGame, Court, Player } from "@/api/entities";
import {
  Plus,
  MapPin,
  Zap,
  Trophy,
  Grid,
  Map as MapIcon,
  Search,
  SlidersHorizontal,
  Users,
  Calendar,
  X,
  Star,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import ProfileDrawer from "../components/browse/ProfileDrawer";

import GameCard from "../components/versus/GameCard";
import CreateGameDialog from "../components/versus/CreateGameDialog";
import GameFilters from "../components/versus/GameFilters";
import CourtFinder from "../components/versus/CourtFinder";
import GamesMap from "../components/versus/GamesMap";
import CourtsMap from "../components/versus/CourtsMap";
import Leaderboard from "../components/versus/Leaderboard";
import VersusWebGL from "../components/versus/VersusWebGL";
import GameDetailDialog from "../components/calendar/GameDetailDialog";
import CourtDetailDialog from "../components/versus/CourtDetailDialog";
import VersusMapCard from "../components/versus/VersusMapCard";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react";
import { Drawer as VaulDrawer } from "vaul";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const MOBILE_DRAWER_SNAP_POINTS = [0.22, 0.5, 0.9];

export default function Versus() {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [courts, setCourts] = useState([]);
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [activeTab, setActiveTab] = useState("games");
  const [gamesView, setGamesView] = useState("grid");
  const [courtsView, setCourtsView] = useState("grid");
  const [courtSearchQuery, setCourtSearchQuery] = useState("");
  const [layoutMode, setLayoutMode] = useState("map");
  const [activeDrawerSnap, setActiveDrawerSnap] = useState(MOBILE_DRAWER_SNAP_POINTS[0]);
  const [filters, setFilters] = useState({
    sport: "",
    skill_level: "",
    date_range: "",
    location: "",
    cost_range: [0, 100]
  });

  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [drawerPosition, setDrawerPosition] = useState({ x: 0, y: 0 });
  const [isShowAllMode, setIsShowAllMode] = useState(true);
  const [selectedCardItem, setSelectedCardItem] = useState(null); // For map popup card
  const gamesMapRef = useRef(null);
  const courtsMapRef = useRef(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const isMapLayout = layoutMode === "map";

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

  const loadGames = async () => {
    setIsLoading(true);
    try {
      const data = await PickupGame.list("-date_time", 50);
      setGames(data);
    } catch (error) {
      console.error("Error loading games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCourts = async () => {
    try {
      const data = await Court.list("-rating", 50);
      setCourts(data);
    } catch (error) {
      console.error("Error loading courts:", error);
    }
  };

  const loadPlayers = async () => {
    try {
      const data = await Player.list("-overall_rating", 50);
      setPlayers(data);
    } catch (error) {
      console.error("Error loading players:", error);
    }
  };

  const renderGamesList = (viewType = "list") => {
    if (isLoading) {
      return (
        <div className={viewType === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      );
    }

    if (filteredGames.length === 0) {
      return (
        <div className="py-12 text-center opacity-40">
          <Zap className="w-12 h-12 mx-auto mb-4 text-slate-500" />
          <p className="text-sm font-bold uppercase tracking-widest text-white">No Matchups Discovered</p>
        </div>
      );
    }

    return (
      <div className={viewType === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
        {filteredGames.map((game, index) => (
          <div
            key={game.id}
            onMouseEnter={(e) => {
              if (isMobile) return;
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredItem({
                full_name: game.title,
                location: game.location,
                specialties: [game.sport],
                price_per_hour: game.cost_per_person,
                bio: game.description || "Exciting pickup game matchup!",
                rating: 4.8
              });
              setDrawerPosition({ x: rect.right + 20, y: rect.top });
            }}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => handleItemClick(game)}
            className="cursor-pointer"
          >
            <GameCard
              game={game}
              index={index}
              onJoin={() => loadGames()}
              variant={viewType === "list" ? "compact" : "default"}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderCourtsList = (variant = "default") => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      );
    }
    return (
      <CourtFinder
        courts={filteredCourts}
        variant={variant}
        onHover={(court, rect) => {
          if (isMobile) return;
          setHoveredItem({
            full_name: court.name,
            location: court.location,
            specialties: ["Venue", court.venue_type],
            price_per_hour: court.rate_per_hour,
            bio: "A premium athletic facility ready for your next matchup.",
            rating: 4.9
          });
          setDrawerPosition({ x: rect.right + 20, y: rect.top });
        }}
        onHoverExit={() => setHoveredItem(null)}
        onCourtClick={handleItemClick}
      />
    );
  };


  const applyFilters = useCallback(() => {
    let filtered = Array.isArray(games) ? [...games] : [];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(query) ||
        game.sport.toLowerCase().includes(query) ||
        game.location.city.toLowerCase().includes(query) ||
        game.location.venue_name.toLowerCase().includes(query)
      );
    }

    if (filters.sport) {
      filtered = filtered.filter(game => game.sport === filters.sport);
    }

    if (filters.skill_level) {
      filtered = filtered.filter(game =>
        game.skill_level === filters.skill_level || game.skill_level === "all_levels"
      );
    }

    if (filters.location.trim()) {
      const location = filters.location.toLowerCase();
      filtered = filtered.filter(game =>
        game.location.city.toLowerCase().includes(location) ||
        game.location.state.toLowerCase().includes(location)
      );
    }

    filtered = filtered.filter(game =>
      game.cost_per_person >= filters.cost_range[0] &&
      game.cost_per_person <= filters.cost_range[1]
    );

    const now = new Date();
    filtered = filtered.filter(game => new Date(game.date_time) > now);

    setFilteredGames(filtered);
  }, [games, searchQuery, filters]);

  useEffect(() => {
    loadGames();
    loadCourts();
    loadPlayers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    if (isMobile && layoutMode !== "map") {
      setLayoutMode("map");
    }
  }, [isMobile, layoutMode]);

  useEffect(() => {
    if (activeTab !== "games") {
      setShowFilters(false);
    }
    // Logic to reset view when switching tabs if needed, 
    // or just let it be. For now, let's reset isShowAllMode if markers changed significantly.
  }, [activeTab]);

  const handleMarkerClick = useCallback((item) => {
    setIsShowAllMode(false);
    // If it's a court or game, we'll open the dialog
    // Actually, based on implementation plan, we open the dialog from the popup button now.
  }, []);

  const handleViewDetails = useCallback((item) => {
    if (activeTab === "games") {
      setSelectedGame(item);
    } else {
      setSelectedCourt(item);
    }
  }, [activeTab]);

  const handleItemHover = useCallback((item, rect) => {
    if (!isShowAllMode) return;
    setHoveredItem(item);
    setDrawerPosition({ x: rect.right + 20, y: rect.top });
  }, [isShowAllMode]);

  const handleItemClick = useCallback((item) => {
    if (isMapLayout) {
      const mapRef = activeTab === "games" ? gamesMapRef : courtsMapRef;
      if (mapRef.current) {
        setIsShowAllMode(false);
        setHoveredItem(null); // Clear hover preview
        mapRef.current.closeAllPopups();
        mapRef.current.zoomTo(item.location.latitude, item.location.longitude);
        // Set the selected item for the floating card
        setSelectedCardItem(item);
        if (isMobile) {
          setActiveDrawerSnap(MOBILE_DRAWER_SNAP_POINTS[0]);
        }
      }
    } else {
      if (activeTab === "games") setSelectedGame(item);
      else setSelectedCourt(item);
    }
  }, [isMapLayout, activeTab, isMobile]);

  const handleResetView = useCallback(() => {
    setIsShowAllMode(true);
    setSelectedCardItem(null);
    if (isMobile) {
      setActiveDrawerSnap(MOBILE_DRAWER_SNAP_POINTS[0]);
    }
    const mapRef = activeTab === "games" ? gamesMapRef : courtsMapRef;
    if (mapRef.current) {
      mapRef.current.closeAllPopups();
      if (mapRef.current.resetView) {
        mapRef.current.resetView();
      }
    }
  }, [activeTab, isMobile]);

  const handleGameCreated = () => {
    setShowCreateGame(false);
    loadGames();
  };

  const filteredCourts = useMemo(() => {
    if (!Array.isArray(courts)) return [];

    if (!courtSearchQuery.trim()) {
      return courts;
    }

    const query = courtSearchQuery.trim().toLowerCase();
    return courts.filter((court) => {
      const { location = {}, name = "", venue_name = "" } = court;
      return (
        name.toLowerCase().includes(query) ||
        venue_name.toLowerCase().includes(query) ||
        (location.city || "").toLowerCase().includes(query) ||
        (location.state || "").toLowerCase().includes(query)
      );
    });
  }, [courts, courtSearchQuery]);

  const renderGameList = () => {
    if (isLoading) {
      return Array.from({ length: 6 }).map((_, index) => (
        <div key={`game-skeleton-${index}`} className="h-28 rounded-[2rem] bg-white/5 animate-pulse" />
      ));
    }

    if (filteredGames.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-20 px-10 text-slate-300">
          <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mb-6">
            <Zap className="w-10 h-10 text-blue-400 opacity-50" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">No active games</h3>
          <p className="text-slate-400 font-medium">Be the first to create a matchup in this area.</p>
        </div>
      );
    }

    return filteredGames.map((game) => {
      const isFull = game.current_players >= game.max_players;
      return (
        <motion.div
          key={game.id}
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            handleItemHover({
              full_name: game.title,
              location: game.location,
              specialties: [game.sport],
              price_per_hour: game.cost_per_person,
              bio: game.description || "Exciting pickup game matchup!",
              rating: 4.8
            }, rect);
          }}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => handleItemClick(game)}
          className="group relative rounded-[2rem] border border-white/5 bg-white/5 p-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20 overflow-hidden cursor-pointer"
        >
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                  {game.sport?.replace(/_/g, " ")}
                </span>
                {isFull && (
                  <Badge className="bg-rose-500/20 text-rose-300 border-0 text-[10px] px-2 py-0 font-black">FULL</Badge>
                )}
              </div>
              <h4 className="text-lg font-black text-white tracking-tight group-hover:text-blue-400 transition-colors line-clamp-1">
                {game.title}
              </h4>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {game.date_time ? format(new Date(game.date_time), "MMM d, h:mm a") : "Time TBD"}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {game.location?.venue_name || "Location TBD"}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-white">${game.cost_per_person || 0}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">per spot</div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black">{i}</div>
                ))}
              </div>
              <span className="text-xs font-black text-white">{game.current_players}/{game.max_players}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(game.current_players / game.max_players) * 100}%` }}
              className={`h-full ${isFull ? 'bg-rose-500' : 'bg-blue-600'}`}
            />
          </div>
        </motion.div>
      );
    });
  };

  const renderCourtList = () => {
    if (isLoading) {
      return Array.from({ length: 6 }).map((_, index) => (
        <div key={`court-skeleton-${index}`} className="h-40 rounded-[2rem] bg-white/5 animate-pulse" />
      ));
    }

    if (!filteredCourts.length) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-20 px-10 text-slate-300">
          <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mb-6">
            <MapPin className="w-10 h-10 text-blue-400 opacity-50" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">No venues discovered</h3>
          <p className="text-slate-400 font-medium">Try expanding your search radius.</p>
        </div>
      );
    }

    return filteredCourts.map((court) => (
      <motion.div
        key={court.id}
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          handleItemHover({
            full_name: court.name,
            location: court.location,
            specialties: ["Venue", court.venue_type],
            price_per_hour: court.rate_per_hour,
            bio: "A premium athletic facility ready for your next matchup.",
            rating: 4.9
          }, rect);
        }}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => handleItemClick(court)}
        className="group relative rounded-[2rem] border border-white/5 bg-white/5 overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/20 cursor-pointer"
      >
        <div className="relative h-32 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-900/60 group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
            {court.venue_type || "Court"}
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-lg font-black text-white tracking-tight group-hover:text-blue-400 transition-colors line-clamp-1">
              {court.name}
            </h4>
            <div className="flex items-center gap-1 text-[10px] font-black text-yellow-500">
              <Star className="w-3 h-3 fill-yellow-500" />
              4.9
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-tighter mb-6">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            {court.location?.address}, {court.location?.city}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-xs font-black text-white uppercase tracking-widest">Instant Booking</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
          </div>
        </div>
      </motion.div>
    ));
  };

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
          const isActive = item.url.includes("Versus");
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
    const isLeaderboardTab = activeTab === "leaderboard";

    // Get the count based on active tab
    const getResultCount = () => {
      if (activeTab === "games") return filteredGames.length;
      if (activeTab === "courts") return filteredCourts.length;
      return players.length;
    };

    const getResultLabel = () => {
      if (activeTab === "games") return "Matchups";
      if (activeTab === "courts") return "Venues";
      return "Players";
    };

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

                {/* Header - Browse Style: Title, Subtitle, Count */}
                <div className="mt-3 relative flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">
                      Versus
                    </p>
                    <span className="text-slate-700 mx-1">•</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-black text-blue-400">
                        {getResultCount()}
                      </span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {getResultLabel()}
                      </span>
                    </div>
                  </div>
                  {activeTab === "games" && (
                    <div className="absolute right-0">
                      <Button
                        onClick={() => setShowFilters(true)}
                        variant="ghost"
                        className="h-10 w-10 rounded-[2rem] bg-white/5 border border-white/10 text-white hover:bg-white/10"
                      >
                        <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Tabs - Styled to match Browse aesthetic */}
                <div className="mt-3 bg-white/5 border border-white/10 rounded-[2rem] p-1.5">
                  <TabsList className="bg-transparent border-0 gap-1 h-auto p-0 w-full justify-start">
                    <TabsTrigger
                      value="games"
                      className="flex-1 rounded-[2rem] px-3 h-9 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 font-black uppercase text-[10px] tracking-widest transition-all"
                    >
                      Games
                    </TabsTrigger>
                    <TabsTrigger
                      value="courts"
                      className="flex-1 rounded-[2rem] px-3 h-9 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 font-black uppercase text-[10px] tracking-widest transition-all"
                    >
                      Courts
                    </TabsTrigger>
                    <div className="w-px h-6 bg-white/10 mx-1 shrink-0" />
                    <TabsTrigger
                      value="leaderboard"
                      onClick={(e) => {
                        if (isMobile) {
                          e.preventDefault();
                          setShowLeaderboard(true);
                        }
                      }}
                      className="flex-1 rounded-[2rem] px-3 h-9 data-[state=active]:bg-yellow-500 data-[state=active]:text-black text-slate-400 font-black uppercase text-[10px] tracking-widest transition-all"
                    >
                      Ranks
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Search - Only for Games/Courts */}
                {!isLeaderboardTab && (
                  <div className="mt-3 flex items-center gap-2 bg-white/5 border border-white/10 rounded-[2rem] p-1.5">
                    <div className="relative flex-1 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <Input
                        placeholder={activeTab === "games" ? "Search games..." : "Search courts..."}
                        value={activeTab === "games" ? searchQuery : courtSearchQuery}
                        onChange={(e) => {
                          if (activeTab === "games") {
                            setSearchQuery(e.target.value);
                          } else {
                            setCourtSearchQuery(e.target.value);
                          }
                        }}
                        className="h-11 pl-11 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-slate-500 transition-all font-medium text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-4 pt-3 pb-[calc(6rem+env(safe-area-inset-bottom))] no-scrollbar">
                <TabsContent value="games" className="m-0 focus-visible:ring-0">
                  {renderGamesList("compact")}
                </TabsContent>
                <TabsContent value="courts" className="m-0 focus-visible:ring-0">
                  {renderCourtsList("compact")}
                </TabsContent>
                <TabsContent value="leaderboard" className="m-0 focus-visible:ring-0">
                  <Leaderboard players={players} tone="dark" />
                </TabsContent>
              </div>
            </motion.div>
          </VaulDrawer.Content>
        </VaulDrawer.Root>
      </div>
    );
  };


  return (
    <div className={isMapLayout ? "fixed inset-0 w-screen h-screen overflow-hidden" : "min-h-screen bg-slate-950 text-white"}>
      {isMapLayout ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="absolute inset-0">
            {activeTab === "courts" ? (
              <CourtsMap
                ref={courtsMapRef}
                courts={filteredCourts}
                height="100%"
                onViewDetails={handleViewDetails}
                onMarkerClick={handleMarkerClick}
                onItemClick={handleItemClick}
                isShowAllMode={isShowAllMode}
              />
            ) : (
              <GamesMap
                ref={gamesMapRef}
                games={filteredGames}
                height="100%"
                onViewDetails={handleViewDetails}
                onMarkerClick={handleMarkerClick}
                onItemClick={handleItemClick}
                isShowAllMode={isShowAllMode}
              />
            )}

            {/* Reset View Button removed as X on card now handles it */}

            {/* Floating Map Card - Shows when item is selected */}
            <AnimatePresence>
              {selectedCardItem && (
                <VersusMapCard
                  game={activeTab === "games" ? selectedCardItem : null}
                  court={activeTab === "courts" ? selectedCardItem : null}
                  onClose={() => {
                    setSelectedCardItem(null);
                    handleResetView();
                  }}
                  onViewDetails={(item) => {
                    if (activeTab === "games") {
                      setSelectedGame(item);
                    } else {
                      setSelectedCourt(item);
                    }
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/30 to-slate-950/80 pointer-events-none" />

          {renderFloatingHeader()}

          {/* Mobile Logo Badge - Top Left */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.2 }}
              className="absolute top-6 left-6 z-[220]"
            >
              <Link to="/" className="h-16 w-16 rounded-[2.25rem] bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-center transition-transform active:scale-95">
                <img
                  src="/landing/assets/images/logos/Logo4.png"
                  alt="FitFindr"
                  className="h-9 w-auto object-contain"
                />
              </Link>
            </motion.div>
          )}



          <AnimatePresence>
            {!isMobile && activeTab !== "leaderboard" && (
              <motion.aside
                initial={{ x: -400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -400, opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300, delay: 0.2 }}
                className="absolute left-6 top-6 bottom-6 w-[min(480px,95vw)] z-[110]"
              >
                <div className="h-full flex flex-col rounded-[2.5rem] bg-slate-900/85 backdrop-blur-[32px] border border-white/10 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.6)] overflow-hidden">
                  <div className="p-8 border-b border-white/10">
                    <div className="flex items-center justify-between mb-8">
                      <Link to="/" className="h-12 w-auto flex items-center group">
                        <img src="/landing/assets/images/logos/Logo4.png" alt="Logo" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
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

                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl p-1.5 self-start">
                        <TabsList className="bg-transparent border-0 gap-1 h-auto p-0">
                          <TabsTrigger
                            value="games"
                            className="rounded-xl px-5 h-10 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 font-black uppercase text-[10px] tracking-widest transition-all"
                          >
                            Games
                          </TabsTrigger>
                          <TabsTrigger
                            value="courts"
                            className="rounded-xl px-5 h-10 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 font-black uppercase text-[10px] tracking-widest transition-all"
                          >
                            Courts
                          </TabsTrigger>
                          <div className="w-px h-6 bg-white/10 mx-1" />
                          <TabsTrigger
                            value="leaderboard"
                            className="rounded-xl px-5 h-10 data-[state=active]:bg-yellow-500 data-[state=active]:text-black text-slate-400 font-black uppercase text-[10px] tracking-widest transition-all"
                          >
                            Rankings
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <div className="flex gap-2">
                        <div className="relative flex-1 group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                          <Input
                            placeholder={activeTab === "games" ? "Search games..." : "Search courts..."}
                            value={activeTab === "games" ? searchQuery : courtSearchQuery}
                            onChange={(e) => activeTab === "games" ? setSearchQuery(e.target.value) : setCourtSearchQuery(e.target.value)}
                            className="h-12 pl-11 bg-white/5 border-white/5 focus:border-blue-500/50 rounded-2xl text-white placeholder:text-slate-500 transition-all font-medium"
                          />
                        </div>
                        <Button
                          onClick={() => setShowFilters(!showFilters)}
                          className={`h-12 w-12 rounded-2xl border transition-all ${showFilters ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'}`}
                        >
                          <SlidersHorizontal className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto professional-panel-scroll p-6 space-y-4">
                    {activeTab === "games" ? renderGamesList("compact") : renderCourtsList("compact")}
                  </div>

                  {activeTab === "games" && (
                    <div className="p-6 bg-white/5 border-t border-white/5">
                      <Button
                        onClick={() => setShowCreateGame(true)}
                        className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-[0.1em] shadow-lg shadow-emerald-900/20"
                      >
                        <Plus className="w-5 h-5 mr-3" />
                        Create New Matchup
                      </Button>
                    </div>
                  )}
                </div>
              </motion.aside>
            )}

            {renderMobileDrawer()}
          </AnimatePresence>

          {activeTab === "leaderboard" && !isMobile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="absolute inset-x-6 top-32 bottom-6 z-[110]"
            >
              <div className="h-full rounded-[3rem] border border-white/10 bg-slate-900/80 backdrop-blur-3xl shadow-2xl overflow-y-auto p-10 professional-panel-scroll">
                <Button
                  onClick={() => setActiveTab("games")}
                  variant="ghost"
                  className="mb-8 text-slate-400 hover:text-white gap-2 font-black uppercase text-[10px] tracking-widest"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Map
                </Button>
                <Leaderboard players={players} tone="dark" />
              </div>
            </motion.div>
          )}

          {/* Dialogs and Overlays for Map Mode */}
          <ProfileDrawer
            professional={hoveredItem}
            isOpen={!!hoveredItem && !isMobile}
            onClose={() => setHoveredItem(null)}
            position={drawerPosition}
          />

          <AnimatePresence>
            {showLeaderboard && isMobile && (
              <div className="fixed inset-0 z-[400] bg-slate-950 flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">HALL OF FAME</h3>
                    <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] mt-0.5">Top Performer Ranks</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowLeaderboard(false);
                      setActiveTab("games");
                    }}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all shadow-xl"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto glass-scrollbar p-4 safe-bottom">
                  <div className="max-w-2xl mx-auto">
                    <Leaderboard players={players} tone="dark" isMobileView={true} />
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showFilters && (
              <div className="fixed inset-0 z-[300] flex items-center justify-center sm:p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilters(false)}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-[300]"
                />
                <div className="relative w-full h-full sm:h-auto sm:max-w-5xl max-h-screen sm:max-h-[90vh] overflow-y-auto glass-scrollbar sm:rounded-[3rem] z-[310]">
                  <GameFilters
                    filters={filters}
                    setFilters={setFilters}
                    onClose={() => setShowFilters(false)}
                  />
                </div>
              </div>
            )}
          </AnimatePresence>
        </Tabs>
      ) : (
        <div className="min-h-screen bg-slate-950 overflow-x-hidden">
          {/* Sticky Top Header for Grid View */}
          <header className="sticky top-0 z-[200] w-full bg-slate-900/50 backdrop-blur-xl border-b border-white/10 px-8 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/landing/assets/images/logos/Logo4.png" alt="FitFindr Logo" className="h-10 w-auto object-contain transition-all duration-300 transform group-hover:scale-110" />
            </Link>

            <nav className="flex items-center gap-2 bg-white/5 rounded-2xl p-1 border border-white/10">
              {navigationItems.map((item) => {
                const isActive = item.url.includes("Versus");
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

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setLayoutMode("map")}
                variant="outline"
                className="h-11 px-6 rounded-xl bg-white/5 border-white/10 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/10 flex items-center gap-2"
              >
                <MapIcon className="w-4 h-4 text-emerald-400" />
                Map View
              </Button>
            </div>
          </header>

          <section className="relative min-h-[70vh] flex flex-col items-center justify-center pt-20">
            <div className="absolute inset-0 z-0">
              <VersusWebGL className="absolute inset-0 w-full h-full opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
              >
                <Zap className="w-4 h-4" />
                Next Level Competition
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-8xl font-black mb-8 text-white tracking-tighter"
              >
                FitFindr
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                  Versus
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed"
              >
                The ultimate arena for local athletes. Discover high-stakes matchups,
                book premium courts, and climb the local leaderboards.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center justify-center gap-4"
              >
                <Button
                  onClick={() => setShowCreateGame(true)}
                  size="lg"
                  className="h-16 px-10 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm rounded-[2rem] shadow-xl shadow-blue-950/40 active:scale-95 transition-all"
                >
                  <Plus className="w-5 h-5 mr-3" />
                  Create Matchup
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setLayoutMode("map")}
                  className="h-16 px-10 bg-white/5 border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-sm rounded-[2rem] backdrop-blur-md active:scale-95 transition-all"
                >
                  <MapPin className="w-5 h-5 mr-3 text-blue-400" />
                  View Map
                </Button>
              </motion.div>
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-6 py-20">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16">
                <TabsList className="bg-white/5 border border-white/10 rounded-[2.5rem] p-2 h-auto flex flex-wrap gap-2">
                  <TabsTrigger
                    value="games"
                    className="flex-1 min-w-[120px] rounded-[2rem] px-8 h-14 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 font-black uppercase text-xs tracking-widest transition-all"
                  >
                    Matchups ({filteredGames.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="courts"
                    className="flex-1 min-w-[120px] rounded-[2rem] px-8 h-14 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 font-black uppercase text-xs tracking-widest transition-all"
                  >
                    Venues ({courts.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="leaderboard"
                    className="flex-1 min-w-[120px] rounded-[2rem] px-8 h-14 data-[state=active]:bg-yellow-500 data-[state=active]:text-black text-slate-400 font-black uppercase text-xs tracking-widest transition-all"
                  >
                    Global Rank
                  </TabsTrigger>
                </TabsList>

                {activeTab !== "leaderboard" && (
                  <div className="flex w-full lg:w-auto gap-3">
                    <div className="relative flex-1 min-w-[280px] group">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <Input
                        placeholder={activeTab === "games" ? "Search matchups, sports, cities..." : "Search courts or venues..."}
                        value={activeTab === "games" ? searchQuery : courtSearchQuery}
                        onChange={(e) => activeTab === "games" ? setSearchQuery(e.target.value) : setCourtSearchQuery(e.target.value)}
                        className="h-16 pl-14 bg-white/5 border-white/10 rounded-[2rem] text-white placeholder:text-slate-500 focus:border-blue-500/50 transition-all font-medium"
                      />
                    </div>
                    {activeTab === "games" && (
                      <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="h-16 w-16 rounded-[2rem] bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <SlidersHorizontal className="w-6 h-6" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <AnimatePresence mode="wait">
                  <TabsContent value="games" key="games-tab" className="mt-0 focus-visible:ring-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      {renderGamesList("grid")}
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="courts" key="courts-tab" className="mt-0 focus-visible:ring-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      {renderCourtsList()}
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="leaderboard" key="leaderboard-tab" className="mt-0 focus-visible:ring-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl"
                    >
                      <Leaderboard players={players} tone="dark" />
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </div>
            </Tabs>
          </section>
        </div>
      )}

      {/* Shared Dialogs (Always mounted for state persistence) */}
      <CreateGameDialog
        open={showCreateGame}
        onClose={() => setShowCreateGame(false)}
        onGameCreated={handleGameCreated}
        courts={courts}
      />

      <GameDetailDialog
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
        onJoin={() => loadGames()}
      />

      <CourtDetailDialog
        court={selectedCourt}
        onClose={() => setSelectedCourt(null)}
      />
    </div>
  );
}
