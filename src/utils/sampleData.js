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

// Optimized clustering algorithm using K-means
export const generateOptimizedClusters = (shops, salesmenCount) => {
  if (shops.length === 0 || salesmenCount <= 0) {
    return { territoriesData: [] };
  }

  // Initialize centroids randomly
  const centroids = [];
  for (let i = 0; i < salesmenCount; i++) {
    const randomShop = shops[Math.floor(Math.random() * shops.length)];
    centroids.push([randomShop.coordinates[0], randomShop.coordinates[1]]);
  }

  // K-means clustering
  let iterations = 0;
  const maxIterations = 100;
  let hasChanged = true;
  let finalClusters = [];

  while (hasChanged && iterations < maxIterations) {
    hasChanged = false;
    iterations++;

    // Assign shops to nearest centroid
    const clusters = Array.from({ length: salesmenCount }, () => []);
    
    shops.forEach(shop => {
      let minDistance = Infinity;
      let nearestCentroid = 0;
      
      centroids.forEach((centroid, index) => {
        const distance = calculateDistance(
          shop.coordinates[0], 
          shop.coordinates[1], 
          centroid[0], 
          centroid[1]
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestCentroid = index;
        }
      });
      
      clusters[nearestCentroid].push(shop);
    });

    // Update centroids
    const newCentroids = centroids.map((centroid, index) => {
      if (clusters[index].length === 0) return centroid;
      
      const avgLat = clusters[index].reduce((sum, shop) => sum + shop.coordinates[0], 0) / clusters[index].length;
      const avgLng = clusters[index].reduce((sum, shop) => sum + shop.coordinates[1], 0) / clusters[index].length;
      
      const newCentroid = [avgLat, avgLng];
      const hasMoved = Math.abs(newCentroid[0] - centroid[0]) > 0.001 || Math.abs(newCentroid[1] - centroid[1]) > 0.001;
      
      if (hasMoved) hasChanged = true;
      return newCentroid;
    });

    if (hasChanged) {
      centroids.splice(0, centroids.length, ...newCentroids);
    }
    
    // Store the final clusters
    finalClusters = clusters;
  }

  // Create territories from clusters
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  const salesmenNames = [
    'John Doe', 'Jane Smith', 'Mike Johnson', 
    'Sarah Wilson', 'David Brown', 'Lisa Davis'
  ];

  const territoriesData = finalClusters.map((cluster, index) => {
    if (cluster.length === 0) return null;

    const centerLat = cluster.reduce((sum, shop) => sum + shop.coordinates[0], 0) / cluster.length;
    const centerLng = cluster.reduce((sum, shop) => sum + shop.coordinates[1], 0) / cluster.length;
    
    // Calculate total distance (simplified)
    const totalDistance = cluster.length * 5 + Math.random() * 20; // km
    const estimatedTime = totalDistance / 15; // Assuming 15 km/h average
    
    return {
      id: `territory_${index + 1}`,
      name: salesmenNames[index],
      salesmanId: `salesman_${index + 1}`,
      shops: cluster,
      center: [centerLat, centerLng],
      color: colors[index % colors.length],
      totalDistance: Math.round(totalDistance * 10) / 10,
      estimatedTime: Math.round(estimatedTime * 10) / 10,
      shopCount: cluster.length
    };
  }).filter(territory => territory !== null);

  return { territoriesData };
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