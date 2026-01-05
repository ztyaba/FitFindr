import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './StaggeredMenu.css';

export const StaggeredMenu = ({
    position = 'right',
    colors = ['#B19EEF', '#5227FF'],
    items = [],
    socialItems = [],
    displaySocials = true,
    displayItemNumbering = true,
    className,
    logoUrl = '/landing/assets/images/logos/Logo4.png',
    logoLink,
    logoLinkComponent,
    menuButtonColor = '#fff',
    openMenuButtonColor = '#fff',
    accentColor = '#0022a8',
    changeMenuColorOnOpen = true,
    isFixed = true,
    closeOnClickAway = true,
    showDiscuss = false,
    discussLink = 'contact-us.html',
    hideHeader = false,
    hideLogo = false,
    hidePanelClose = false,
    panelCloseMatchesToggle = false,
    headerPosition = 'absolute',
    headerJustify = 'space-between',
    onMenuOpen,
    onMenuClose,
    externalOpen,
    onExternalClose
}) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = externalOpen !== undefined ? (val) => { if (!val && onExternalClose) onExternalClose(); } : setInternalOpen;

    const openRef = useRef(false);
    const panelRef = useRef(null);
    const preLayersRef = useRef(null);
    const preLayerElsRef = useRef([]);
    const toggleRefs = useRef([]);
    const [textLines, setTextLines] = useState(['Menu', 'Close']);
    const [expandedItem, setExpandedItem] = useState(null);

    const openTlRef = useRef(null);
    const closeTweenRef = useRef(null);
    const spinTweenRef = useRef(null);
    const textCycleAnimRef = useRef(null);
    const colorTweenRef = useRef(null);
    const busyRef = useRef(false);
    const itemEntranceTweenRef = useRef(null);

    const setToggleRef = useCallback(
        (index, key) => el => {
            if (!toggleRefs.current[index]) {
                toggleRefs.current[index] = {};
            }
            toggleRefs.current[index][key] = el;
        },
        []
    );

    const getToggleEls = useCallback(() => {
        const buttons = [];
        const plusHs = [];
        const plusVs = [];
        const icons = [];
        const textInners = [];
        toggleRefs.current.forEach(toggle => {
            if (!toggle) return;
            if (toggle.button) buttons.push(toggle.button);
            if (toggle.plusH) plusHs.push(toggle.plusH);
            if (toggle.plusV) plusVs.push(toggle.plusV);
            if (toggle.icon) icons.push(toggle.icon);
            if (toggle.textInner) textInners.push(toggle.textInner);
        });
        return { buttons, plusHs, plusVs, icons, textInners };
    }, []);

    useLayoutEffect(() => {
        openRef.current = open;
    }, [open]);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const panel = panelRef.current;
            const preContainer = preLayersRef.current;
            if (!panel) return;

            let preLayers = [];
            if (preContainer) {
                preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'));
            }
            preLayerElsRef.current = preLayers;

            const offscreen = position === 'left' ? -100 : 100;
            gsap.set([panel, ...preLayers], { xPercent: offscreen });
            const { buttons, plusHs, plusVs, icons, textInners } = getToggleEls();
            if (plusHs.length) gsap.set(plusHs, { transformOrigin: '50% 50%', rotate: 0 });
            if (plusVs.length) gsap.set(plusVs, { transformOrigin: '50% 50%', rotate: 90 });
            if (icons.length) gsap.set(icons, { rotate: 0, transformOrigin: '50% 50%' });
            if (textInners.length) gsap.set(textInners, { yPercent: 0 });
            if (buttons.length) gsap.set(buttons, { color: menuButtonColor });
        });
        return () => ctx.revert();
    }, [getToggleEls, menuButtonColor, position]);

    const buildOpenTimeline = useCallback(() => {
        const panel = panelRef.current;
        const layers = preLayerElsRef.current;
        if (!panel) return null;

        openTlRef.current?.kill();
        if (closeTweenRef.current) {
            closeTweenRef.current.kill();
            closeTweenRef.current = null;
        }
        itemEntranceTweenRef.current?.kill();

        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
        const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
        const socialTitle = panel.querySelector('.sm-socials-title');
        const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));
        const discussEl = panel.querySelector('.sm-discuss');

        const layerStates = layers.map(el => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }));
        const panelStart = Number(gsap.getProperty(panel, 'xPercent'));

        if (itemEls.length) {
            gsap.set(itemEls, { yPercent: 140, rotate: 10 });
        }
        if (numberEls.length) {
            gsap.set(numberEls, { '--sm-num-opacity': 0 });
        }
        if (socialTitle) {
            gsap.set(socialTitle, { opacity: 0 });
        }
        if (socialLinks.length) {
            gsap.set(socialLinks, { y: 25, opacity: 0 });
        }
        if (discussEl) {
            gsap.set(discussEl, { opacity: 0, y: 20 });
        }

        const tl = gsap.timeline({ paused: true });

        layerStates.forEach((ls, i) => {
            tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
        });
        const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
        const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
        const panelDuration = 0.65;
        tl.fromTo(
            panel,
            { xPercent: panelStart },
            { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
            panelInsertTime
        );

        if (itemEls.length) {
            const itemsStartRatio = 0.15;
            const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;
            tl.to(
                itemEls,
                {
                    yPercent: 0,
                    rotate: 0,
                    duration: 1,
                    ease: 'power4.out',
                    stagger: { each: 0.1, from: 'start' }
                },
                itemsStart
            );
            if (numberEls.length) {
                tl.to(
                    numberEls,
                    {
                        duration: 0.6,
                        ease: 'power2.out',
                        '--sm-num-opacity': 1,
                        stagger: { each: 0.08, from: 'start' }
                    },
                    itemsStart + 0.1
                );
            }
        }

        if (socialTitle || socialLinks.length) {
            const socialsStart = panelInsertTime + panelDuration * 0.4;
            if (socialTitle) {
                tl.to(
                    socialTitle,
                    {
                        opacity: 1,
                        duration: 0.5,
                        ease: 'power2.out'
                    },
                    socialsStart
                );
            }
            if (socialLinks.length) {
                tl.to(
                    socialLinks,
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.55,
                        ease: 'power3.out',
                        stagger: { each: 0.08, from: 'start' },
                        onComplete: () => {
                            gsap.set(socialLinks, { clearProps: 'opacity' });
                        }
                    },
                    socialsStart + 0.04
                );
            }
        }

        if (discussEl) {
            const discussStart = panelInsertTime + panelDuration * 0.5;
            tl.to(
                discussEl,
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: 'power3.out'
                },
                discussStart
            );
        }

        openTlRef.current = tl;
        return tl;
    }, []);

    const playOpen = useCallback(() => {
        if (busyRef.current) return;
        busyRef.current = true;
        const tl = buildOpenTimeline();
        if (tl) {
            tl.eventCallback('onComplete', () => {
                busyRef.current = false;
            });
            tl.play(0);
        } else {
            busyRef.current = false;
        }
    }, [buildOpenTimeline]);

    const playClose = useCallback(() => {
        openTlRef.current?.kill();
        openTlRef.current = null;
        itemEntranceTweenRef.current?.kill();

        const panel = panelRef.current;
        const layers = preLayerElsRef.current;
        if (!panel) return;

        const all = [...layers, panel];
        closeTweenRef.current?.kill();
        const offscreen = position === 'left' ? -100 : 100;
        closeTweenRef.current = gsap.to(all, {
            xPercent: offscreen,
            duration: 0.32,
            ease: 'power3.in',
            overwrite: 'auto',
            onComplete: () => {
                const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
                if (itemEls.length) {
                    gsap.set(itemEls, { yPercent: 140, rotate: 10 });
                }
                const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
                if (numberEls.length) {
                    gsap.set(numberEls, { '--sm-num-opacity': 0 });
                }
                const socialTitle = panel.querySelector('.sm-socials-title');
                const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));
                if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
                if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });
                const discussEl = panel.querySelector('.sm-discuss');
                if (discussEl) gsap.set(discussEl, { opacity: 0, y: 20 });
                busyRef.current = false;
            }
        });
    }, [position]);

    const animateIcon = useCallback(opening => {
        const { icons, plusHs, plusVs } = getToggleEls();
        if (!icons.length || !plusHs.length || !plusVs.length) return;

        spinTweenRef.current?.kill();
        if (opening) {
            spinTweenRef.current = gsap.timeline()
                .to(icons, { rotate: 180, duration: 0.6, ease: 'power3.out' })
                .to(plusHs, { rotate: 45, duration: 0.4, ease: 'power2.out' }, 0)
                .to(plusVs, { rotate: 135, duration: 0.4, ease: 'power2.out' }, 0);
        } else {
            spinTweenRef.current = gsap.timeline()
                .to(icons, { rotate: 0, duration: 0.4, ease: 'power3.inOut' })
                .to(plusHs, { rotate: 0, duration: 0.3, ease: 'power3.inOut' }, 0)
                .to(plusVs, { rotate: 90, duration: 0.3, ease: 'power3.inOut' }, 0);
        }
    }, [getToggleEls]);

    const animateColor = useCallback(
        opening => {
            const { buttons } = getToggleEls();
            if (!buttons.length) return;
            colorTweenRef.current?.kill();
            if (changeMenuColorOnOpen) {
                const targetColor = opening ? openMenuButtonColor : menuButtonColor;
                colorTweenRef.current = gsap.to(buttons, {
                    color: targetColor,
                    delay: 0.18,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            } else {
                gsap.set(buttons, { color: menuButtonColor });
            }
        },
        [changeMenuColorOnOpen, getToggleEls, menuButtonColor, openMenuButtonColor]
    );

    React.useEffect(() => {
        const { buttons } = getToggleEls();
        if (!buttons.length) return;
        if (changeMenuColorOnOpen) {
            const targetColor = openRef.current ? openMenuButtonColor : menuButtonColor;
            gsap.set(buttons, { color: targetColor });
        } else {
            gsap.set(buttons, { color: menuButtonColor });
        }
    }, [changeMenuColorOnOpen, getToggleEls, menuButtonColor, openMenuButtonColor]);

    const animateText = useCallback(opening => {
        const { textInners } = getToggleEls();
        if (!textInners.length) return;
        textCycleAnimRef.current?.kill();

        const currentLabel = opening ? 'Menu' : 'Close';
        const targetLabel = opening ? 'Close' : 'Menu';
        const cycles = 3;
        const seq = [currentLabel];
        let last = currentLabel;
        for (let i = 0; i < cycles; i++) {
            last = last === 'Menu' ? 'Close' : 'Menu';
            seq.push(last);
        }
        if (last !== targetLabel) seq.push(targetLabel);
        seq.push(targetLabel);
        setTextLines(seq);

        gsap.set(textInners, { yPercent: 0 });
        const lineCount = seq.length;
        const finalShift = ((lineCount - 1) / lineCount) * 100;
        textCycleAnimRef.current = gsap.to(textInners, {
            yPercent: -finalShift,
            duration: 0.5 + lineCount * 0.07,
            ease: 'power4.out'
        });
    }, [getToggleEls]);

    const toggleMenu = useCallback(() => {
        const target = !openRef.current;
        openRef.current = target;
        setOpen(target);
        if (target) {
            onMenuOpen?.();
            playOpen();
        } else {
            onMenuClose?.();
            playClose();
        }
        animateIcon(target);
        animateColor(target);
        animateText(target);
    }, [playOpen, playClose, animateIcon, animateColor, animateText, onMenuOpen, onMenuClose, setOpen]);

    const closeMenu = useCallback(() => {
        if (openRef.current) {
            openRef.current = false;
            setOpen(false);
            setExpandedItem(null); // Reset sub-menus on close
            onMenuClose?.();
            playClose();
            animateIcon(false);
            animateColor(false);
            animateText(false);
        }
    }, [playClose, animateIcon, animateColor, animateText, onMenuClose, setOpen]);

    const toggleSubItem = useCallback((idx) => {
        setExpandedItem(prev => (prev === idx ? null : idx));
    }, []);

    const subContainersRef = useRef({});
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            Object.entries(subContainersRef.current).forEach(([idx, container]) => {
                if (!container) return;
                const index = parseInt(idx);
                const isExpanded = expandedItem === index;
                const list = container.querySelector('.sm-sub-list');
                const items = container.querySelectorAll('.sm-sub-item');

                if (isExpanded) {
                    gsap.to(container, {
                        height: 'auto',
                        duration: 0.6,
                        ease: 'power4.out',
                        overwrite: true
                    });
                    gsap.fromTo(items,
                        { y: 15, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.6,
                            stagger: 0.05,
                            ease: 'power3.out',
                            delay: 0.1,
                            overwrite: true
                        }
                    );
                } else {
                    gsap.to(container, {
                        height: 0,
                        duration: 0.4,
                        ease: 'power4.inOut',
                        overwrite: true
                    });
                    gsap.to(items, {
                        opacity: 0,
                        duration: 0.2,
                        overwrite: true
                    });
                }
            });
        });
        return () => ctx.revert();
    }, [expandedItem]);

    // Handle external open state changes
    React.useEffect(() => {
        if (externalOpen !== undefined) {
            if (externalOpen && !openRef.current) {
                openRef.current = true;
                playOpen();
                animateIcon(true);
                animateColor(true);
                animateText(true);
            } else if (!externalOpen && openRef.current) {
                openRef.current = false;
                playClose();
                animateIcon(false);
                animateColor(false);
                animateText(false);
            }
        }
    }, [externalOpen, playOpen, playClose, animateIcon, animateColor, animateText]);

    React.useEffect(() => {
        if (!closeOnClickAway || !open) return;

        const handleClickOutside = event => {
            if (!panelRef.current) return;
            const { buttons } = getToggleEls();
            const clickedToggle = buttons.some(btn => btn.contains(event.target));
            if (!panelRef.current.contains(event.target) && !clickedToggle) {
                closeMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [closeOnClickAway, open, closeMenu, getToggleEls]);

    const renderToggleButton = (index, extraClassName) => (
        <button
            ref={setToggleRef(index, 'button')}
            className={`sm-toggle${extraClassName ? ` ${extraClassName}` : ''}`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="staggered-menu-panel"
            onClick={toggleMenu}
            type="button"
        >
            <span ref={setToggleRef(index, 'textWrap')} className="sm-toggle-textWrap" aria-hidden="true">
                <span ref={setToggleRef(index, 'textInner')} className="sm-toggle-textInner">
                    {textLines.map((l, i) => (
                        <span className="sm-toggle-line" key={i}>
                            {l}
                        </span>
                    ))}
                </span>
            </span>
            <span ref={setToggleRef(index, 'icon')} className="sm-icon" aria-hidden="true">
                <span ref={setToggleRef(index, 'plusH')} className="sm-icon-line" />
                <span ref={setToggleRef(index, 'plusV')} className="sm-icon-line sm-icon-line-v" />
            </span>
        </button>
    );

    const LogoWrapper = logoLink ? (logoLinkComponent || 'a') : 'div';
    const logoWrapperProps = logoLink
        ? (logoLinkComponent ? { to: logoLink } : { href: logoLink })
        : {};

    return (
        <div
            className={(className ? className + ' ' : '') + 'staggered-menu-wrapper' + (isFixed ? ' fixed-wrapper' : '')}
            style={accentColor ? { ['--sm-accent']: accentColor } : undefined}
            data-position={position}
            data-open={open || undefined}
            data-panel-toggle={panelCloseMatchesToggle || undefined}
        >
            <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
                {(() => {
                    const raw = colors && colors.length ? colors.slice(0, 4) : ['#1e1e22', '#35353c'];
                    let arr = [...raw];
                    if (arr.length >= 3) {
                        const mid = Math.floor(arr.length / 2);
                        arr.splice(mid, 1);
                    }
                    return arr.map((c, i) => <div key={i} className="sm-prelayer" style={{ background: c }} />);
                })()}
            </div>
            {!hideHeader && (
                <header
                    className="staggered-menu-header"
                    aria-label="Main navigation header"
                    style={{
                        position: headerPosition,
                        justifyContent: headerJustify,
                        padding: headerPosition === 'absolute' ? '2em' : '0'
                    }}
                >
                    {!hideLogo && (
                        <LogoWrapper className="sm-logo" aria-label="Logo" {...logoWrapperProps}>
                            <img
                                src={logoUrl}
                                alt="Logo"
                                className="sm-logo-img"
                                draggable={false}
                            />
                        </LogoWrapper>
                    )}
                    {renderToggleButton(0)}
                </header>
            )}

            <aside id="staggered-menu-panel" ref={panelRef} className="staggered-menu-panel" aria-hidden={!open}>
                <div className="sm-panel-inner">
                    {!hidePanelClose && (
                        <div className="sm-panel-header">
                            <label
                                htmlFor="headersearch"
                                className="sm-panel-search-trigger"
                                aria-label="Open search"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 10C3 10.9193 3.18106 11.8295 3.53284 12.6788C3.88463 13.5281 4.40024 14.2997 5.05025 14.9497C5.70026 15.5998 6.47194 16.1154 7.32122 16.4672C8.1705 16.8189 9.08075 17 10 17C10.9193 17 11.8295 16.8189 12.6788 16.4672C13.5281 16.1154 14.2997 15.5998 14.9497 14.9497C15.5998 14.2997 16.1154 13.5281 16.4672 12.6788C16.8189 11.8295 17 10.9193 17 10C17 9.08075 16.8189 8.1705 16.4672 7.32122C16.1154 6.47194 15.5998 5.70026 14.9497 5.05025C14.2997 4.40024 13.5281 3.88463 12.6788 3.53284C11.8295 3.18106 10.9193 3 10 3C9.08075 3 8.1705 3.18106 7.32122 3.53284C6.47194 3.88463 5.70026 4.40024 5.05025 5.05025C4.40024 5.70026 3.88463 6.47194 3.53284 7.32122C3.18106 8.1705 3 9.08075 3 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M21 21L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </label>
                            {panelCloseMatchesToggle ? (
                                renderToggleButton(1, 'sm-panel-close-toggle')
                            ) : (
                                <button
                                    type="button"
                                    className="sm-panel-close"
                                    aria-label="Close menu"
                                    onClick={toggleMenu}
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    )}
                    <ul className="sm-panel-list" role="list" data-numbering={displayItemNumbering || undefined}>
                        {items && items.length ? (
                            items.map((it, idx) => {
                                const isExpanded = expandedItem === idx;
                                const hasSubItems = it.subItems && it.subItems.length > 0;

                                return (
                                    <li className={`sm-panel-itemWrap ${hasSubItems ? 'has-sub' : ''} ${isExpanded ? 'expanded' : ''}`} key={it.label + idx}>
                                        <div className="sm-panel-itemRow">
                                            {hasSubItems ? (
                                                <button
                                                    className="sm-panel-item sm-panel-itemButton"
                                                    type="button"
                                                    aria-label={it.ariaLabel}
                                                    aria-expanded={isExpanded}
                                                    data-index={idx + 1}
                                                    onClick={() => toggleSubItem(idx)}
                                                >
                                                    <span className="sm-panel-itemLabel">{it.label}</span>
                                                </button>
                                            ) : (
                                                <a
                                                    className="sm-panel-item"
                                                    href={it.link}
                                                    aria-label={it.ariaLabel}
                                                    data-index={idx + 1}
                                                    onClick={() => closeMenu()}
                                                >
                                                    <span className="sm-panel-itemLabel">{it.label}</span>
                                                </a>
                                            )}
                                            {hasSubItems && (
                                                <button
                                                    className="sm-sub-toggle"
                                                    onClick={() => toggleSubItem(idx)}
                                                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                                >
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                        {hasSubItems && (
                                            <div
                                                className="sm-sub-list-container"
                                                ref={el => subContainersRef.current[idx] = el}
                                            >
                                                <ul className="sm-sub-list">
                                                    {it.subItems.map((sub, sIdx) => (
                                                        <li key={sub.label + sIdx} className="sm-sub-item-wrap">
                                                            <a
                                                                href={sub.link}
                                                                className={`sm-sub-item ${sub.comingSoon ? 'sm-sub-item-disabled' : ''}`}
                                                                onClick={(e) => {
                                                                    if (sub.comingSoon) {
                                                                        e.preventDefault();
                                                                        return;
                                                                    }
                                                                    closeMenu();
                                                                }}
                                                            >
                                                                {sub.label}
                                                                {sub.comingSoon && (
                                                                    <span className="nav_coming_soon">Coming soon</span>
                                                                )}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </li>
                                );
                            })
                        ) : (
                            <li className="sm-panel-itemWrap" aria-hidden="true">
                                <span className="sm-panel-item">
                                    <span className="sm-panel-itemLabel">No items</span>
                                </span>
                            </li>
                        )}
                    </ul>

                    {(showDiscuss || (displaySocials && socialItems && socialItems.length > 0)) && (
                        <div className="sm-panel-bottom">
                            {showDiscuss && (
                                <div className="sm-discuss">
                                    <a href={discussLink} className="sm-discuss-link" onClick={() => closeMenu()}>
                                        <svg viewBox="0 0 1300 128">
                                            <symbol id="sm-s-text">
                                                <text textAnchor="middle" x="50%" y="50%" dy=".35em">LET’S DISCUSS</text>
                                            </symbol>
                                            <use className="text" xlinkHref="#sm-s-text"></use>
                                            <use className="text" xlinkHref="#sm-s-text"></use>
                                            <use className="text" xlinkHref="#sm-s-text"></use>
                                            <use className="text" xlinkHref="#sm-s-text"></use>
                                            <use className="text" xlinkHref="#sm-s-text"></use>
                                        </svg>
                                    </a>
                                </div>
                            )}

                            {displaySocials && socialItems && socialItems.length > 0 && (
                                <div className="sm-socials" aria-label="Social links">
                                    <h3 className="sm-socials-title">Socials</h3>
                                    <ul className="sm-socials-list" role="list">
                                        {socialItems.map((s, i) => (
                                            <li key={s.label + i} className="sm-socials-item">
                                                <a href={s.link} target="_blank" rel="noopener noreferrer" className="sm-socials-link">
                                                    {s.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
};

export default StaggeredMenu;
