/**
 * Landing pages entry point
 * This file is the single entry point for all landing page React mounts.
 * It dynamically imports the appropriate mount scripts based on page context.
 */

// Always import the staggered menu - used on all landing pages
import './staggered-menu-mount.jsx';

// Conditionally import page-specific mounts based on current page
const path = window.location.pathname;

if (path.includes('index-1') || path === '/' || path === '/landing/' || path.endsWith('/landing')) {
    import('./hero-mount.jsx');
}

if (path.includes('contact-us')) {
    import('./contact-hero-mount.jsx');
}

if (path.includes('class-timetable')) {
    import('./events-hero-mount.jsx');
}

if (path.includes('faqs')) {
    import('./faq-hero-mount.jsx');
}
