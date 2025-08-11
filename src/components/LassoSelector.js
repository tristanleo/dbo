import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import './LassoSelector.css';

const LassoSelector = ({ mapInstance, onShopsSelected, selectedTerritory, markersRef }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState([]);
  const [lassoLayer, setLassoLayer] = useState(null);
  const [selectedShops, setSelectedShops] = useState([]);
  const isDrawingRef = useRef(false);
  const lassoLayerRef = useRef(null);
  const pathPointsRef = useRef([]);
  
  // Get the target territory (selected or first available)
  const targetTerritory = selectedTerritory || { name: 'Budi Santoso', color: '#FF6B6B' };

  // Debug logging when component mounts/updates
  useEffect(() => {
    console.log('LassoSelector: Component mounted/updated', {
      mapInstance: !!mapInstance,
      selectedTerritory: selectedTerritory?.name,
      markersRef: !!markersRef
    });
  }, [mapInstance, selectedTerritory, markersRef]);

  useEffect(() => {
    if (!mapInstance) return;

    console.log('LassoSelector: Setting up event listeners on map instance');

    const handleMouseDown = (e) => {
      // Only handle events when lasso is actually active
      if (!isDrawingRef.current) {
        console.log('Lasso mouse down:', e.latlng);
        console.log('Event type:', e.type);
        console.log('Event target:', e.target);
        
        try {
          isDrawingRef.current = true;
          setIsDrawing(true);
          setDrawingPath([]);
          setSelectedShops([]);
          
          // Start new path
          pathPointsRef.current = [e.latlng];
          setDrawingPath([e.latlng]);
          
          // Create lasso polyline layer with visible styling
          const newLassoLayer = L.polyline([e.latlng], {
            color: '#ff0000',
            weight: 8,
            opacity: 1,
            fillColor: '#ff0000',
            fillOpacity: 0.2,
            dashArray: '8, 4'
          });
          
          // Add CSS class for enhanced visibility
          try {
            const element = newLassoLayer.getElement();
            if (element) {
              element.classList.add('lasso-drawing');
            }
          } catch (cssError) {
            console.warn('Could not add CSS class:', cssError);
          }
          
          // Add to map
          newLassoLayer.addTo(mapInstance);
          setLassoLayer(newLassoLayer);
          lassoLayerRef.current = newLassoLayer;
          
          console.log('Lasso layer created and added to map');
        } catch (error) {
          console.warn('Lasso drawing failed:', error);
          isDrawingRef.current = false;
          setIsDrawing(false);
        }
      } else {
        console.log('Lasso already drawing, ignoring mouse down');
      }
    };

    const handleMouseMove = (e) => {
      if (!isDrawingRef.current || pathPointsRef.current.length === 0) return;
      
      try {
        if (lassoLayerRef.current) {
          // Add new point to path
          const newPoint = e.latlng;
          pathPointsRef.current.push(newPoint);
          
          // Update polyline with new point
          lassoLayerRef.current.setLatLngs(pathPointsRef.current);
          
          console.log('Lasso path updated:', pathPointsRef.current.length, 'points');
        }
      } catch (error) {
        console.warn('Lasso movement failed:', error);
      }
    };

    const handleMouseUp = () => {
      if (!isDrawingRef.current || pathPointsRef.current.length < 3) return;
      
      try {
        isDrawingRef.current = false;
        setIsDrawing(false);
        
        // Close the path by connecting back to start
        const closedPath = [...pathPointsRef.current, pathPointsRef.current[0]];
        
        // Update the polyline to show closed path
        if (lassoLayerRef.current) {
          lassoLayerRef.current.setLatLngs(closedPath);
          
          // Convert to polygon for better visual representation
          const polygonLayer = L.polygon(closedPath, {
            color: '#e74c3c',
            weight: 6,
            opacity: 1,
            fillColor: '#e74c3c',
            fillOpacity: 0.3,
            dashArray: '8, 4'
          });
          
          // Add CSS class for enhanced visibility
          try {
            const element = polygonLayer.getElement();
            if (element) {
              element.classList.add('lasso-complete');
            }
          } catch (cssError) {
            console.warn('Could not add CSS class to polygon:', cssError);
          }
          
          // Replace polyline with polygon
          mapInstance.removeLayer(lassoLayerRef.current);
          polygonLayer.addTo(mapInstance);
          lassoLayerRef.current = polygonLayer;
        }
        
        // Find shops within the lasso area
        const shopsInLasso = findShopsInLasso(closedPath);
        setSelectedShops(shopsInLasso);
        
        console.log('Lasso completed:', {
          points: closedPath.length,
          shopsFound: shopsInLasso.length,
          shops: shopsInLasso,
          selectedTerritory: selectedTerritory?.name || 'None'
        });
        
        if (shopsInLasso.length > 0) {
          // Ensure we have a valid territory ID
          let territoryId;
          if (selectedTerritory) {
            territoryId = selectedTerritory.id;
          } else {
            // If no territory is selected, use the first available one
            // This should match the territory IDs from the sample data
            territoryId = 'territory_1';
            console.log('LassoSelector: No territory selected, using fallback ID:', territoryId);
          }
          
          console.log('LassoSelector: Assigning shops to territory:', territoryId);
          console.log('LassoSelector: Calling onShopsSelected with:', { shopsInLasso, territoryId });
          onShopsSelected(shopsInLasso, territoryId);
        } else {
          console.log('LassoSelector: No shops found in lasso area');
        }
        
        // Keep the lasso visible for a few seconds then remove
        setTimeout(() => {
          if (lassoLayerRef.current) {
            mapInstance.removeLayer(lassoLayerRef.current);
            setLassoLayer(null);
            lassoLayerRef.current = null;
          }
          setDrawingPath([]);
          pathPointsRef.current = [];
        }, 3000);
        
      } catch (error) {
        console.warn('Lasso completion failed:', error);
        isDrawingRef.current = false;
        setIsDrawing(false);
      }
    };

    // Use capture: false to prevent interfering with other map events
    mapInstance.on('mousedown', handleMouseDown, { capture: false });
    mapInstance.on('mousemove', handleMouseMove, { capture: false });
    mapInstance.on('mouseup', handleMouseUp, { capture: false });

    return () => {
      mapInstance.off('mousedown', handleMouseDown);
      mapInstance.off('mousemove', handleMouseMove);
      mapInstance.off('mouseup', handleMouseUp);
      if (lassoLayerRef.current) {
        mapInstance.removeLayer(lassoLayerRef.current);
      }
    };
  }, [mapInstance, selectedTerritory, onShopsSelected]);

  const findShopsInLasso = (lassoPath) => {
    if (!lassoPath || lassoPath.length < 3) return [];
    
    try {
      const shopIds = [];
      
      console.log('Checking markers in lasso:', Object.keys(markersRef || {}));
      console.log('Lasso path points:', lassoPath.length);
      
      if (markersRef && typeof markersRef === 'object') {
        Object.entries(markersRef).forEach(([shopId, marker]) => {
          if (marker && marker.getLatLng) {
            const latlng = marker.getLatLng();
            if (isPointInPolygon(latlng, lassoPath)) {
              shopIds.push(shopId);
              console.log('Shop found in lasso:', shopId, latlng);
            }
          }
        });
      } else {
        console.warn('MarkersRef is not available:', markersRef);
      }
      
      console.log('Total shops found in lasso:', shopIds.length);
      return shopIds;
    } catch (error) {
      console.warn('Shop detection in lasso failed:', error);
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

  return (
    <div className={`lasso-selector ${isDrawing ? 'drawing' : ''}`}>
      {/* Always show lasso tool status when active */}
      <div className="lasso-status">
        🎯 Lasso Tool Active - Click and drag to draw selection area
      </div>
      
      {/* Show status about territory clearing */}
      <div className="lasso-info">
        Territories cleared - ready for manual assignment
      </div>
      
      {isDrawing && (
        <div className="lasso-instructions">
          Drawing lasso... Release to assign shops to {targetTerritory.name}
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

export default LassoSelector; 