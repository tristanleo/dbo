import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapContainer.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapContainer = ({ shops, territories, selectedTerritory, mapData, onShopMove, onShopsSelected }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const territoryLayersRef = useRef({});
  const [isLassoActive, setIsLassoActive] = useState(false);

  useEffect(() => {
    if (!mapInstanceRef.current) {
      // Initialize map
      mapInstanceRef.current = L.map(mapRef.current).setView(mapData.center, mapData.zoom);
      
      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map when data changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers and territory layers
    Object.values(markersRef.current).forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = {};

    // Clear all existing territory layers and labels
    Object.values(territoryLayersRef.current).forEach(territoryData => {
      if (territoryData.polygon) {
        mapInstanceRef.current.removeLayer(territoryData.polygon);
      }
      if (territoryData.label) {
        mapInstanceRef.current.removeLayer(territoryData.label);
      }
    });
    territoryLayersRef.current = {};

    // Add territory overlays
    territories.forEach(territory => {
      if (territory.shops.length > 0) {
        // Create territory boundary (convex hull of shops)
        const points = territory.shops.map(shop => shop.coordinates);
        const hull = createConvexHull(points);
        
        if (hull.length > 2) {
          const territoryLayer = L.polygon(hull, {
            color: territory.color,
            fillColor: territory.color,
            fillOpacity: 0.2,
            weight: 2,
            opacity: 0.8
          }).addTo(mapInstanceRef.current);

          // Add territory label
          const center = territory.center;
          const territoryLabel = L.marker(center, {
            icon: L.divIcon({
              className: 'territory-label',
              html: `<div style="background: ${territory.color}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">${territory.name}</div>`,
              iconSize: [100, 30],
              iconAnchor: [50, 15]
            })
          }).addTo(mapInstanceRef.current);

          // Store both the polygon and label for this territory
          territoryLayersRef.current[territory.id] = {
            polygon: territoryLayer,
            label: territoryLabel
          };
        }
      }
    });

    // Add shop markers
    shops.forEach(shop => {
      const territory = territories.find(t => t.shops.some(s => s.id === shop.id));
      const isSelected = selectedTerritory && selectedTerritory.id === territory?.id;
      
      const markerColor = territory ? territory.color : '#666';
      const markerSize = shop.priority === 'high' ? 12 : 8;
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: ${markerSize}px; 
            height: ${markerSize}px; 
            background: ${markerColor}; 
            border: 2px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ${isSelected ? 'border: 3px solid #333;' : ''}
          "></div>
        `,
        iconSize: [markerSize + 4, markerSize + 4],
        iconAnchor: [(markerSize + 4) / 2, (markerSize + 4) / 2]
      });

      const marker = L.marker(shop.coordinates, { icon: customIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h4 style="margin: 0 0 8px 0; color: #333;">${shop.name}</h4>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">${shop.address}</p>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">${shop.phone}</p>
            <div style="margin-top: 8px;">
              <span style="background: ${shop.priority === 'high' ? '#e74c3c' : '#95a5a6'}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">
                ${shop.priority}
              </span>
              <span style="background: ${shop.status === 'visited' ? '#27ae60' : '#f39c12'}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-left: 4px;">
                ${shop.status}
              </span>
            </div>
            ${territory ? `<p style="margin: 8px 0 0 0; font-size: 11px; color: #666;">Territory: ${territory.name}</p>` : ''}
          </div>
        `);

      // Make markers draggable for territory reassignment
      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        const newTerritory = findClosestTerritory(newPos, territories);
        
        if (newTerritory && newTerritory.id !== territory?.id) {
          onShopMove(shop.id, territory?.id, newTerritory.id);
        }
      });

      markersRef.current[shop.id] = marker;
    });

    // Fit map to show all markers
    if (shops.length > 0) {
      const group = new L.featureGroup(Object.values(markersRef.current));
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }

  }, [shops, territories, selectedTerritory, onShopMove]);

  // Simple convex hull algorithm for territory boundaries
  const createConvexHull = (points) => {
    if (points.length < 3) return points;
    
    // Graham scan algorithm
    const sorted = points.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    const lower = [];
    const upper = [];
    
    for (const point of sorted) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
        lower.pop();
      }
      lower.push(point);
    }
    
    for (let i = sorted.length - 1; i >= 0; i--) {
      const point = sorted[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
        upper.pop();
      }
      upper.push(point);
    }
    
    upper.pop();
    lower.pop();
    return [...lower, ...upper];
  };

  const cross = (o, a, b) => {
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  };

  const findClosestTerritory = (position, territories) => {
    let closest = null;
    let minDistance = Infinity;
    
    territories.forEach(territory => {
      const distance = Math.sqrt(
        Math.pow(position.lat - territory.center[0], 2) + 
        Math.pow(position.lng - territory.center[1], 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closest = territory;
      }
    });
    
    return closest;
  };

  const handleShopsSelected = (selectedMarkers, territoryId) => {
    const selectedShopIds = selectedMarkers.map(marker => {
      // Find the shop ID from the marker
      for (const [shopId, markerRef] of Object.entries(markersRef.current)) {
        if (markerRef === marker) {
          return shopId;
        }
      }
      return null;
    }).filter(id => id !== null);
    
    onShopsSelected(selectedShopIds, territoryId);
  };

  return (
    <div className={`map-container ${isLassoActive ? 'lasso-active' : ''}`}>
      <div ref={mapRef} className="map" />
      {/* Temporarily disabled lasso selector to fix Leaflet errors */}
      {/* <LassoSelector 
        mapInstance={mapInstanceRef.current}
        onShopsSelected={handleShopsSelected}
        selectedTerritory={selectedTerritory}
      /> */}
    </div>
  );
};

export default MapContainer; 