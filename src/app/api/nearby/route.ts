import { NextRequest, NextResponse } from 'next/server';
import { searchNearbyProviders } from '@/lib/cosmos-db';

// T-01: /api/nearby route handler with real Cosmos DB
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const km = searchParams.get('km') || '10';
    const service = searchParams.get('service');

    // Validate required parameters
    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat and lng' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radius = parseFloat(km);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radius)) {
      return NextResponse.json(
        { error: 'Invalid numeric parameters' },
        { status: 400 }
      );
    }

    // Use the actual Cosmos DB search function
    const results = await searchNearbyProviders(
      latitude,
      longitude,
      radius,
      service || undefined
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in /api/nearby:', error);
    
    // Check for specific MongoDB errors
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: 'Database connection failed. Please check your connection string.' },
          { status: 503 }
        );
      }
      if (error.message.includes('authentication failed')) {
        return NextResponse.json(
          { error: 'Database authentication failed. Please check your credentials.' },
          { status: 401 }
        );
      }
      if (error.message.includes('ENOTFOUND')) {
        return NextResponse.json(
          { error: 'Database host not found. Please check your connection string.' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 