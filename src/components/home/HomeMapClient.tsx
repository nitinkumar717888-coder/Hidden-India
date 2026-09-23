'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { MapDestinationMarker } from '@/lib/services/discovery-service';
import { FactBadge } from '@/components/common/FactBadge';

interface HomeMapClientProps {
  markers: MapDestinationMarker[];
}

export default function HomeMapClient({ markers }: HomeMapClientProps) {
  const [selectedDest, setSelectedDest] = useState<MapDestinationMarker>(
    markers[0] || {
      id: 'masrur',
      name: 'Masrur Rock-Cut Temples',
      slug: 'masrur-rock-cut-temples-kangra',
      latitude: 32.0628,
      longitude: 76.1558,
      state: 'Himachal Pradesh',
      district: 'Kangra',
      locality: 'Masrur',
      shortDescription:
        'An 8th-century monolithic rock-cut temple complex carved out of a single sandstone ridge overlooking the snow-capped Dhauladhars.',
      difficulty: 'easy',
      evidenceClassification: 'DOCUMENTED',
      categoryNames: ['Ancient', 'Archaeological'],
      primaryImage: {
        url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
        altText: 'Rock-cut stone spires reflecting into calm water reservoir with mountain view',
      },
    }
  );

  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamically load Leaflet on client
    import('leaflet').then((L) => {
      if (!containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [30.7333, 76.7794],
        zoom: 7,
        zoomControl: false,
        attributionControl: true,
      });


      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap Standard Tiles (No API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: 'home-map-marker-pin',
        html: `<div style="width:14px;height:14px;background:#AD4426;border:2px solid #FFFFFF;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const activeIcon = L.divIcon({
        className: 'home-map-marker-active',
        html: `<div style="width:20px;height:20px;background:#C07D2B;border:3px solid #FFFFFF;border-radius:50%;box-shadow:0 0 0 4px rgba(192,125,43,0.3), 0 4px 10px rgba(0,0,0,0.5);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const markerInstances: any[] = [];

      markers.forEach((m) => {
        if (!m.latitude || !m.longitude) return;

        const marker = L.marker([m.latitude, m.longitude], {
          icon: customIcon,
          title: m.name,
        }).addTo(map);

        marker.on('click', () => {
          setSelectedDest(m);
          map.panTo([m.latitude, m.longitude], { animate: true, duration: 0.8 });
        });

        markerInstances.push({ id: m.id, marker });
      });

      mapRef.current = { map, markerInstances, customIcon, activeIcon };
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.map.remove();
        mapRef.current = null;
      }
    };
  }, [markers]);

  // Update active marker icon when selectedDest changes
  useEffect(() => {
    if (!mapRef.current) return;
    const { map, markerInstances, customIcon, activeIcon } = mapRef.current;

    markerInstances.forEach(({ id, marker }: any) => {
      if (id === selectedDest.id) {
        marker.setIcon(activeIcon);
      } else {
        marker.setIcon(customIcon);
      }
    });

    if (selectedDest.latitude && selectedDest.longitude) {
      map.panTo([selectedDest.latitude, selectedDest.longitude], {
        animate: true,
        duration: 0.7,
      });
    }
  }, [selectedDest.id, selectedDest.latitude, selectedDest.longitude]);

  const locationDisplay = [selectedDest.locality, selectedDest.district, selectedDest.state]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="home-map-layout">
      {/* Left: Synchronized Destination Story Panel */}
      <aside className="home-map-sidebar" aria-label="Selected Destination Details">
        <div>
          {/* Destination Thumbnail */}
          <div
            style={{
              position: 'relative',
              height: '180px',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              marginBottom: 'var(--space-4)',
              border: '1px solid var(--color-border-dark)',
            }}
          >
            {selectedDest.primaryImage ? (
              <Image
                src={selectedDest.primaryImage.url}
                alt={selectedDest.primaryImage.altText || selectedDest.name}
                fill
                sizes="380px"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  height: '100%',
                  background: 'var(--color-bg-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-inverse-muted)',
                }}
              >
                Archival Record
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                top: 'var(--space-2)',
                left: 'var(--space-2)',
              }}
            >
              <FactBadge
                label={selectedDest.evidenceClassification}
                variant="evidence"
                evidenceType={selectedDest.evidenceClassification as any}
              />
            </div>
          </div>

          {/* Coordinates & Region */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.4rem',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-caption)',
                color: 'var(--color-ochre)',
              }}
            >
              {selectedDest.latitude.toFixed(4)}° N • {selectedDest.longitude.toFixed(4)}° E
            </span>
            <span
              style={{
                fontSize: 'var(--font-size-micro)',
                color: 'var(--color-text-inverse-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {selectedDest.state}
            </span>
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.35rem',
              color: '#FAF7F2',
              marginBottom: '0.35rem',
              lineHeight: 1.25,
            }}
          >
            {selectedDest.name}
          </h3>

          <p
            style={{
              fontSize: 'var(--font-size-caption)',
              color: 'var(--color-text-inverse-muted)',
              marginBottom: '0.75rem',
            }}
          >
            {locationDisplay}
          </p>

          <p
            style={{
              fontSize: '0.9rem',
              lineHeight: 1.55,
              color: 'rgba(250, 247, 242, 0.88)',
              marginBottom: '1rem',
            }}
          >
            {selectedDest.shortDescription}
          </p>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border-dark)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link
            href={`/destinations/${selectedDest.slug}`}
            className="btn btn-primary btn-sm"
            style={{ flexGrow: 1 }}
          >
            Explore Record &rarr;
          </Link>
          <Link
            href={`/map?dest=${selectedDest.slug}`}
            className="btn btn-secondary btn-sm"
          >
            Full Map
          </Link>
        </div>
      </aside>

      {/* Right: Leaflet Interactive Map */}
      <div className="home-map-canvas-wrap">
        <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '480px' }} />
        {/* Helper prompt overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 'var(--space-3)',
            left: 'var(--space-3)',
            zIndex: 1000,
            background: 'rgba(20, 25, 22, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-xs)',
            fontSize: 'var(--font-size-caption)',
            color: '#FAF7F2',
            border: '1px solid var(--color-border-dark)',
            pointerEvents: 'none',
          }}
        >
          Click any pin to inspect monument details
        </div>
      </div>
    </div>
  );
}
