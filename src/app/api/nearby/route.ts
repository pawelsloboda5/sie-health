import { NextRequest, NextResponse } from 'next/server';
import { searchNearbyProviders, SearchFilters } from '@/lib/cosmos-db';

// /api/nearby route handler with enhanced filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const km = searchParams.get('km') || '50'; // Default to 50km for better coverage

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

    // Build filters from query params
    const filters: SearchFilters = {
      category: searchParams.get('category') || undefined,
      insuranceType: searchParams.get('insuranceType') as any || undefined,
      freeServicesOnly: searchParams.get('freeServicesOnly') === 'true',
      acceptsUninsured: searchParams.get('acceptsUninsured') === 'true',
      noDocumentsRequired: searchParams.get('noDocumentsRequired') === 'true',
      telehealth: searchParams.get('telehealth') === 'true',
      walkInsAccepted: searchParams.get('walkInsAccepted') === 'true',
      slidingScale: searchParams.get('slidingScale') === 'true',
      searchText: searchParams.get('searchText') || undefined,
    };

    // Use the enhanced search function
    const results = await searchNearbyProviders(
      latitude,
      longitude,
      radius,
      filters
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