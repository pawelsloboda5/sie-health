// Enhanced test script for the API endpoints with new filtering capabilities
// Run with: node scripts/test-api.js

const baseUrl = 'http://localhost:3000';

// Test coordinates (Rockville, MD area)
const TEST_LAT = 39.084;
const TEST_LNG = -77.1528;

async function testNearbyAPI() {
  console.log('=== Testing /api/nearby endpoint (basic search) ===');
  console.log('Using enhanced data structure with comprehensive provider info\n');
  
  try {
    const response = await fetch(`${baseUrl}/api/nearby?lat=${TEST_LAT}&lng=${TEST_LNG}&km=50`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Results count:', Array.isArray(data) ? data.length : 0);
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('\nFirst result details:');
      const first = data[0];
      console.log('- Name:', first.Name);
      console.log('- Category:', first.Category);
      console.log('- Distance:', first.distance, 'km');
      console.log('- Free services count:', first.freeServicesCount || 0);
      console.log('- Insurance accepted:');
      console.log('  - Medicaid:', first.insurance_accepted?.medicaid ? 'Yes' : 'No');
      console.log('  - Medicare:', first.insurance_accepted?.medicare ? 'Yes' : 'No');
      console.log('- Documentation requirements:');
      console.log('  - SSN required:', first.documentation_requirements?.ssn_required ? 'Yes' : 'No');
      console.log('  - ID required:', first.documentation_requirements?.id_required ? 'Yes' : 'No');
      console.log('- Accessibility:');
      console.log('  - Walk-ins:', first.accessibility_info?.walk_ins_accepted ? 'Yes' : 'No');
      console.log('  - Telehealth:', first.telehealth_info?.telehealth_available ? 'Yes' : 'No');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testFilteredSearch() {
  console.log('\n\n=== Testing Advanced Filtering ===');
  
  // Test 1: Free services only
  console.log('\n1. Filter: Free services only');
  try {
    const response = await fetch(`${baseUrl}/api/nearby?lat=${TEST_LAT}&lng=${TEST_LNG}&km=50&freeServicesOnly=true`);
    const data = await response.json();
    console.log('   Results with free services:', data.length || 0);
    if (data.length > 0) {
      console.log('   Sample providers with free services:');
      data.slice(0, 3).forEach(p => {
        console.log(`   - ${p.Name}: ${p.freeServicesCount} free services`);
      });
    }
  } catch (error) {
    console.error('   Error:', error.message);
  }

  // Test 2: Medicaid accepted
  console.log('\n2. Filter: Accepts Medicaid');
  try {
    const response = await fetch(`${baseUrl}/api/nearby?lat=${TEST_LAT}&lng=${TEST_LNG}&km=50&insuranceType=medicaid`);
    const data = await response.json();
    console.log('   Results accepting Medicaid:', data.length || 0);
  } catch (error) {
    console.error('   Error:', error.message);
  }

  // Test 3: No documents required
  console.log('\n3. Filter: No documents required');
  try {
    const response = await fetch(`${baseUrl}/api/nearby?lat=${TEST_LAT}&lng=${TEST_LNG}&km=50&noDocumentsRequired=true`);
    const data = await response.json();
    console.log('   Results with no SSN/ID required:', data.length || 0);
  } catch (error) {
    console.error('   Error:', error.message);
  }

  // Test 4: Multiple filters combined
  console.log('\n4. Filter: Multiple criteria (Medicaid + Telehealth + Walk-ins)');
  try {
    const params = new URLSearchParams({
      lat: TEST_LAT,
      lng: TEST_LNG,
      km: 50,
      insuranceType: 'medicaid',
      telehealth: 'true',
      walkInsAccepted: 'true'
    });
    const response = await fetch(`${baseUrl}/api/nearby?${params}`);
    const data = await response.json();
    console.log('   Results matching all criteria:', data.length || 0);
  } catch (error) {
    console.error('   Error:', error.message);
  }

  // Test 5: Text search
  console.log('\n5. Filter: Text search for "dental"');
  try {
    const response = await fetch(`${baseUrl}/api/nearby?lat=${TEST_LAT}&lng=${TEST_LNG}&km=50&searchText=dental`);
    const data = await response.json();
    console.log('   Results matching "dental":', data.length || 0);
    if (data.length > 0) {
      console.log('   Sample matches:');
      data.slice(0, 3).forEach(p => {
        console.log(`   - ${p.Name} (${p.Category})`);
      });
    }
  } catch (error) {
    console.error('   Error:', error.message);
  }
}

async function testCategoriesAPI() {
  console.log('\n\n=== Testing /api/categories endpoint ===');
  console.log('Now returns unique categories from businesses collection\n');
  
  try {
    const response = await fetch(`${baseUrl}/api/categories`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Categories count:', Array.isArray(data) ? data.length : 0);
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('\nTop categories with provider counts:');
      data.slice(0, 10).forEach(cat => {
        console.log(`${cat.icon} ${cat.name}: ${cat.count} providers`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testGeocodeAPI() {
  console.log('\n\n=== Testing /api/test-geocode endpoint ===');
  
  try {
    const testAddress = '1101 Wootton Pkwy, Rockville, MD 20852';
    const response = await fetch(`${baseUrl}/api/test-geocode?address=${encodeURIComponent(testAddress)}`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Test address:', testAddress);
    if (data.success) {
      console.log('Geocoded coordinates:', `${data.result.lat}, ${data.result.lng}`);
      console.log('Formatted address:', data.result.address);
    } else {
      console.log('Error:', data.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function showDatabaseStats() {
  console.log('\n\n=== Database Statistics ===');
  try {
    // Get all providers
    const response = await fetch(`${baseUrl}/api/nearby?lat=${TEST_LAT}&lng=${TEST_LNG}&km=1000`);
    const data = await response.json();
    
    if (Array.isArray(data)) {
      const stats = {
        total: data.length,
        withFreeServices: data.filter(p => p.freeServicesCount > 0).length,
        acceptsMedicaid: data.filter(p => p.insurance_accepted?.medicaid).length,
        acceptsMedicare: data.filter(p => p.insurance_accepted?.medicare).length,
        hasTelemedicine: data.filter(p => p.telehealth_info?.telehealth_available).length,
        acceptsWalkIns: data.filter(p => p.accessibility_info?.walk_ins_accepted).length,
        noDocumentsRequired: data.filter(p => 
          !p.documentation_requirements?.ssn_required && 
          !p.documentation_requirements?.id_required
        ).length,
        hasSlidingScale: data.filter(p => p.financial_assistance?.sliding_scale_available).length,
      };
      
      console.log('Total processed providers:', stats.total);
      console.log('Providers with free services:', stats.withFreeServices);
      console.log('Accepts Medicaid:', stats.acceptsMedicaid);
      console.log('Accepts Medicare:', stats.acceptsMedicare);
      console.log('Has telemedicine:', stats.hasTelemedicine);
      console.log('Accepts walk-ins:', stats.acceptsWalkIns);
      console.log('No documents required:', stats.noDocumentsRequired);
      console.log('Has sliding scale fees:', stats.hasSlidingScale);
    }
  } catch (error) {
    console.error('Error getting stats:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('Starting Enhanced API Tests...\n');
  console.log('Required environment variables:');
  console.log('- COSMOS_DB_CONNECTION_STRING');
  console.log('- COSMOS_DB_DATABASE_NAME');
  console.log('- AZURE_MAPS_KEY\n');
  console.log('NOTE: Only showing documents with jina_scraped: true\n');
  
  await testNearbyAPI();
  await testFilteredSearch();
  await testCategoriesAPI();
  await testGeocodeAPI();
  await showDatabaseStats();
  
  console.log('\n\n✅ All tests complete!');
  console.log('\nNext steps:');
  console.log('1. Run the dev server: npm run dev');
  console.log('2. Open http://localhost:3000');
  console.log('3. Try the enhanced filtering options');
  console.log('4. View comprehensive provider details with tabbed information');
}

runTests(); 