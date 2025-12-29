
import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Users, Zap, Calendar, Star, Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

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

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Hide Layout header/footer for Map-centric pages (Browse and Versus)
  // These pages manage their own navigation (floating navbar or custom grid header)
  const isBrowsePage = location.pathname === createPageUrl("Browse");
  const isVersusPage = location.pathname === createPageUrl("Versus");
  const isCalendarPage = location.pathname === createPageUrl("Calendar");
  const shouldHideLayoutNav = isBrowsePage || isVersusPage || isCalendarPage;

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/99b4f91f-a089-4227-b05d-f4392b5d7598', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Layout.jsx:36', message: 'Layout render', data: { pathname: location.pathname, browseUrl: createPageUrl("Browse"), isBrowsePage, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
  // #endregion

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header - Hidden on pages that manage their own navigation */}
      {!shouldHideLayoutNav && (
        <header className="sticky top-0 z-50 bg-slate-900/50 backdrop-blur-xl border-b border-white/10 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link to={createPageUrl("Browse")} className="flex items-center gap-3 group">
                <img src="/landing/assets/images/logos/Logo4.png" alt="FitFindr Logo" className="h-10 w-auto object-contain transition-all duration-300 transform group-hover:scale-105" />
                <div className="hidden sm:block">
                  <h1 className="text-xl font-black text-white tracking-tight">
                    FitFindr
                  </h1>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest -mt-1">Connect. Train. Compete.</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-8">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all duration-300 ${isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="text-sm font-bold">{item.title}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="text-slate-600">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900">FitFindr</h2>
                      <p className="text-xs text-slate-500">Connect. Train. Compete.</p>
                    </div>
                  </div>

                  <nav className="space-y-2">
                    {navigationItems.map((item) => {
                      const isActive = location.pathname === item.url;
                      return (
                        <Link
                          key={item.title}
                          to={item.url}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50'
                            }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer - Hidden on pages that manage their own navigation */}
      {!shouldHideLayoutNav && (
        <footer className="bg-slate-950 border-t border-white/10 text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <img src="/landing/assets/images/logos/Logo4.png" alt="FitFindr" className="h-10 w-auto opacity-80" />
                <div>
                  <h3 className="font-black text-white text-lg tracking-tight">FitFindr</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connect. Train. Compete.</p>
                </div>
              </div>
              <div className="flex items-center gap-12 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                <Link to={createPageUrl("Browse")} className="hover:text-blue-400 transition-colors">Find Pros</Link>
                <Link to={createPageUrl("Versus")} className="hover:text-blue-400 transition-colors">Versus</Link>
                <Link to={createPageUrl("Calendar")} className="hover:text-blue-400 transition-colors">Calendar</Link>
                <Link to={createPageUrl("FitFindr AI")} className="hover:text-blue-400 transition-colors">FitFindr AI</Link>
              </div>
              <div className="flex items-center gap-4 text-xs font-black text-white uppercase tracking-widest bg-white/5 py-2 px-4 rounded-xl border border-white/10">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                Premium Fitness Experience
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} FitFindr. All Rights Reserved.
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
