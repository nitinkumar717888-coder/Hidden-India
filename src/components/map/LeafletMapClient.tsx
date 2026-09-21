'use client';

import React, { useEffect, useRef } from 'react';
import type { MapDestinationMarker } from '@/lib/services/discovery-service';
import type { UserCoordinates } from '@/lib/location/types';

interface LeafletMapClientProps {
  destinations: MapDestinationMarker[];
  selectedDestination: MapDestinationMarker | null;
  onSelectDestination: (dest: MapDestinationMarker | null) => void;
  userCoordinates: UserCoordinates | null;
}

export default function LeafletMapClient({
  destinations,
  selectedDestination,
  onSelectDestination,
  userCoordinates,
}: LeafletMapClientProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Dynamically load Leaflet on the client
    import('leaflet').then((L) => {
      if (!mapContainerRef.current) return;

      const tileUrl =
        process.env.NEXT_PUBLIC_MAP_TILE_URL ||
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      const attribution =
        process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

      // Initialize map centered on Northern India
      const map = L.map(mapContainerRef.current, {
        center: [30.7333, 76.7794], // Chandigarh Regional Hub
        zoom: 7,
        minZoom: 5,
        maxZoom: 18,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer(tileUrl, {
        attribution,
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Initialize marker cluster group or layer group
      let markersGroup: any;
      try {
        require('leaflet.markercluster');
        markersGroup = (L as any).markerClusterGroup({
          maxClusterRadius: 45,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          iconCreateFunction: (cluster: any) => {
            const count = cluster.getChildCount();
            let sizeClass = 'cluster-small';
            if (count > 25) sizeClass = 'cluster-large';
            else if (count > 10) sizeClass = 'cluster-medium';

            return L.divIcon({
              html: `<span>${count}</span>`,
              className: `leaflet-cluster-marker ${sizeClass}`,
              iconSize: L.point(40, 40),
            });
          },
        });
      } catch {
        markersGroup = L.layerGroup();
      }

      markersGroup.addTo(map);
      mapInstanceRef.current = map;
      markersLayerRef.current = markersGroup;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update destination markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    import('leaflet').then((L) => {
      const markersGroup = markersLayerRef.current;
      markersGroup.clearLayers();

      const bounds = L.latLngBounds([]);

      destinations.forEach((dest) => {
        const isSelected = selectedDestination?.id === dest.id;

        // Custom styled SVG marker pin
        const pinHtml = `
          <div class="custom-map-marker ${isSelected ? 'marker-selected' : ''}" title="${dest.name}">
            <div class="marker-pin-inner">
              <span class="marker-icon-symbol">🏛️</span>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'map-marker-wrapper',
          html: pinHtml,
          iconSize: [36, 44],
          iconAnchor: [18, 44],
          popupAnchor: [0, -44],
        });

        const marker = L.marker([dest.latitude, dest.longitude], { icon: customIcon });

        marker.on('click', () => {
          onSelectDestination(dest);
        });

        marker.addTo(markersGroup);
        bounds.extend([dest.latitude, dest.longitude]);
      });

      // If multiple markers exist and none selected, fit bounds
      if (destinations.length > 1 && !selectedDestination && bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    });
  }, [destinations, selectedDestination, onSelectDestination]);

  // Center on selected destination
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedDestination) return;
    mapInstanceRef.current.setView(
      [selectedDestination.latitude, selectedDestination.longitude],
      11,
      { animate: true }
    );
  }, [selectedDestination]);

  // Render user location marker when present
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      if (userMarkerRef.current) {
        mapInstanceRef.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }

      if (userCoordinates) {
        const userIcon = L.divIcon({
          className: 'user-location-marker-wrapper',
          html: `
            <div class="user-location-ping">
              <div class="ping-circle"></div>
              <div class="ping-dot"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const userMarker = L.marker(
          [userCoordinates.latitude, userCoordinates.longitude],
          { icon: userIcon, title: 'Your Current Approximate Location' }
        ).addTo(mapInstanceRef.current);

        userMarkerRef.current = userMarker;
      }
    });
  }, [userCoordinates]);

  return <div ref={mapContainerRef} className="leaflet-map-canvas" style={{ width: '100%', height: '100%' }} />;
}
