// Generate sample shop locations around New York area
const generateShops = (count = 30) => {
  const shops = [];
  const centerLat = 40.7128;
  const centerLng = -74.0060;
  const radius = 0.1; // Roughly 10km radius

  for (let i = 1; i <= count; i++) {
    const angle = (i / count) * 2 * Math.PI;
    const distance = Math.random() * radius;
    
    const lat = centerLat + distance * Math.cos(angle);
    const lng = centerLng + distance * Math.sin(angle);
    
    shops.push({
      id: `shop_${i}`,
      name: `Hardware Store ${i}`,
      coordinates: [lat, lng],
      priority: Math.random() > 0.7 ? 'high' : 'normal',
      status: Math.random() > 0.8 ? 'visited' : 'pending',
      address: `${Math.floor(Math.random() * 9999)} Main St, NY`,
      phone: `+1-555-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`
    });
  }
  
  return shops;
};

// Generate territories using simple clustering
const generateTerritories = (shops, salesmenCount) => {
  const territories = [];
  const shopsPerTerritory = Math.ceil(shops.length / salesmenCount);
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  
  const salesmenNames = [
    'John Doe', 'Jane Smith', 'Mike Johnson', 
    'Sarah Wilson', 'David Brown', 'Lisa Davis'
  ];

  for (let i = 0; i < salesmenCount; i++) {
    const startIndex = i * shopsPerTerritory;
    const endIndex = Math.min((i + 1) * shopsPerTerritory, shops.length);
    const territoryShops = shops.slice(startIndex, endIndex);
    
    // Calculate territory center
    const centerLat = territoryShops.reduce((sum, shop) => sum + shop.coordinates[0], 0) / territoryShops.length;
    const centerLng = territoryShops.reduce((sum, shop) => sum + shop.coordinates[1], 0) / territoryShops.length;
    
    // Calculate total distance (simplified)
    const totalDistance = territoryShops.length * 5 + Math.random() * 20; // km
    const estimatedTime = totalDistance / 15; // Assuming 15 km/h average
    
    territories.push({
      id: `territory_${i + 1}`,
      name: salesmenNames[i],
      salesmanId: `salesman_${i + 1}`,
      shops: territoryShops,
      center: [centerLat, centerLng],
      color: colors[i % colors.length],
      totalDistance: Math.round(totalDistance * 10) / 10,
      estimatedTime: Math.round(estimatedTime * 10) / 10,
      shopCount: territoryShops.length
    });
  }
  
  return territories;
};

export const generateSampleData = (salesmenCount) => {
  const shopsData = generateShops(30);
  const territoriesData = generateTerritories(shopsData, salesmenCount);
  
  return {
    shopsData,
    territoriesData
  };
};

// Calculate distance between two points using Haversine formula
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Generate optimization suggestions
export const generateOptimizationSuggestions = (territory) => {
  const suggestions = [];
  
  if (territory.shopCount > 15) {
    suggestions.push({
      type: 'territory_balance',
      message: `Territory has ${territory.shopCount} shops - consider splitting for better efficiency`,
      priority: 'high'
    });
  }
  
  if (territory.totalDistance > 50) {
    suggestions.push({
      type: 'route_optimization',
      message: `Route distance is ${territory.totalDistance}km - reordering stops could save time`,
      priority: 'medium'
    });
  }
  
  const efficiency = Math.min(100, Math.max(60, 100 - (territory.totalDistance / 2)));
  suggestions.push({
    type: 'efficiency',
    message: `Current route efficiency: ${Math.round(efficiency)}%`,
    priority: 'low'
  });
  
  return suggestions;
}; 