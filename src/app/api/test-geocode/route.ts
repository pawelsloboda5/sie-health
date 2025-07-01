import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

// Test endpoint to verify Azure Maps geocoding
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address') || '1101 Wootton Pkwy suite 540, Rockville, MD 20852';
  
  try {
    // Azure Maps search endpoint
    const SEARCH_URL = 'https://atlas.microsoft.com/search/address/json';
    
    // Clean the address
    const cleanedAddress = address.split('\n')[0].split('⋅')[0].trim();
    
    // Build the search URL with parameters
    const params = new URLSearchParams({
      'api-version': '1.0',
      'subscription-key': env.azureMaps.serverKey,
      'query': cleanedAddress
    });
    
    const response = await fetch(`${SEARCH_URL}?${params.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { 
          error: `Azure Maps API error: ${response.status}`,
          details: errorText,
          query: cleanedAddress
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    const results = data.results;
    
    if (results && results.length > 0) {
      const firstResult = results[0];
      return NextResponse.json({
        success: true,
        query: cleanedAddress,
        result: {
          lat: firstResult.position.lat,
          lng: firstResult.position.lon,
          address: firstResult.address?.freeformAddress || cleanedAddress,
          confidence: firstResult.confidence,
          type: firstResult.type
        },
        totalResults: results.length
      });
    } else {
      return NextResponse.json({
        success: false,
        query: cleanedAddress,
        error: 'No results found',
        totalResults: 0
      });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        query: address
      },
      { status: 500 }
    );
  }
} 