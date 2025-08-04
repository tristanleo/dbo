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
    center: [40.7128, -74.0060], // New York coordinates
    zoom: 10
  });
  
  // Sidebar collapse states
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

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
    const { territoriesData } = generateOptimizedClusters(shops, salesmenCount);
    setTerritories(territoriesData);
    setSelectedTerritory(territoriesData[0]);
  };

  const handleShopsSelected = (selectedShopIds, territoryId) => {
    // Move selected shops to the specified territory
    const updatedTerritories = territories.map(territory => {
      if (territory.id === territoryId) {
        // Add selected shops to this territory
        const shopsToAdd = shops.filter(shop => selectedShopIds.includes(shop.id));
        return {
          ...territory,
          shops: [...territory.shops, ...shopsToAdd]
        };
      } else {
        // Remove selected shops from other territories
        return {
          ...territory,
          shops: territory.shops.filter(shop => !selectedShopIds.includes(shop.id))
        };
      }
    });
    setTerritories(updatedTerritories);
  };

  const toggleLeftSidebar = () => {
    setLeftSidebarCollapsed(!leftSidebarCollapsed);
  };

  const toggleRightSidebar = () => {
    setRightSidebarCollapsed(!rightSidebarCollapsed);
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
      />
      
      <RightSidebar 
        selectedTerritory={selectedTerritory}
        territories={territories}
        collapsed={rightSidebarCollapsed}
        onToggle={toggleRightSidebar}
      />
    </div>
  );
}

export default App; 