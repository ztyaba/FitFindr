
import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Users, Zap, Calendar, Star, Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import StaggeredMenu from "@/components/react-bits/StaggeredMenu";

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

// Convert navigation items to StaggeredMenu format
// Use shorter labels for mobile-friendly display
const menuItems = navigationItems.map(item => ({
  label: item.title === 'Find Professionals' ? 'FIND A PRO' : item.title,
  ariaLabel: `Navigate to ${item.title}`,
  link: item.url
}));

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [mobileMenuMounted, setMobileMenuMounted] = React.useState(false);
  const closeTimeoutRef = React.useRef(null);

  // Hide Layout header/footer for Map-centric pages (Browse and Versus)
  // These pages manage their own navigation (floating navbar or custom grid header)
  const isBrowsePage = location.pathname === createPageUrl("Browse");
  const isVersusPage = location.pathname === createPageUrl("Versus");
  const shouldHideLayoutNav = isBrowsePage || isVersusPage;
  const isCalendarPage = location.pathname === createPageUrl("Calendar");
  const isAiPage = location.pathname === createPageUrl("FitFindr AI");
  const useInlineStaggeredMenu = isCalendarPage || isAiPage;

  const openMobileMenu = React.useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMobileMenuMounted(true);
    setMobileMenuOpen(true);
  }, []);

  const closeMobileMenu = React.useCallback(() => {
    setMobileMenuOpen(false);
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setMobileMenuMounted(false);
      closeTimeoutRef.current = null;
    }, 360);
  }, []);

  React.useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/99b4f91f-a089-4227-b05d-f4392b5d7598', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Layout.jsx:36', message: 'Layout render', data: { pathname: location.pathname, browseUrl: createPageUrl("Browse"), isBrowsePage, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
  // #endregion

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header - Hidden on pages that manage their own navigation */}
      {!shouldHideLayoutNav && (
        <header className="sticky top-0 z-50 bg-slate-900/50 backdrop-blur-xl border-b border-white/10 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 w-full">
              {useInlineStaggeredMenu ? (
                <StaggeredMenu
                  className="sm-inline sm-ai-menu w-full"
                  colors={['#B19EEF', '#5227FF']}
                  accentColor="#0022a8"
                  items={menuItems}
                  displaySocials={false}
                  displayItemNumbering={true}
                  showDiscuss={false}
                  logoUrl="/landing/assets/images/logos/Logo4.png"
                  logoLink="/"
                  logoLinkComponent={Link}
                  menuButtonColor="#fff"
                  openMenuButtonColor="#111"
                  isFixed={false}
                  hidePanelClose={true}
                  hideLogo={false}
                  headerPosition="static"
                  disableSwipe={useInlineStaggeredMenu}
                />
              ) : (
                <>
                  {/* Logo */}
                  <Link to="/" className="flex items-center gap-3 group">
                    <img src="/landing/assets/images/logos/Logo4.png" alt="FitFindr Logo" className="h-10 w-auto object-contain transition-all duration-300 transform group-hover:scale-110" />
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

                  {/* Standard Mobile Menu Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-slate-400 hover:text-white"
                    onClick={openMobileMenu}
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      {/* StaggeredMenu for Mobile - Only on Calendar and AI pages */}
      {!shouldHideLayoutNav && !useInlineStaggeredMenu && mobileMenuMounted && (
        <StaggeredMenu
          colors={['#B19EEF', '#5227FF']}
          accentColor="#0022a8"
          items={menuItems}
          displaySocials={false}
          displayItemNumbering={true}
          showDiscuss={false}
          logoUrl="/landing/assets/images/logos/Logo4.png"
          menuButtonColor="#fff"
          openMenuButtonColor="#333"
          isFixed={true}
          closeOnClickAway={true}
          hideHeader={true}
          onExternalClose={closeMobileMenu}
          onMenuClose={closeMobileMenu}
          disableSwipe={isCalendarPage || isAiPage}
        />
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
              <Link to="/" className="flex items-center gap-4 mb-4 md:mb-0 group">
                <img src="/landing/assets/images/logos/Logo4.png" alt="FitFindr" className="h-10 w-auto opacity-80 transition-all group-hover:opacity-100 group-hover:scale-105" />
              </Link>
              <div className="flex items-center gap-12 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                <Link to="/" className="hover:text-blue-400 transition-colors">Find Pros</Link>
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
