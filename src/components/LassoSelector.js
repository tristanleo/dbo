import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import './LassoSelector.css';

const RectangleSelector = ({ mapInstance, onShopsSelected, selectedTerritory, markersRef }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [rectangleLayer, setRectangleLayer] = useState(null);
  const [selectedShops, setSelectedShops] = useState([]);
  const isDrawingRef = useRef(false);
  const rectangleLayerRef = useRef(null);
  
  // Get the target territory (selected or first available)
  const targetTerritory = selectedTerritory || { name: 'Budi Santoso', color: '#FF6B6B' };

  useEffect(() => {
    if (!mapInstance) return;

    const handleMouseDown = (e) => {
      // Allow drawing even without a selected territory when rectangle tool is active
      // The territory will be created based on the selected shops
      
      console.log('Rectangle mouse down:', e.latlng);
      
      try {
        isDrawingRef.current = true;
        setIsDrawing(true);
        setStartPoint(e.latlng);
        setSelectedShops([]);
        
        // Create rectangle layer with more visible styling
        const bounds = L.latLngBounds(e.latlng, e.latlng);
        const newRectangleLayer = L.rectangle(bounds, {
          color: '#e74c3c',
          weight: 4,
          opacity: 1,
          fillColor: '#e74c3c',
          fillOpacity: 0.3,
          dashArray: '15, 8'
        });
        
        // Explicitly add to map
        newRectangleLayer.addTo(mapInstance);
        setRectangleLayer(newRectangleLayer);
        rectangleLayerRef.current = newRectangleLayer;
        console.log('Rectangle layer created and added to map', {
          layer: newRectangleLayer,
          bounds: newRectangleLayer.getBounds(),
          mapLayers: mapInstance.getLayers().length
        });
        
        // Also create a simple polyline as backup for visibility
        const backupLine = L.polyline([e.latlng, e.latlng], {
          color: '#ff0000',
          weight: 6,
          opacity: 1
        }).addTo(mapInstance);
        console.log('Backup line created for visibility');
      } catch (error) {
        console.warn('Rectangle drawing failed:', error);
        isDrawingRef.current = false;
        setIsDrawing(false);
      }
    };

    const handleMouseMove = (e) => {
      if (!isDrawingRef.current || !startPoint) return;
      
      try {
        if (rectangleLayerRef.current) {
          // Update rectangle bounds
          const bounds = L.latLngBounds(startPoint, e.latlng);
          rectangleLayerRef.current.setBounds(bounds);
          console.log('Rectangle bounds updated:', bounds, 'start:', startPoint, 'current:', e.latlng);
        } else {
          console.warn('Rectangle layer is null during mouse move');
        }
      } catch (error) {
        console.warn('Rectangle movement failed:', error);
      }
    };

    const handleMouseUp = () => {
      if (!isDrawingRef.current || !startPoint) return;
      
      try {
        isDrawingRef.current = false;
        setIsDrawing(false);
        
        // Get the final bounds of the rectangle
        const finalBounds = rectangleLayerRef.current ? rectangleLayerRef.current.getBounds() : null;
        
        if (finalBounds) {
          // Find shops within the rectangle area
          const shopsInRectangle = findShopsInRectangle(finalBounds);
          setSelectedShops(shopsInRectangle);
          
          console.log('Rectangle completed:', {
            bounds: finalBounds,
            shopsFound: shopsInRectangle.length,
            shops: shopsInRectangle
          });
          
          if (shopsInRectangle.length > 0) {
            // Use the first available territory if none is selected
            const territoryId = selectedTerritory ? selectedTerritory.id : 'territory_1';
            onShopsSelected(shopsInRectangle, territoryId);
          }
        }
        
        // Remove rectangle layer
        if (rectangleLayerRef.current) {
          mapInstance.removeLayer(rectangleLayerRef.current);
          setRectangleLayer(null);
          rectangleLayerRef.current = null;
        }
        setStartPoint(null);
      } catch (error) {
        console.warn('Rectangle completion failed:', error);
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
      if (rectangleLayerRef.current) {
        mapInstance.removeLayer(rectangleLayerRef.current);
      }
    };
  }, [mapInstance, selectedTerritory, onShopsSelected]);

  const findShopsInRectangle = (bounds) => {
    if (!bounds) return [];
    
    try {
      // Get shop IDs that are within the rectangle bounds
      const shopIds = [];
      
      console.log('Checking markers:', Object.keys(markersRef || {}));
      console.log('MarkersRef type:', typeof markersRef, markersRef);
      console.log('Rectangle bounds:', bounds);
      
      if (markersRef && typeof markersRef === 'object') {
        Object.entries(markersRef).forEach(([shopId, marker]) => {
          if (marker && marker.getLatLng) {
            const latlng = marker.getLatLng();
            if (bounds.contains(latlng)) {
              shopIds.push(shopId);
              console.log('Shop found in rectangle:', shopId, latlng);
            }
          }
        });
      } else {
        console.warn('MarkersRef is not available:', markersRef);
      }
      
      console.log('Total shops found:', shopIds.length);
      return shopIds;
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

  // Always show the lasso selector when active, even without a selected territory

  return (
    <div className={`rectangle-selector ${isDrawing ? 'drawing' : ''}`}>
      {isDrawing && (
        <div className="rectangle-instructions">
          Drawing rectangle... Release to assign shops to {targetTerritory.name}
        </div>
      )}
      {selectedShops.length > 0 && (
        <div className="selection-feedback">
          Selected {selectedShops.length} shops for {targetTerritory.name}
        </div>
      )}
    </div>
  );
};

export default RectangleSelector; 