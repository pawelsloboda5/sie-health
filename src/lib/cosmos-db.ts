// Cosmos DB connection helper for searching across all collections
// This file shows the implementation pattern for when you're ready to connect

import { MongoClient, Db } from 'mongodb';
import { env } from './env';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase() {
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

export async function searchNearbyProviders(
  latitude: number,
  longitude: number,
  radiusKm: number,
  serviceFilter?: string
) {
  const { db } = await connectToDatabase();
  
  // Get all collection names
  const collections = await db.listCollections().toArray();
  
  // Filter to only health-related collections (exclude system collections)
  // Note: Collection names use mixed naming conventions (snake_case and kebab-case)
  // Examples: dental_clinics, community-health-centers, chronic-disease-screenings
  const healthCollections = collections
    .map(c => c.name)
    .filter(name => !name.startsWith('system.'));
  
  // Query all collections in parallel
  const queries = healthCollections.map(async (collectionName) => {
    const collection = db.collection(collectionName);
    
    // MongoDB geospatial query with free_services filter
    const query: any = {
      // Must have free_services array with at least one element
      free_services: { $exists: true, $ne: [] },
      
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
    
    // Optional service filter
    if (serviceFilter) {
      query['free_services.service'] = {
        $regex: serviceFilter,
        $options: 'i' // Case insensitive
      };
    }
    
    // Execute query with limit
    const results = await collection
      .find(query)
      .limit(20) // Limit per collection
      .toArray();
    
    return results;
  });
  
  // Wait for all queries to complete
  const allResults = await Promise.all(queries);
  
  // Flatten results from all collections
  const flatResults = allResults.flat();
  
  // Calculate distances and sort
  const resultsWithDistance = flatResults.map(doc => {
    const distance = calculateDistance(
      latitude,
      longitude,
      doc.location.coordinates[1],
      doc.location.coordinates[0]
    );
    
    return {
      ...doc,
      distance: Math.round(distance * 10) / 10,
      collection: doc.search_keyword || doc.Category // Include source collection info
    };
  });
  
  // Sort by distance and limit to 20 total
  return resultsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 20);
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