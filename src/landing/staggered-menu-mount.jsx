import React from 'react'
import { createRoot } from 'react-dom/client'
import StaggeredMenu from '@/components/react-bits/StaggeredMenu'

const menuItems = [
    { label: 'Home', link: '/landing/index-1.html' },
    {
        label: 'Explore',
        subItems: [
            { label: 'About Us', link: '/landing/about-us.html' },
            { label: 'FAQs', link: '/landing/faqs.html' }
        ]
    },
    { label: 'Events', link: '/landing/class-timetable.html' },
    {
        label: 'Blog',
        subItems: [
            { label: 'Latest News', link: '#', comingSoon: true },
            { label: 'Workout Playlists', link: '#', comingSoon: true }
        ]
    },
    {
        label: 'Demo',
        subItems: [
            { label: 'FitFindr Pro', link: '/browse' },
            { label: 'FitFindr Versus', link: '/versus' },
            { label: 'FitFindr AI', link: '/fitfindr-ai' }
        ]
    },
    { label: 'Contact Us', link: '/landing/contact-us.html' }
];

const socialItems = [
    { label: 'Facebook', link: 'https://facebook.com' },
    { label: 'Twitter', link: 'https://twitter.com' },
    { label: 'Instagram', link: 'https://instagram.com' },
    { label: 'YouTube', link: 'https://youtube.com' }
];

const isAboutPage = document.body?.classList.contains('about-page');
const desktopQuery = window.matchMedia('(min-width: 1200px)');

function StaggeredMenuHeader() {
    // Hide the menu button on desktop; keep it only for mobile.
    if (desktopQuery.matches) {
        return null;
    }

    // On About Us page, hide the entire header (and thus the menu button) on desktop
    const shouldHideHeader = isAboutPage && desktopQuery.matches;

    return (
        <StaggeredMenu
            className="sm-landing-toggle"
            position="right"
            colors={['#B19EEF', '#5227FF']}
            items={menuItems}
            socialItems={socialItems}
            menuButtonColor="#fff" // White text for visibility on dark header
            openMenuButtonColor="#000" // Black text when open on white background
            isFixed={false} // Stay in flow for alignment
            headerPosition="static" // Stay in flow
            headerJustify="space-between"
            hideLogo={false} // Show logo when menu is open (CSS handles hiding when closed)
            hidePanelClose={false}
            panelCloseMatchesToggle={true}
            showDiscuss={true}
            discussLink="/landing/contact-us.html"
            logoUrl="/landing/assets/images/logos/Logo4.png"
            hideHeader={shouldHideHeader}
        />
    );
}

// Side effect: Hide original sidebar button and mount our new component
const targetContainer = document.querySelector('.header_tooglemenu');
const originalBtn = targetContainer?.querySelector('.sidebar_btn');
const originalBtnWrapper = targetContainer?.querySelector('.orangeglow');
let headerMount = null;
let headerRoot = null;

const mountStaggeredMenu = () => {
    if (!targetContainer || headerMount) return;
    if (originalBtn) {
        originalBtn.style.display = 'none';
    }
    if (originalBtnWrapper) {
        originalBtnWrapper.style.display = 'none';
    }

    headerMount = document.createElement('div');
    headerMount.id = 'staggered-menu-mount-header';
    headerMount.style.display = 'inline-block';
    targetContainer.appendChild(headerMount);

    headerRoot = createRoot(headerMount);
    headerRoot.render(<StaggeredMenuHeader />);
};

const updateMountState = () => {
    // Always mount on all pages to ensure original button is replaced
    mountStaggeredMenu();

    // Re-render to update hideHeader prop if state changes
    if (headerRoot) {
        headerRoot.render(<StaggeredMenuHeader />);
    }
};

if (targetContainer) {
    updateMountState();
    desktopQuery.addEventListener('change', updateMountState);
}

// Also hide the body mount point if it exists (legacy placeholder)
const bodyMount = document.getElementById("staggered-menu-mount");
if (bodyMount) {
    bodyMount.style.display = 'none';
}
