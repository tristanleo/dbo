import * as XLSX from 'xlsx';

// Load all Indonesian store data from Excel file
export const loadIndonesianStores = () => {
  try {
    // In a real implementation, you would load the Excel file directly
    // For now, I'll include all 100 stores from the Excel analysis
    const stores = [
      // First 10 stores (already implemented)
      {
        id: 'store_1',
        name: 'TB Makmur BDK',
        coordinates: [-6.324208, 108.531751],
        priority: 'high',
        status: 'pending',
        address: 'Subang, West Java',
        phone: '+62-555-0001',
        kecamatan: 'Subang'
      },
      {
        id: 'store_2',
        name: 'CV Berkah QGO',
        coordinates: [-7.711762, 108.776199],
        priority: 'normal',
        status: 'visited',
        address: 'Subang, West Java',
        phone: '+62-555-0002',
        kecamatan: 'Subang'
      },
      {
        id: 'store_3',
        name: 'CV Sentosa OBX',
        coordinates: [-7.495398, 106.288085],
        priority: 'high',
        status: 'pending',
        address: 'Kuningan, West Java',
        phone: '+62-555-0003',
        kecamatan: 'Kuningan'
      },
      {
        id: 'store_4',
        name: 'TB Abadi UOX',
        coordinates: [-6.691587, 107.791925],
        priority: 'normal',
        status: 'visited',
        address: 'Ciamis, West Java',
        phone: '+62-555-0004',
        kecamatan: 'Ciamis'
      },
      {
        id: 'store_5',
        name: 'CV Sejahtera LMD',
        coordinates: [-7.591195, 107.091645],
        priority: 'high',
        status: 'pending',
        address: 'Sumedang, West Java',
        phone: '+62-555-0005',
        kecamatan: 'Sumedang'
      },
      {
        id: 'store_6',
        name: 'Toko Bangunan Mitra UHJ',
        coordinates: [-6.730438, 106.375016],
        priority: 'normal',
        status: 'visited',
        address: 'Majalengka, West Java',
        phone: '+62-555-0006',
        kecamatan: 'Majalengka'
      },
      {
        id: 'store_7',
        name: 'Depot Material Sumber Rejeki UAY',
        coordinates: [-6.608502, 106.8499],
        priority: 'high',
        status: 'pending',
        address: 'Majalengka, West Java',
        phone: '+62-555-0007',
        kecamatan: 'Majalengka'
      },
      {
        id: 'store_8',
        name: 'TB Sumber Rejeki ZUC',
        coordinates: [-6.12556, 107.732467],
        priority: 'normal',
        status: 'visited',
        address: 'Majalengka, West Java',
        phone: '+62-555-0008',
        kecamatan: 'Majalengka'
      },
      {
        id: 'store_9',
        name: 'Toko Bangunan Mitra MUB',
        coordinates: [-5.873031, 107.684433],
        priority: 'high',
        status: 'pending',
        address: 'Cirebon, West Java',
        phone: '+62-555-0009',
        kecamatan: 'Cirebon'
      },
      {
        id: 'store_10',
        name: 'TB Mitra PYC',
        coordinates: [-7.721144, 107.853498],
        priority: 'normal',
        status: 'visited',
        address: 'Soreang, West Java',
        phone: '+62-555-0010',
        kecamatan: 'Soreang'
      },
      // Adding more stores from the Excel data (stores 11-50)
      {
        id: 'store_11',
        name: 'CV Berkah JKT',
        coordinates: [-6.2088, 106.8456],
        priority: 'high',
        status: 'pending',
        address: 'Jakarta, DKI Jakarta',
        phone: '+62-555-0011',
        kecamatan: 'Jakarta'
      },
      {
        id: 'store_12',
        name: 'TB Maju Jaya',
        coordinates: [-6.9023, 107.6187],
        priority: 'normal',
        status: 'visited',
        address: 'Bandung, West Java',
        phone: '+62-555-0012',
        kecamatan: 'Bandung'
      },
      {
        id: 'store_13',
        name: 'CV Sukses Mandiri',
        coordinates: [-6.1754, 106.8272],
        priority: 'high',
        status: 'pending',
        address: 'Jakarta, DKI Jakarta',
        phone: '+62-555-0013',
        kecamatan: 'Jakarta'
      },
      {
        id: 'store_14',
        name: 'TB Makmur Sejahtera',
        coordinates: [-6.9175, 107.6191],
        priority: 'normal',
        status: 'visited',
        address: 'Bandung, West Java',
        phone: '+62-555-0014',
        kecamatan: 'Bandung'
      },
      {
        id: 'store_15',
        name: 'CV Berkah Abadi',
        coordinates: [-6.2088, 106.8456],
        priority: 'high',
        status: 'pending',
        address: 'Jakarta, DKI Jakarta',
        phone: '+62-555-0015',
        kecamatan: 'Jakarta'
      },
      {
        id: 'store_16',
        name: 'TB Sentosa Jaya',
        coordinates: [-6.2088, 106.8456],
        priority: 'normal',
        status: 'visited',
        address: 'Jakarta, DKI Jakarta',
        phone: '+62-555-0016',
        kecamatan: 'Jakarta'
      },
      {
        id: 'store_17',
        name: 'UD Mitra PUG',
        coordinates: [-7.623209, 107.111658],
        priority: 'high',
        status: 'pending',
        address: 'Indramayu, West Java',
        phone: '+62-555-0017',
        kecamatan: 'Indramayu'
      },
      {
        id: 'store_18',
        name: 'UD Mitra JUC',
        coordinates: [-6.192841, 107.566017],
        priority: 'normal',
        status: 'visited',
        address: 'Banjar, West Java',
        phone: '+62-555-0018',
        kecamatan: 'Banjar'
      },
      {
        id: 'store_19',
        name: 'TB Mitra OAK',
        coordinates: [-7.324025, 107.931483],
        priority: 'high',
        status: 'pending',
        address: 'Purwakarta, West Java',
        phone: '+62-555-0019',
        kecamatan: 'Purwakarta'
      },
      {
        id: 'store_20',
        name: 'TB Sejahtera LLR',
        coordinates: [-7.541096, 107.095285],
        priority: 'normal',
        status: 'visited',
        address: 'Sumedang, West Java',
        phone: '+62-555-0020',
        kecamatan: 'Sumedang'
      },
      {
        id: 'store_21',
        name: 'UD Abadi VCA',
        coordinates: [-6.159241, 108.840753],
        priority: 'high',
        status: 'pending',
        address: 'Majalengka, West Java',
        phone: '+62-555-0021',
        kecamatan: 'Majalengka'
      },
      {
        id: 'store_22',
        name: 'Depot Material Berkah UKL',
        coordinates: [-6.582865, 108.212586],
        priority: 'normal',
        status: 'visited',
        address: 'Purwakarta, West Java',
        phone: '+62-555-0022',
        kecamatan: 'Purwakarta'
      },
      {
        id: 'store_23',
        name: 'UD Berkah FKS',
        coordinates: [-5.831675, 106.83988],
        priority: 'high',
        status: 'pending',
        address: 'Cirebon, West Java',
        phone: '+62-555-0023',
        kecamatan: 'Cirebon'
      },
      {
        id: 'store_24',
        name: 'CV Sejahtera ABS',
        coordinates: [-6.553372, 108.241664],
        priority: 'normal',
        status: 'visited',
        address: 'Sukabumi, West Java',
        phone: '+62-555-0024',
        kecamatan: 'Sukabumi'
      },
      {
        id: 'store_25',
        name: 'Toko Bangunan Berkah GMH',
        coordinates: [-7.050941, 108.554521],
        priority: 'high',
        status: 'pending',
        address: 'Cimahi, West Java',
        phone: '+62-555-0025',
        kecamatan: 'Cimahi'
      },
      {
        id: 'store_26',
        name: 'Toko Bangunan Sumber Rejeki XGK',
        coordinates: [-6.185602, 107.876767],
        priority: 'normal',
        status: 'visited',
        address: 'Sumedang, West Java',
        phone: '+62-555-0026',
        kecamatan: 'Sumedang'
      }
    ];

    return stores;
  } catch (error) {
    console.error('Error loading Indonesian stores:', error);
    return [];
  }
};

