import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * ScrollBlurReveal - Applies a blur effect to a target section that clears as you scroll through it.
 * 
 * @param {string} targetId - ID of the element to apply blur to
 * @param {number} maxBlur - Maximum blur in pixels (default: 10)
 * @param {number} startThreshold - When to start revealing (0-1, default: 0.1 = 10% into section)
 * @param {number} endThreshold - When blur should be fully cleared (0-1, default: 0.7 = 70% through section)
 */
function ScrollBlurReveal({
    targetId,
    maxBlur = 10,
    startThreshold = 0.1,
    endThreshold = 0.7
}) {
    const [blurAmount, setBlurAmount] = useState(maxBlur);
    const targetRef = useRef(null);
    const rafRef = useRef(null);

    const calculateBlur = useCallback(() => {
        if (!targetRef.current) return;

        const rect = targetRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Calculate how much of the section has scrolled past the viewport top
        // Progress: 0 = section just entering viewport, 1 = section fully scrolled past
        const sectionTop = rect.top;
        const sectionHeight = rect.height;

        // When does the section start being visible?
        // sectionTop <= viewportHeight means the top of section is within viewport
        // We want progress based on how far into the section we've scrolled

        // Progress calculation:
        // - When section top is at viewport bottom: progress = 0
        // - When section top is at viewport top * startThreshold: start clearing blur
        // - When we've scrolled endThreshold through the section: blur = 0

        let progress = 0;

        if (sectionTop < viewportHeight) {
            // Section is visible
            const scrolledPast = viewportHeight - sectionTop;
            const totalScrollDistance = viewportHeight + sectionHeight;
            progress = scrolledPast / totalScrollDistance;
        }

        // Map progress to blur amount
        // Before startThreshold: full blur
        // After endThreshold: no blur
        // Between: linear interpolation
        let normalizedProgress = 0;
        if (progress >= startThreshold && progress <= endThreshold) {
            normalizedProgress = (progress - startThreshold) / (endThreshold - startThreshold);
        } else if (progress > endThreshold) {
            normalizedProgress = 1;
        }

        const newBlur = maxBlur * (1 - normalizedProgress);
        setBlurAmount(newBlur);
    }, [maxBlur, startThreshold, endThreshold]);

    const handleScroll = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(calculateBlur);
    }, [calculateBlur]);

    useEffect(() => {
        // Find the target element
        const target = document.getElementById(targetId);
        if (!target) {
            console.warn(`ScrollBlurReveal: Element with id "${targetId}" not found`);
            return;
        }

        targetRef.current = target;

        // Initial calculation
        calculateBlur();

        // Add scroll listener
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [targetId, handleScroll, calculateBlur]);

    // Apply blur to target element via CSS
    useEffect(() => {
        if (!targetRef.current) return;

        targetRef.current.style.filter = blurAmount > 0.1 ? `blur(${blurAmount.toFixed(2)}px)` : 'none';
        targetRef.current.style.transition = 'filter 0.1s ease-out';
    }, [blurAmount]);

    // This component doesn't render anything visible
    return null;
}

export default React.memo(ScrollBlurReveal);
