// Simple script to test API endpoints
// Run with: node scripts/test-api.js

const baseUrl = 'http://localhost:3000';

async function testNearbyAPI() {
  console.log('Testing /api/nearby endpoint...');
  console.log('(This now uses real Cosmos DB data)\n');
  
  try {
    // Test with Baltimore coordinates
    const response = await fetch(`${baseUrl}/api/nearby?lat=39.2904&lng=-76.6122&km=100`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      console.log('Results count:', Array.isArray(data) ? data.length : 0);
      if (Array.isArray(data) && data.length > 0) {
        console.log('\nFirst result:', {
          name: data[0].Name,
          address: data[0].Address,
          distance: data[0].distance,
          services: data[0].free_services ? data[0].free_services.length : 0
        });
      } else {
        console.log('No providers found within 100km of Baltimore, MD');
      }
    } else {
      console.log('Error response:', data);
    }
  } catch (error) {
    console.error('Error testing nearby API:', error.message);
  }
}

async function testCategoriesAPI() {
  console.log('\n\nTesting /api/categories endpoint...');
  console.log('(This now uses real collection names from Cosmos DB)\n');
  
  try {
    const response = await fetch(`${baseUrl}/api/categories`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      console.log('Categories count:', Array.isArray(data) ? data.length : 0);
      if (Array.isArray(data) && data.length > 0) {
        console.log('First 5 categories:', data.slice(0, 5));
      }
    } else {
      console.log('Error response:', data);
    }
  } catch (error) {
    console.error('Error testing categories API:', error.message);
  }
}

async function testGeocodeAPI() {
  console.log('\n\nTesting /api/test-geocode endpoint...');
  console.log('(This uses Azure Maps to geocode addresses)\n');
  
  try {
    // Test with a known address
    const testAddress = '1101 Wootton Pkwy suite 540, Rockville, MD 20852';
    const response = await fetch(`${baseUrl}/api/test-geocode?address=${encodeURIComponent(testAddress)}`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    if (data.success) {
      console.log('Geocoded result:', {
        query: data.query,
        lat: data.result.lat,
        lng: data.result.lng,
        address: data.result.address
      });
    } else {
      console.log('Error:', data.error);
    }
  } catch (error) {
    console.error('Error testing geocode API:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('Starting API tests with REAL DATABASE...\n');
  console.log('Make sure your .env.local has:');
  console.log('- COSMOS_DB_CONNECTION_STRING');
  console.log('- COSMOS_DB_DATABASE_NAME');
  console.log('- AZURE_MAPS_KEY\n');
  
  await testNearbyAPI();
  await testCategoriesAPI();
  await testGeocodeAPI();
  
  console.log('\n\nTests complete!');
  console.log('\nTo test the full flow:');
  console.log('1. Start the dev server: npm run dev');
  console.log('2. Open http://localhost:3000');
  console.log('3. Enter an address like: 1101 Wootton Pkwy, Rockville, MD');
  console.log('4. Click Search to see real results from your database');
}

runTests(); 