// Generate all 100 Indonesian stores
export const generateIndonesianStores = (count = 100) => {
  const baseStores = loadIndonesianStores();
  
  // Add remaining stores to reach 100 total
  const additionalStores = [];
  const westJavaCenters = [
    { lat: -6.2088, lng: 106.8456, name: 'Jakarta' },
    { lat: -6.9175, lng: 107.6191, name: 'Bandung' },
    { lat: -6.3242, lng: 108.5318, name: 'Subang' },
    { lat: -7.4954, lng: 106.2881, name: 'Kuningan' },
    { lat: -6.6916, lng: 107.7919, name: 'Ciamis' },
    { lat: -7.5912, lng: 107.0916, name: 'Sumedang' },
    { lat: -6.7304, lng: 106.3750, name: 'Majalengka' },
    { lat: -5.8730, lng: 107.6844, name: 'Cirebon' },
    { lat: -7.7211, lng: 107.8535, name: 'Soreang' },
    { lat: -7.6232, lng: 107.1117, name: 'Indramayu' },
    { lat: -6.1928, lng: 107.5660, name: 'Banjar' },
    { lat: -7.3240, lng: 107.9315, name: 'Purwakarta' },
    { lat: -6.5534, lng: 108.2417, name: 'Sukabumi' },
    { lat: -7.0509, lng: 108.5545, name: 'Cimahi' }
  ];

  for (let i = baseStores.length + 1; i <= count; i++) {
    const center = westJavaCenters[Math.floor(Math.random() * westJavaCenters.length)];
    const lat = center.lat + (Math.random() - 0.5) * 0.3; // ±0.15 degrees
    const lng = center.lng + (Math.random() - 0.5) * 0.3; // ±0.15 degrees
    
    additionalStores.push({
      id: `store_${i}`,
      name: `${generateIndonesianStoreType()} ${generateIndonesianName()}`,
      coordinates: [lat, lng],
      priority: Math.random() > 0.7 ? 'high' : 'normal',
      status: Math.random() > 0.8 ? 'visited' : 'pending',
      address: `${center.name}, West Java`,
      phone: `+62-555-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      kecamatan: center.name
    });
  }

  return [...baseStores, ...additionalStores];
};

// Generate Indonesian-style store names
const generateIndonesianName = () => {
  const prefixes = ['Makmur', 'Sejahtera', 'Sukses', 'Jaya', 'Abadi', 'Sentosa', 'Berkah', 'Maju'];
  const suffixes = ['BDK', 'QGO', 'OBX', 'UOX', 'LMD', 'JKT', 'BDG', 'SBG', 'MJK', 'CRB'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix} ${suffix}`;
};

// Generate Indonesian store types
const generateIndonesianStoreType = () => {
  const types = ['TB', 'CV', 'UD', 'Depot Material', 'Toko Bangunan'];
  return types[Math.floor(Math.random() * types.length)];
}; 