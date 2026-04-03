'use client';

import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';

interface LocationMapProps {
  lat: number;
  lon: number;
  locationName: string;
  className?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({ lat, lon, locationName, className }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create map if it doesn't exist
    if (!mapInstanceRef.current) {
      const map = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat([lon, lat]),
          zoom: 15,
        }),
      });

      // Add marker
      const marker = new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        name: locationName,
      });

      marker.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: 'data:image/svg+xml;base64,' + btoa(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="10" fill="#F59E0B" stroke="#fff" stroke-width="2"/>
                <circle cx="16" cy="16" r="4" fill="#fff"/>
              </svg>
            `),
            scale: 1,
          }),
        })
      );

      const vectorSource = new VectorSource({
        features: [marker],
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      map.addLayer(vectorLayer);
      mapInstanceRef.current = map;
    } else {
      // Update map center and marker position
      const map = mapInstanceRef.current;
      const view = map.getView();
      view.setCenter(fromLonLat([lon, lat]));
      
      // Update marker
      const layers = map.getLayers().getArray();
      const vectorLayer = layers.find(layer => layer instanceof VectorLayer) as VectorLayer<VectorSource> | undefined;
      if (vectorLayer) {
        const source = vectorLayer.getSource();
        if (source) {
          const features = source.getFeatures();
          if (features.length > 0) {
            const marker = features[0];
            marker.setGeometry(new Point(fromLonLat([lon, lat])));
          }
        }
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lon, locationName]);

  return (
    <div
      ref={mapRef}
      className={className || 'w-full h-48 rounded-lg overflow-hidden'}
      style={{ minHeight: '192px' }}
    />
  );
};

export default LocationMap;

