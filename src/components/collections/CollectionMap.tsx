'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

interface MapWaypoint {
  sequence: number;
  destination: {
    name: string;
    slug: string;
    latitude: number;
    longitude: number;
    locality: string | null;
    state: string;
  };
}

interface CollectionMapProps {
  waypoints: MapWaypoint[];
}

export default function CollectionMap({ waypoints }: CollectionMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current || waypoints.length === 0) return;

    import('leaflet').then((L) => {
      if (!mapContainerRef.current) return;

      const tileUrl =
        process.env.NEXT_PUBLIC_MAP_TILE_URL ||
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const attribution =
        process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        scrollWheelZoom: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer(tileUrl, {
        attribution,
        maxZoom: 19,
      }).addTo(map);

      const latLngs: [number, number][] = [];

      waypoints.forEach((wp) => {
        const { latitude, longitude, name, slug, locality, state } = wp.destination;
        latLngs.push([latitude, longitude]);

        // Custom numbered circle icon
        const iconHtml = `
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: var(--color-primary, #b84c24);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 14px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            border: 2px solid #ffffff;
          ">
            ${wp.sequence}
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'collection-trail-marker',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18],
        });

        const popupContent = `
          <div style="font-family: inherit; padding: 4px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; font-weight: 600;">
              Stop ${wp.sequence}
            </div>
            <strong style="font-size: 14px; display: block; margin: 2px 0 4px;">${name}</strong>
            <div style="font-size: 12px; color: #555; margin-bottom: 8px;">
              ${locality ? locality + ', ' : ''}${state}
            </div>
            <a href="/destinations/${slug}" style="
              display: inline-block;
              font-size: 12px;
              color: #b84c24;
              font-weight: 600;
              text-decoration: underline;
            ">
              View Monument Details →
            </a>
          </div>
        `;

        L.marker([latitude, longitude], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(map);
      });

      // Draw dashed connecting path between consecutive stops
      if (latLngs.length > 1) {
        L.polyline(latLngs, {
          color: 'var(--color-primary, #b84c24)',
          weight: 3,
          dashArray: '6, 8',
          opacity: 0.7,
        }).addTo(map);
      }

      // Fit bounds with padding
      if (latLngs.length > 0) {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [waypoints]);

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '420px',
          backgroundColor: 'var(--color-bg-subtle)',
        }}
      />
      <div
        style={{
          padding: 'var(--space-2) var(--space-4)',
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          fontSize: 'var(--font-size-caption)',
          color: 'var(--color-text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
        }}
      >
        <span>
          <strong>Numbered trail markers:</strong> Displays thematic sequence of stops along the collection.
        </span>
        <span style={{ fontStyle: 'italic' }}>
          * Editorial sequence shown; not a driving optimization.
        </span>
      </div>
    </div>
  );
}
