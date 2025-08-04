import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import './LassoSelector.css';

const LassoSelector = ({ mapInstance, onShopsSelected, selectedTerritory }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [lassoPath, setLassoPath] = useState([]);
  const [lassoLayer, setLassoLayer] = useState(null);
  const [selectedShops, setSelectedShops] = useState([]);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    if (!mapInstance) return;

    const handleMouseDown = (e) => {
      if (!selectedTerritory) return;
      
      try {
        isDrawingRef.current = true;
        setIsDrawing(true);
        setLassoPath([e.latlng]);
        setSelectedShops([]);
        
        // Create lasso layer
        const newLassoLayer = L.polyline([e.latlng], {
          color: '#e74c3c',
          weight: 3,
          opacity: 0.8,
          fillColor: '#e74c3c',
          fillOpacity: 0.2
        }).addTo(mapInstance);
        setLassoLayer(newLassoLayer);
      } catch (error) {
        console.warn('Lasso drawing failed:', error);
        isDrawingRef.current = false;
        setIsDrawing(false);
      }
    };

    const handleMouseMove = (e) => {
      if (!isDrawingRef.current) return;
      
      try {
        const newPath = [...lassoPath, e.latlng];
        setLassoPath(newPath);
        
        if (lassoLayer) {
          lassoLayer.setLatLngs(newPath);
        }
      } catch (error) {
        console.warn('Lasso movement failed:', error);
      }
    };

    const handleMouseUp = () => {
      if (!isDrawingRef.current) return;
      
      try {
        isDrawingRef.current = false;
        setIsDrawing(false);
        
        // Find shops within the lasso area
        const shopsInLasso = findShopsInLasso(lassoPath);
        setSelectedShops(shopsInLasso);
        
        if (shopsInLasso.length > 0) {
          onShopsSelected(shopsInLasso, selectedTerritory.id);
        }
        
        // Remove lasso layer
        if (lassoLayer) {
          mapInstance.removeLayer(lassoLayer);
          setLassoLayer(null);
        }
        setLassoPath([]);
      } catch (error) {
        console.warn('Lasso completion failed:', error);
        isDrawingRef.current = false;
        setIsDrawing(false);
      }
    };

    mapInstance.on('mousedown', handleMouseDown);
    mapInstance.on('mousemove', handleMouseMove);
    mapInstance.on('mouseup', handleMouseUp);

    return () => {
      mapInstance.off('mousedown', handleMouseDown);
      mapInstance.off('mousemove', handleMouseMove);
      mapInstance.off('mouseup', handleMouseUp);
      if (lassoLayer) {
        mapInstance.removeLayer(lassoLayer);
      }
    };
  }, [mapInstance, selectedTerritory, lassoPath, lassoLayer, onShopsSelected]);

  const findShopsInLasso = (path) => {
    if (path.length < 3) return [];
    
    try {
      // Get all shop markers from the map
      const shopMarkers = [];
      mapInstance.eachLayer((layer) => {
        if (layer._icon && layer._icon.className && layer._icon.className.includes('custom-marker')) {
          const latlng = layer.getLatLng();
          if (isPointInPolygon(latlng, path)) {
            shopMarkers.push(layer);
          }
        }
      });
      
      return shopMarkers;
    } catch (error) {
      console.warn('Shop detection failed:', error);
      return [];
    }
  };

  const isPointInPolygon = (point, polygon) => {
    let inside = false;
    const x = point.lat;
    const y = point.lng;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat;
      const yi = polygon[i].lng;
      const xj = polygon[j].lat;
      const yj = polygon[j].lng;
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  };

  if (!selectedTerritory) {
    return null;
  }

  return (
    <div className={`lasso-selector ${isDrawing ? 'drawing' : ''}`}>
      {isDrawing && (
        <div className="lasso-instructions">
          Drawing lasso... Release to select shops for {selectedTerritory.name}
        </div>
      )}
      {selectedShops.length > 0 && (
        <div className="selection-feedback">
          Selected {selectedShops.length} shops for {selectedTerritory.name}
        </div>
      )}
    </div>
  );
};

export default LassoSelector; 