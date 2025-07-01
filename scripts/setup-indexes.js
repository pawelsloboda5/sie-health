// Script to create geospatial indexes on all collections
// Run this once: node scripts/setup-indexes.js

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function setupIndexes() {
  const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
  const databaseName = process.env.COSMOS_DB_DATABASE_NAME;

  if (!connectionString || !databaseName) {
    console.error('Missing required environment variables:');
    console.error('- COSMOS_DB_CONNECTION_STRING');
    console.error('- COSMOS_DB_DATABASE_NAME');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const client = new MongoClient(connectionString);

  try {
    await client.connect();
    console.log('Connected successfully!');

    const db = client.db(databaseName);
    console.log(`Using database: ${databaseName}\n`);

    // Get all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections
      .map(c => c.name)
      .filter(name => !name.startsWith('system.'));

    console.log(`Found ${collectionNames.length} collections to index:\n`);

    // Create indexes on each collection
    for (const collectionName of collectionNames) {
      console.log(`Processing: ${collectionName}`);
      const collection = db.collection(collectionName);

      try {
        // Create 2dsphere index for geospatial queries
        await collection.createIndex({ location: '2dsphere' });
        console.log(`  ✓ Created geospatial index on 'location'`);

        // Create index on free_services for filtering
        await collection.createIndex({ 'free_services.service': 1 });
        console.log(`  ✓ Created index on 'free_services.service'`);

        // Count documents with free_services
        const count = await collection.countDocuments({
          free_services: { $exists: true, $ne: [] }
        });
        console.log(`  → ${count} documents with free_services\n`);
      } catch (error) {
        console.error(`  ✗ Error creating indexes: ${error.message}\n`);
      }
    }

    console.log('Index creation complete!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run the setup
setupIndexes(); 