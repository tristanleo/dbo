import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import MapContainer from './components/MapContainer';
import RightSidebar from './components/RightSidebar';
import { generateSampleData, generateOptimizedClusters } from './utils/sampleData';
import './styles/App.css';

function App() {
  const [salesmenCount, setSalesmenCount] = useState(3);
  const [territories, setTerritories] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [mapData, setMapData] = useState({
    center: [-6.9175, 107.6191], // Bandung, West Java coordinates
    zoom: 8
  });
  
  // Sidebar collapse states
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  
  // Lasso tool state
  const [isLassoActive, setIsLassoActive] = useState(false);

  // Initialize with sample data
  useEffect(() => {
    const { shopsData, territoriesData } = generateSampleData(salesmenCount);
    setShops(shopsData);
    setTerritories(territoriesData);
    setSelectedTerritory(territoriesData[0]);
  }, [salesmenCount]);

  const handleSalesmenChange = (newCount) => {
    setSalesmenCount(newCount);
  };

  const handleTerritorySelect = (territory) => {
    setSelectedTerritory(territory);
  };

  const handleShopMove = (shopId, fromTerritoryId, toTerritoryId) => {
    // Update territories when shops are moved
    const updatedTerritories = territories.map(territory => {
      if (territory.id === fromTerritoryId) {
        return {
          ...territory,
          shops: territory.shops.filter(shop => shop.id !== shopId)
        };
      }
      if (territory.id === toTerritoryId) {
        const shopToMove = shops.find(shop => shop.id === shopId);
        return {
          ...territory,
          shops: [...territory.shops, shopToMove]
        };
      }
      return territory;
    });
    setTerritories(updatedTerritories);
  };

  const handleGenerateClusters = () => {
    // Add visual feedback
    const button = document.querySelector('.generate-clusters-btn');
    if (button) {
      button.textContent = '🔄 Generating...';
      button.disabled = true;
    }
    
    // Small delay to show the loading state
    setTimeout(() => {
      const { territoriesData } = generateOptimizedClusters(shops, salesmenCount);
      setTerritories(territoriesData);
      setSelectedTerritory(territoriesData[0]);
      
      // Reset button
      if (button) {
        button.textContent = '🎯 Generate Clusters';
        button.disabled = false;
      }
    }, 500);
  };

  const handleShopsSelected = (selectedShopIds, territoryId) => {
    // Find the territory to assign shops to
    const targetTerritory = territories.find(t => t.id === territoryId);
    
    if (targetTerritory) {
      // Move selected shops to the specified territory
      const selectedShops = shops.filter(shop => selectedShopIds.includes(shop.id));
      
      const updatedTerritories = territories.map(territory => {
        if (territory.id === territoryId) {
          // Add selected shops to this territory
          const updatedShops = [...territory.shops, ...selectedShops];
          return {
            ...territory,
            shops: updatedShops,
            center: calculateCenter(updatedShops.map(shop => shop.coordinates)),
            totalDistance: calculateTotalDistance(updatedShops),
            estimatedTime: Math.round(calculateTotalDistance(updatedShops) / 15 * 10) / 10,
            shopCount: updatedShops.length
          };
        } else {
          // Remove selected shops from other territories
          const filteredShops = territory.shops.filter(shop => !selectedShopIds.includes(shop.id));
          return {
            ...territory,
            shops: filteredShops,
            center: calculateCenter(filteredShops.map(shop => shop.coordinates)),
            totalDistance: calculateTotalDistance(filteredShops),
            estimatedTime: Math.round(calculateTotalDistance(filteredShops) / 15 * 10) / 10,
            shopCount: filteredShops.length
          };
        }
      });
      setTerritories(updatedTerritories);
      setSelectedTerritory(updatedTerritories.find(t => t.id === territoryId));
    }
  };

  const toggleLeftSidebar = () => {
    setLeftSidebarCollapsed(!leftSidebarCollapsed);
  };

  const toggleRightSidebar = () => {
    setRightSidebarCollapsed(!rightSidebarCollapsed);
  };

  // Helper functions for territory creation
  const getRandomColor = () => {
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const calculateCenter = (coordinates) => {
    if (coordinates.length === 0) return [0, 0];
    const sumLat = coordinates.reduce((sum, coord) => sum + coord[0], 0);
    const sumLng = coordinates.reduce((sum, coord) => sum + coord[1], 0);
    return [sumLat / coordinates.length, sumLng / coordinates.length];
  };

  const calculateTotalDistance = (selectedShops) => {
    if (selectedShops.length < 2) return 0;
    let totalDistance = 0;
    for (let i = 0; i < selectedShops.length - 1; i++) {
      const shop1 = selectedShops[i];
      const shop2 = selectedShops[i + 1];
      const distance = Math.sqrt(
        Math.pow(shop1.coordinates[0] - shop2.coordinates[0], 2) +
        Math.pow(shop1.coordinates[1] - shop2.coordinates[1], 2)
      ) * 111; // Convert to km (roughly)
      totalDistance += distance;
    }
    return Math.round(totalDistance * 10) / 10;
  };

  const toggleLasso = () => {
    if (!isLassoActive) {
      // Clear shop assignments but keep salesman structure
      const clearedTerritories = territories.map(territory => ({
        ...territory,
        shops: [],
        center: [0, 0],
        totalDistance: 0,
        estimatedTime: 0,
        shopCount: 0
      }));
      setTerritories(clearedTerritories);
      setSelectedTerritory(null);
    }
    setIsLassoActive(!isLassoActive);
  };

  return (
    <div className="app-container">
      <Header 
        salesmenCount={salesmenCount}
        onSalesmenChange={handleSalesmenChange}
        onGenerateClusters={handleGenerateClusters}
      />
      
      <LeftSidebar 
        territories={territories}
        selectedTerritory={selectedTerritory}
        onTerritorySelect={handleTerritorySelect}
        collapsed={leftSidebarCollapsed}
        onToggle={toggleLeftSidebar}
      />
      
      <MapContainer 
        shops={shops}
        territories={territories}
        selectedTerritory={selectedTerritory}
        mapData={mapData}
        onShopMove={handleShopMove}
        onShopsSelected={handleShopsSelected}
        isLassoActive={isLassoActive}
      />
      
      <RightSidebar 
        selectedTerritory={selectedTerritory}
        territories={territories}
        collapsed={rightSidebarCollapsed}
        onToggle={toggleRightSidebar}
        isLassoActive={isLassoActive}
        onLassoToggle={toggleLasso}
      />
    </div>
  );
}

export default App; 