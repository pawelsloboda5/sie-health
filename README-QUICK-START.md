# Free Health Finder - Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- Azure Maps subscription key with CORS enabled (allow "*")
- MongoDB connection string (Azure Cosmos DB)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local` file:**
   ```bash
   # Azure Cosmos DB Configuration
   COSMOS_DB_CONNECTION_STRING=your-connection-string
   COSMOS_DB_DATABASE_NAME=sie-db

   # Azure Maps Configuration
   AZURE_MAPS_KEY=your-azure-maps-key
   NEXT_PUBLIC_AZURE_MAPS_KEY=your-azure-maps-key  # Same key for client-side
   ```

3. **Set up database indexes (run once):**
   ```bash
   node scripts/setup-indexes.js
   ```
   This will create geospatial indexes on all collections for fast location-based searches.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Testing the Application

### 1. Test the API endpoints:
```bash
node scripts/test-api.js
```

This will test:
- `/api/nearby` - Search for nearby providers (REAL DATA from Cosmos DB)
- `/api/categories` - Get service categories (REAL collection names)
- `/api/test-geocode` - Test Azure Maps geocoding

### 2. Test the UI:
1. Open http://localhost:3000
2. Enter an address (e.g., "1101 Wootton Pkwy, Rockville, MD")
3. Click "Search"
4. View REAL results from your database showing free health services

### 3. Test specific addresses:
The app will geocode any address using Azure Maps and search within 100km radius:
- `123 Main St, Baltimore, MD`
- `1600 Pennsylvania Avenue NW, Washington, DC`
- `Johns Hopkins Hospital, Baltimore, MD`

## Features Implemented

✅ **Real Database Connection** - Searches across ALL collections in Cosmos DB
✅ **Address Search** - Real Azure Maps geocoding
✅ **Nearby Search API** - Returns providers within 100km radius
✅ **Categories API** - Lists actual collection names from your database
✅ **Responsive UI** - Mobile-first design with accessibility
✅ **Error Handling** - Graceful failures with user feedback
✅ **Expandable Results** - Click "View Details" to see all free services

## How It Works

1. **User enters address** → Azure Maps geocodes to lat/lng
2. **Search query** → Queries ALL collections in parallel
3. **Filters results** → Only shows documents with `free_services` array
4. **Calculates distance** → Uses geospatial query with 2dsphere index
5. **Returns sorted results** → Up to 20 providers sorted by distance

## Next Steps

1. **Add Service Filter:**
   - Create a dropdown using categories API
   - Filter by specific service types

2. **Add Language Support:**
   - Spanish translations with next-intl
   - Language switcher component

3. **Add Map View:**
   - Show results on an interactive map
   - Use Azure Maps Web Control

## Troubleshooting

### No Results Found
- Verify documents in your collections have `free_services` array
- Check that documents have `location` field with coordinates
- Ensure indexes are created (run `node scripts/setup-indexes.js`)

### Database Connection Error
- Check your connection string in `.env.local`
- Verify database name matches your Cosmos DB
- Ensure IP is whitelisted in Azure

### Azure Maps Error
- Verify your Azure Maps key is correct
- Check CORS is enabled on Azure Maps resource
- For client-side, ensure `NEXT_PUBLIC_AZURE_MAPS_KEY` is set

### Environment Variables Not Loading
- Ensure `.env.local` file is in the `sie-health` directory
- Restart the dev server after changing environment variables 