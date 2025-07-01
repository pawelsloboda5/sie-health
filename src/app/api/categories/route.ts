import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { env } from '@/lib/env';
import { getCategoriesFromDatabase } from '@/lib/collection-utils';

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

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

// T-06: /api/categories endpoint with real Cosmos DB
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Get categories from actual collection names
    const categories = await getCategoriesFromDatabase(db);

    // Set cache headers for 1 hour as per spec
    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error in /api/categories:', error);
    
    // Check for specific MongoDB errors
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: 'Database connection failed' },
          { status: 503 }
        );
      }
      if (error.message.includes('authentication failed')) {
        return NextResponse.json(
          { error: 'Database authentication failed' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 