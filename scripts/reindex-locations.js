// Script to reindex location fields after geocoding
// Run this after adding location coordinates to documents
// Usage: node scripts/reindex-locations.js

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function reindexLocations() {
  const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
  const databaseName = process.env.COSMOS_DB_DATABASE_NAME;

  if (!connectionString || !databaseName) {
    console.error('Missing required environment variables:');
    console.error('- COSMOS_DB_CONNECTION_STRING');
    console.error('- COSMOS_DB_DATABASE_NAME');
    process.exit(1);
  }

  console.log('🗺️  Reindexing location fields after geocoding...\n');
  console.log('Connecting to database...');
  
  const client = new MongoClient(connectionString);

  try {
    await client.connect();
    console.log('Connected successfully!\n');

    const db = client.db(databaseName);

    // Get all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections
      .map(c => c.name)
      .filter(name => !name.startsWith('system.'));

    console.log(`Found ${collectionNames.length} collections to check for location data...\n`);

    let totalProcessed = 0;
    let totalWithLocations = 0;

    // Process each collection
    for (const collectionName of collectionNames) {
      const collection = db.collection(collectionName);

      try {
        // Check if collection has any documents with location data
        const docCountWithLocation = await collection.countDocuments({
          location: { $exists: true, $ne: null }
        });

        if (docCountWithLocation > 0) {
          console.log(`📍 ${collectionName}`);
          
          // Drop existing location index if it exists (to recreate it fresh)
          try {
            await collection.dropIndex('location_2dsphere');
            console.log('  ✓ Dropped existing location index');
          } catch (error) {
            // Index might not exist, that's okay
          }

          // Create fresh 2dsphere index for geospatial queries
          await collection.createIndex({ location: '2dsphere' });
          console.log('  ✓ Created geospatial index on location field');

          // Get more detailed stats
          const totalDocs = await collection.countDocuments({});
          const processedDocs = await collection.countDocuments({
            jina_scraped: true
          });
          const processedWithLocation = await collection.countDocuments({
            jina_scraped: true,
            location: { $exists: true, $ne: null }
          });

          console.log(`  → Total documents: ${totalDocs}`);
          console.log(`  → Processed documents: ${processedDocs}`);
          console.log(`  → Documents with location: ${docCountWithLocation}`);
          console.log(`  → Processed + located: ${processedWithLocation}`);
          console.log('');

          totalProcessed++;
          totalWithLocations += docCountWithLocation;
        } else {
          // Collection has no location data, skip it
          console.log(`⏭️  ${collectionName} - no location data, skipping`);
        }
      } catch (error) {
        console.error(`  ✗ Error processing ${collectionName}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`Collections with location data: ${totalProcessed}`);
    console.log(`Total documents with locations: ${totalWithLocations}`);
    console.log(`Collections without location data: ${collectionNames.length - totalProcessed}`);

    // Test a sample geospatial query to verify indexes work
    console.log('\n🧪 Testing geospatial query...');
    try {
      // Use the "businesses" collection for testing (it should have the most data)
      const businessesCollection = db.collection('businesses');
      const businessesWithLocation = await businessesCollection.countDocuments({
        location: { $exists: true, $ne: null }
      });

      if (businessesWithLocation > 0) {
        // Test query: Find documents within 50km of Rockville, MD
        const testLat = 39.084;
        const testLng = -77.1528;
        const testResults = await businessesCollection.find({
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [testLng, testLat]
              },
              $maxDistance: 50000 // 50km in meters
            }
          }
        }).limit(5).toArray();

        console.log(`✓ Geospatial query test successful!`);
        console.log(`  Found ${testResults.length} businesses within 50km of Rockville, MD`);
        if (testResults.length > 0) {
          console.log(`  Sample result: ${testResults[0].Name || testResults[0].name || 'Unknown'}`);
        }
      } else {
        console.log('ℹ️  No location data in businesses collection to test with');
      }
    } catch (error) {
      console.error('⚠️  Geospatial query test failed:', error.message);
      console.error('    This might indicate an issue with the location indexes');
    }

    console.log('\n✅ Location reindexing complete!');
    console.log('\nNext steps:');
    console.log('1. Run the test script: node scripts/test-api.js');
    console.log('2. Start the dev server: npm run dev');
    console.log('3. Test location-based searches in the app');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run the reindexing
reindexLocations(); 