import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import mapboxgl from "mapbox-gl";
import { createRoot } from "react-dom/client";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  MAPBOX_ACCESS_TOKEN,
  MAPBOX_STYLE_URL,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
} from "@/lib/mapbox";

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const DEFAULT_HEIGHT = "24rem";

/**
 * Creates a custom marker element that's visible at all zoom levels
 * Uses a fixed-size container to prevent position shifts on hover
 * The marker stays perfectly centered at all times
 */
function createVisibleMarkerElement(markerColor) {
  // Outer container - fixed size, never changes
  const container = document.createElement("div");
  container.style.cssText = `
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
  `;

  // Inner marker circle - this can scale without affecting position
  const markerCircle = document.createElement("div");
  markerCircle.style.cssText = `
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${markerColor};
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
    transform-origin: center center;
  `;

  container.appendChild(markerCircle);

  // Hover effect - only scales the inner circle, container stays fixed
  container.addEventListener("mouseenter", () => {
    markerCircle.style.transform = "scale(1.3)";
  });

  container.addEventListener("mouseleave", () => {
    markerCircle.style.transform = "scale(1)";
  });

  return container;
}

const MapboxMap = forwardRef(({
  markers = [],
  renderPopup,
  height = "400px",
  markerColor = "#3b82f6",
  onMarkerClick,
  onViewportChange,
  isShowAllMode = true
}, ref) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRefs = useRef([]);
  const hasInitialFocusRef = useRef(false);

  // Expose map methods to parent
  useImperativeHandle(ref, () => ({
    zoomTo: (latitude, longitude) => {
      if (mapRef.current) {
        mapRef.current.easeTo({
          center: [longitude, latitude],
          zoom: 16.5,
          pitch: 60,
          bearing: -20,
          duration: 1000
        });
      }
    },
    showAll: (markers) => {
      if (mapRef.current && markers && markers.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        markers.forEach(marker => {
          bounds.extend([marker.longitude, marker.latitude]);
        });
        mapRef.current.fitBounds(bounds, {
          padding: 100,
          maxZoom: 5,
          pitch: 0,
          bearing: 0,
          duration: 1000
        });
      }
    },
    showPopup: (markerId) => {
      const markerRef = markerRefs.current.find(m => m.marker.id === markerId || (m.marker.getElement()?.dataset?.markerId === markerId));
      if (markerRef && markerRef.marker) {
        const popup = markerRef.marker.getPopup();
        if (popup) {
          popup.addTo(mapRef.current);
        }
      }
    },
    closeAllPopups: () => {
      markerRefs.current.forEach(({ marker }) => {
        const popup = marker.getPopup();
        if (popup && popup.isOpen()) {
          popup.remove();
        }
      });
    },
    resetView: () => {
      if (mapRef.current) {
        // If we have markers, fit the view to show all of them
        if (markers && markers.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          let hasValidCoords = false;
          markers.forEach(marker => {
            if (typeof marker.longitude === "number" && typeof marker.latitude === "number") {
              bounds.extend([marker.longitude, marker.latitude]);
              hasValidCoords = true;
            }
          });

          if (hasValidCoords) {
            mapRef.current.fitBounds(bounds, {
              padding: 100,
              maxZoom: 5,
              pitch: 0,
              bearing: 0,
              duration: 1000
            });
            return;
          }
        }

        // Fallback to default center if no markers
        mapRef.current.easeTo({
          center: DEFAULT_MAP_CENTER,
          zoom: DEFAULT_MAP_ZOOM,
          pitch: 0,
          bearing: 0,
          duration: 1000
        });
      }
    }
  }), [markers]);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/99b4f91f-a089-4227-b05d-f4392b5d7598', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MapboxMap.jsx:82', message: 'MapboxMap useEffect called', data: { hasMapRef: !!mapRef.current, hasContainer: !!containerRef.current, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
    // #endregion

    if (mapRef.current || !containerRef.current) return;

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/99b4f91f-a089-4227-b05d-f4392b5d7598', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MapboxMap.jsx:89', message: 'Initializing Mapbox map', data: { containerWidth: containerRef.current?.offsetWidth, containerHeight: containerRef.current?.offsetHeight, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
    // #endregion

    // Start with flat view (pitch: 0) to show continent-level overview
    // Users can zoom in and then see 3D when they click a marker
    // Mapbox style URLs automatically serve the latest published version
    // refreshExpiredTiles ensures we get fresh tiles when style is updated
    try {
      mapRef.current = new mapboxgl.Map({
        container: containerRef.current,
        style: MAPBOX_STYLE_URL, // This automatically gets the latest published style
        center: DEFAULT_MAP_CENTER,
        zoom: DEFAULT_MAP_ZOOM,
        pitch: 0, // Start flat for continent view
        bearing: 0, // No rotation initially
        refreshExpiredTiles: true, // Always fetch latest tiles from Mapbox
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/99b4f91f-a089-4227-b05d-f4392b5d7598', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MapboxMap.jsx:97', message: 'Mapbox Map instance created', data: { hasMap: !!mapRef.current, styleUrl: MAPBOX_STYLE_URL, accessTokenSet: !!mapboxgl.accessToken, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
      // #endregion
    } catch (initError) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/99b4f91f-a089-4227-b05d-f4392b5d7598', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MapboxMap.jsx:initError', message: 'Mapbox Map constructor error', data: { error: String(initError), timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
      // #endregion
      console.error('Mapbox Map constructor error:', initError);
      return;
    }

    // Only add navigation controls on desktop screens
    if (window.innerWidth >= 768) {
      mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");
    }

    // #region agent log - Event handlers
    mapRef.current.on('error', (e) => {
      fetch('http://127.0.0.1:7242/ingest/99b4f91f-a089-4227-b05d-f4392b5d7598', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MapboxMap.jsx:error', message: 'Mapbox error event', data: { error: String(e.error || e), errorType: e.type || 'unknown', timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
      console.error('Mapbox error:', e);
    });

    mapRef.current.on('styledata', () => {
      fetch('http://127.0.0.1:7242/ingest/99b4f91f-a089-4227-b05d-f4392b5d7598', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MapboxMap.jsx:styledata', message: 'Mapbox style data loaded', data: { timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
    });

    mapRef.current.on('load', () => {
      fetch('http://127.0.0.1:7242/ingest/99b4f91f-a089-4227-b05d-f4392b5d7598', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MapboxMap.jsx:load', message: 'Mapbox map loaded successfully', data: { timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
      console.log('Mapbox map loaded successfully');
    });

    // Timeout check - if map doesn't load within 5 seconds, log it
    setTimeout(() => {
      if (mapRef.current && !mapRef.current.loaded()) {
        fetch('http://127.0.0.1:7242/ingest/99b4f91f-a089-4227-b05d-f4392b5d7598', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'MapboxMap.jsx:timeout', message: 'Mapbox map load timeout', data: { loaded: mapRef.current.loaded(), timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
      }
    }, 5000);
    // #endregion

    // Enable 3D buildings when style loads
    // Also ensure we're using the latest published style
    mapRef.current.once("style.load", () => {
      // Force reload to get latest style if it was just published
      const layers = mapRef.current.getStyle().layers;
      const buildingLayer = layers.find(layer =>
        layer.id.includes("building") && layer.type === "fill-extrusion"
      );

      if (buildingLayer) {
        // Ensure 3D buildings are visible
        mapRef.current.setPaintProperty(buildingLayer.id, "fill-extrusion-opacity", 0.7);
      }
    });

    // Track viewport changes to filter visible professionals
    const updateViewport = () => {
      if (mapRef.current && onViewportChange) {
        const bounds = mapRef.current.getBounds();
        onViewportChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      }
    };

    // Listen to map movements to update viewport
    mapRef.current.on("moveend", updateViewport);
    mapRef.current.on("zoomend", updateViewport);

    // Initial viewport update
    mapRef.current.once("load", updateViewport);

    // Listen for style changes to ensure we always have the latest
    mapRef.current.on("style.load", () => {
      // Style has loaded/updated - ensure 3D buildings are still configured
      const layers = mapRef.current.getStyle().layers;
      const buildingLayer = layers.find(layer =>
        layer.id.includes("building") && layer.type === "fill-extrusion"
      );

      if (buildingLayer) {
        mapRef.current.setPaintProperty(buildingLayer.id, "fill-extrusion-opacity", 0.7);
      }
    });

    return () => {
      markerRefs.current.forEach(({ marker, root }) => {
        marker.remove();
        if (root) {
          root.unmount();
        }
      });
      markerRefs.current = [];

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markerRefs.current.forEach(({ marker, root }) => {
      marker.remove();
      if (root) {
        root.unmount();
      }
    });
    markerRefs.current = [];

    const validMarkers = markers.filter((marker) => {
      return (
        marker &&
        typeof marker.latitude === "number" &&
        typeof marker.longitude === "number"
      );
    });

    if (validMarkers.length === 0) {
      mapRef.current.easeTo({
        center: DEFAULT_MAP_CENTER,
        zoom: DEFAULT_MAP_ZOOM,
        pitch: 0,
        bearing: 0,
        duration: 600
      });
      return;
    }

    validMarkers.forEach((markerData) => {
      const { latitude, longitude } = markerData;

      // Create custom marker element that's visible at all zoom levels
      const markerEl = createVisibleMarkerElement(markerData.color || markerColor);

      // CRITICAL: anchor must be "center" to ensure marker is at exact location
      // The fixed-size container ensures no position shifts on hover
      markerEl.dataset.markerId = markerData.id;
      const marker = new mapboxgl.Marker({
        element: markerEl,
        anchor: "center" // This keeps the marker exactly centered on its coordinates
      }).setLngLat([longitude, latitude]); // Exact lat/lng position
      marker.id = markerData.id;

      // Add click handler to zoom in for 3D view
      markerEl.addEventListener("click", (e) => {
        e.stopPropagation();

        // Zoom in close enough to see 3D buildings (zoom 16-17)
        mapRef.current.easeTo({
          center: [longitude, latitude],
          zoom: 16.5,
          pitch: 60,
          bearing: -20,
          duration: 1000
        });

        // Call optional onMarkerClick callback
        if (onMarkerClick) {
          onMarkerClick(markerData);
        }
      });

      let popupRoot = null;
      if (typeof renderPopup === "function") {
        const popupContent = renderPopup(markerData);
        if (popupContent) {
          const popupNode = document.createElement("div");
          popupRoot = createRoot(popupNode);
          popupRoot.render(popupContent);

          const popup = new mapboxgl.Popup({
            offset: 12,
            closeButton: true,
            closeOnClick: false
          }).setDOMContent(popupNode);

          popup.on("close", () => {
            if (popupRoot) {
              popupRoot.unmount();
            }
          });
          marker.setPopup(popup);
        }
      }

      marker.addTo(mapRef.current);
      markerRefs.current.push({ marker, root: popupRoot });
    });

    // Fit bounds logic - ONLY IF isShowAllMode is true and markers exist
    if (isShowAllMode && markers.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      let hasValidCoords = false;

      markers.forEach((marker) => {
        if (typeof marker.longitude === "number" && typeof marker.latitude === "number") {
          bounds.extend([marker.longitude, marker.latitude]);
          hasValidCoords = true;
        }
      });

      if (hasValidCoords) {
        // If single marker, zoom closer
        if (markers.length === 1) {
          mapRef.current.setCenter([markers[0].longitude, markers[0].latitude]);
          mapRef.current.setZoom(14);
        } else {
          mapRef.current.fitBounds(bounds, {
            padding: 100,
            maxZoom: 5, // Continent-level zoom
            duration: 1000
          });
        }
      }
    }
  }, [markers, renderPopup, markerColor, onMarkerClick, isShowAllMode]);

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        width: '100%',
        height: height === "100%" ? "100%" : height === "100vh" ? "100vh" : height,
        minHeight: height === "100%" ? "100vh" : height,
        position: 'relative',
        backgroundColor: '#0f172a' // Dark background to show container exists
      }}
    >
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '100vh',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'transparent'
        }}
      />
    </div>
  );
});

export default MapboxMap;
