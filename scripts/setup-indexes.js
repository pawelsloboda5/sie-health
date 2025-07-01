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

        // CRITICAL: Index for filtering only processed documents
        await collection.createIndex({ 'jina_scraped': 1 });
        console.log(`  ✓ Created index on 'jina_scraped'`);

        // Category index for filtering
        await collection.createIndex({ 'Category': 1 });
        console.log(`  ✓ Created index on 'Category'`);

        // Compound index for free/discounted services search
        await collection.createIndex({ 
          'services_offered.general_services.is_free': 1,
          'services_offered.general_services.is_discounted': 1,
          'services_offered.specialized_services.is_free': 1,
          'services_offered.specialized_services.is_discounted': 1
        });
        console.log(`  ✓ Created compound index for free/discounted services`);

        // Insurance indexes for common filters
        await collection.createIndex({ 'insurance_accepted.medicaid': 1 });
        await collection.createIndex({ 'insurance_accepted.medicare': 1 });
        await collection.createIndex({ 'insurance_accepted.self_pay_options': 1 });
        console.log(`  ✓ Created insurance indexes`);

        // Financial assistance indexes
        await collection.createIndex({ 'financial_assistance.sliding_scale_available': 1 });
        await collection.createIndex({ 'financial_assistance.accepts_uninsured': 1 });
        console.log(`  ✓ Created financial assistance indexes`);

        // Documentation requirements (CRITICAL for vulnerable populations)
        await collection.createIndex({ 'documentation_requirements.ssn_required': 1 });
        await collection.createIndex({ 'documentation_requirements.id_required': 1 });
        console.log(`  ✓ Created documentation requirement indexes`);

        // Accessibility indexes
        await collection.createIndex({ 'telehealth_info.telehealth_available': 1 });
        await collection.createIndex({ 'accessibility_info.walk_ins_accepted': 1 });
        console.log(`  ✓ Created accessibility indexes`);

        // Text index for full-text search across key fields
        await collection.createIndex({
          'Name': 'text',
          'Category': 'text',
          'services_offered.general_services.name': 'text',
          'services_offered.specialized_services.name': 'text',
          'health_conditions_focus.conditions_treated': 'text'
        });
        console.log(`  ✓ Created text search index`);

        // Count processed documents
        const processedCount = await collection.countDocuments({
          jina_scraped: true
        });
        const totalCount = await collection.countDocuments({});
        console.log(`  → ${processedCount} processed documents (out of ${totalCount} total)\n`);
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