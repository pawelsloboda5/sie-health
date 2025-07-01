// Cosmos DB connection helper for searching across all collections
// This file shows the implementation pattern for when you're ready to connect

import { MongoClient, Db } from 'mongodb';
import { env } from './env';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(env.cosmosDb.connectionString);
  await client.connect();
  
  const db = client.db(env.cosmosDb.databaseName);
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

export interface SearchFilters {
  serviceType?: string;
  category?: string;
  insuranceType?: 'medicaid' | 'medicare' | 'self-pay' | 'any';
  freeServicesOnly?: boolean;
  acceptsUninsured?: boolean;
  noDocumentsRequired?: boolean;
  telehealth?: boolean;
  walkInsAccepted?: boolean;
  slidingScale?: boolean;
  searchText?: string;
}

export async function searchNearbyProviders(
  latitude: number,
  longitude: number,
  radiusKm: number,
  filters: SearchFilters = {}
) {
  const { db } = await connectToDatabase();
  
  // Now we only have one collection: "businesses"
  const collection = db.collection('businesses');
  
  // Build the query - MUST have jina_scraped: true
  const query: any = {
    jina_scraped: true, // Only show processed documents
    
    // Geospatial query using 2dsphere index
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusKm * 1000 // Convert km to meters
      }
    }
  };
  
  // Apply filters
  if (filters.category) {
    query.Category = { $regex: filters.category, $options: 'i' };
  }
  
  if (filters.freeServicesOnly) {
    query.$or = [
      { 'services_offered.general_services.is_free': true },
      { 'services_offered.specialized_services.is_free': true },
      { 'services_offered.general_services.is_discounted': true },
      { 'services_offered.specialized_services.is_discounted': true }
    ];
  }
  
  if (filters.insuranceType) {
    switch (filters.insuranceType) {
      case 'medicaid':
        query['insurance_accepted.medicaid'] = true;
        break;
      case 'medicare':
        query['insurance_accepted.medicare'] = true;
        break;
      case 'self-pay':
        query['insurance_accepted.self_pay_options'] = true;
        break;
    }
  }
  
  if (filters.acceptsUninsured) {
    query['financial_assistance.accepts_uninsured'] = true;
  }
  
  if (filters.noDocumentsRequired) {
    query['documentation_requirements.ssn_required'] = false;
    query['documentation_requirements.id_required'] = false;
  }
  
  if (filters.telehealth) {
    query['telehealth_info.telehealth_available'] = true;
  }
  
  if (filters.walkInsAccepted) {
    query['accessibility_info.walk_ins_accepted'] = true;
  }
  
  if (filters.slidingScale) {
    query['financial_assistance.sliding_scale_available'] = true;
  }
  
  if (filters.searchText) {
    query.$text = { $search: filters.searchText };
  }
  
  // Execute query
  const results = await collection
    .find(query)
    .limit(50) // Increase limit since we're only querying one collection
    .toArray();
  
  // Calculate distances and extract relevant free services
  const resultsWithDistance = results.map(doc => {
    const distance = calculateDistance(
      latitude,
      longitude,
      doc.location.coordinates[1],
      doc.location.coordinates[0]
    );
    
    // Extract all free/discounted services
    interface ExtractedService {
      name: string;
      category: string;
      description: string;
      price_info: string;
      is_free: boolean;
      is_discounted: boolean;
      type: string;
    }
    
    const freeServices: ExtractedService[] = [];
    
    if (doc.services_offered) {
      const serviceTypes = ['general_services', 'specialized_services', 'diagnostic_services'] as const;
      serviceTypes.forEach(serviceType => {
        if (doc.services_offered[serviceType]) {
          doc.services_offered[serviceType].forEach((service: any) => {
            if (service.is_free || service.is_discounted) {
              freeServices.push({
                ...service,
                type: serviceType
              });
            }
          });
        }
      });
    }
    
    return {
      ...doc,
      distance: Math.round(distance * 10) / 10,
      freeServicesCount: freeServices.length,
      extractedFreeServices: freeServices
    };
  });
  
  // Sort by distance
  return resultsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 30); // Return top 30 results
}

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Index creation helper (run once during setup)
export async function ensureIndexes() {
  const { db } = await connectToDatabase();
  const collections = await db.listCollections().toArray();
  
  for (const collection of collections) {
    if (!collection.name.startsWith('system.')) {
      const col = db.collection(collection.name);
      
      // Create 2dsphere index for geospatial queries
      await col.createIndex({ location: '2dsphere' });
      
      // Create index on free_services for filtering
      await col.createIndex({ 'free_services.service': 1 });
      
      console.log(`Indexes created for collection: ${collection.name}`);
    }
  }
} 