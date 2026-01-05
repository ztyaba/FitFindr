import React, { useState, useEffect } from 'react';
import GradualBlur from './GradualBlur';

/**
 * SectionBlur - Shows a viewport-fixed GradualBlur only when a target section is visible.
 * This creates a "melting" effect at the bottom of the screen as content scrolls by.
 */
export default function SectionBlur({ sectionId, ...blurProps }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                // Show blur when section is at least 10% visible
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        observer.observe(section);
        return () => observer.disconnect();
    }, [sectionId]);

    if (!isVisible) return null;

    return (
        <GradualBlur
            target="page"
            position="bottom"
            {...blurProps}
        />
    );
}
