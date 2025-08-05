// Import Indonesian store data
import { generateIndonesianStores } from './indonesianData.js';

// Generate Indonesian shop locations around West Java area
const generateShops = (count = 30) => {
  return generateIndonesianStores(count);
};

// Generate territories using simple clustering
const generateTerritories = (shops, salesmenCount) => {
  const territories = [];
  const shopsPerTerritory = Math.ceil(shops.length / salesmenCount);
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  
  const salesmenNames = [
    'Budi Santoso', 'Siti Rahmawati', 'Ahmad Hidayat', 
    'Dewi Sartika', 'Rudi Hermawan', 'Nina Kartika'
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
  const shopsData = generateShops(100);
  const territoriesData = generateTerritories(shopsData, salesmenCount);
  
  return {
    shopsData,
    territoriesData
  };
};

// Improved clustering algorithm for non-overlapping territories
export const generateOptimizedClusters = (shops, salesmenCount) => {
  if (shops.length === 0 || salesmenCount <= 0) {
    return { territoriesData: [] };
  }

  // Initialize centroids strategically based on geographic distribution
  const centroids = initializeStrategicCentroids(shops, salesmenCount);

  // K-means clustering with improved convergence
  let iterations = 0;
  const maxIterations = 150;
  let hasChanged = true;
  let finalClusters = [];

  while (hasChanged && iterations < maxIterations) {
    hasChanged = false;
    iterations++;

    // Assign shops to nearest centroid with distance penalty for overlap
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
        
        // Add penalty for clusters that are too large
        const clusterSize = clusters[index].length;
        const sizePenalty = clusterSize > Math.ceil(shops.length / salesmenCount) * 1.5 ? 50 : 0;
        
        const totalCost = distance + sizePenalty;
        if (totalCost < minDistance) {
          minDistance = totalCost;
          nearestCentroid = index;
        }
      });
      
      clusters[nearestCentroid].push(shop);
    });

    // Update centroids with better convergence
    const newCentroids = centroids.map((centroid, index) => {
      if (clusters[index].length === 0) return centroid;
      
      const avgLat = clusters[index].reduce((sum, shop) => sum + shop.coordinates[0], 0) / clusters[index].length;
      const avgLng = clusters[index].reduce((sum, shop) => sum + shop.coordinates[1], 0) / clusters[index].length;
      
      const newCentroid = [avgLat, avgLng];
      const hasMoved = Math.abs(newCentroid[0] - centroid[0]) > 0.0005 || Math.abs(newCentroid[1] - centroid[1]) > 0.0005;
      
      if (hasMoved) hasChanged = true;
      return newCentroid;
    });

    if (hasChanged) {
      centroids.splice(0, centroids.length, ...newCentroids);
    }
    
    // Store the final clusters
    finalClusters = clusters;
  }

  // Post-process clusters to ensure better separation
  finalClusters = postProcessClusters(finalClusters, shops, salesmenCount);

  // Create territories from clusters
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  const salesmenNames = [
    'Budi Santoso', 'Siti Rahmawati', 'Ahmad Hidayat', 
    'Dewi Sartika', 'Rudi Hermawan', 'Nina Kartika'
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

// Initialize centroids strategically based on geographic distribution with randomization
const initializeStrategicCentroids = (shops, salesmenCount) => {
  // Find the geographic bounds of all shops
  const lats = shops.map(shop => shop.coordinates[0]);
  const lngs = shops.map(shop => shop.coordinates[1]);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  const centroids = [];
  
  // Add randomization factor to create different clusters each time
  const randomFactor = Math.random() * 0.3 - 0.15; // ±0.15 variation
  
  if (salesmenCount === 1) {
    // Single salesman - use center of all shops
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    centroids.push([centerLat, centerLng]);
  } else if (salesmenCount === 2) {
    // Two salesmen - split east-west with randomization
    const centerLat = (minLat + maxLat) / 2;
    const splitPoint = 0.5 + randomFactor;
    centroids.push([centerLat, minLng + (maxLng - minLng) * (0.25 + randomFactor)]); // West
    centroids.push([centerLat, minLng + (maxLng - minLng) * (0.75 + randomFactor)]); // East
  } else if (salesmenCount === 3) {
    // Three salesmen - triangular distribution with randomization
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    // Create different triangular patterns based on random factor
    const pattern = Math.floor(Math.random() * 4);
    
    if (pattern === 0) {
      // Northwest, Southeast, Center
      centroids.push([minLat + (maxLat - minLat) * (0.25 + randomFactor), minLng + (maxLng - minLng) * (0.25 + randomFactor)]);
      centroids.push([minLat + (maxLat - minLat) * (0.75 + randomFactor), minLng + (maxLng - minLng) * (0.75 + randomFactor)]);
      centroids.push([centerLat, centerLng]);
    } else if (pattern === 1) {
      // Northeast, Southwest, Center
      centroids.push([minLat + (maxLat - minLat) * (0.75 + randomFactor), minLng + (maxLng - minLng) * (0.25 + randomFactor)]);
      centroids.push([minLat + (maxLat - minLat) * (0.25 + randomFactor), minLng + (maxLng - minLng) * (0.75 + randomFactor)]);
      centroids.push([centerLat, centerLng]);
    } else if (pattern === 2) {
      // North, South, Center
      centroids.push([minLat + (maxLat - minLat) * (0.25 + randomFactor), centerLng]);
      centroids.push([minLat + (maxLat - minLat) * (0.75 + randomFactor), centerLng]);
      centroids.push([centerLat, centerLng]);
    } else {
      // East, West, Center
      centroids.push([centerLat, minLng + (maxLng - minLng) * (0.25 + randomFactor)]);
      centroids.push([centerLat, minLng + (maxLng - minLng) * (0.75 + randomFactor)]);
      centroids.push([centerLat, centerLng]);
    }
  } else {
    // Four or more salesmen - grid-like distribution with randomization
    const rows = Math.ceil(Math.sqrt(salesmenCount));
    const cols = Math.ceil(salesmenCount / rows);
    
    for (let i = 0; i < salesmenCount; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      const lat = minLat + (maxLat - minLat) * (row + 0.5 + randomFactor) / rows;
      const lng = minLng + (maxLng - minLng) * (col + 0.5 + randomFactor) / cols;
      
      centroids.push([lat, lng]);
    }
  }
  
  return centroids;
};

// Post-process clusters to ensure better separation
const postProcessClusters = (clusters, shops, salesmenCount) => {
  const targetSize = Math.ceil(shops.length / salesmenCount);
  const processedClusters = [...clusters];
  
  // Balance cluster sizes
  for (let i = 0; i < processedClusters.length; i++) {
    if (processedClusters[i].length === 0) {
      // Find the largest cluster and take one shop
      let largestClusterIndex = 0;
      let maxSize = 0;
      
      for (let j = 0; j < processedClusters.length; j++) {
        if (processedClusters[j].length > maxSize) {
          maxSize = processedClusters[j].length;
          largestClusterIndex = j;
        }
      }
      
      if (maxSize > 1) {
        const shopToMove = processedClusters[largestClusterIndex].pop();
        processedClusters[i].push(shopToMove);
      }
    }
  }
  
  // Ensure no cluster is too large
  for (let i = 0; i < processedClusters.length; i++) {
    if (processedClusters[i].length > targetSize * 1.5) {
      const excess = processedClusters[i].length - targetSize;
      
      // Find smallest cluster
      let smallestClusterIndex = 0;
      let minSize = Infinity;
      
      for (let j = 0; j < processedClusters.length; j++) {
        if (j !== i && processedClusters[j].length < minSize) {
          minSize = processedClusters[j].length;
          smallestClusterIndex = j;
        }
      }
      
      // Move excess shops to smallest cluster
      for (let k = 0; k < excess && k < processedClusters[i].length; k++) {
        const shopToMove = processedClusters[i].pop();
        processedClusters[smallestClusterIndex].push(shopToMove);
      }
    }
  }
  
  return processedClusters;
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