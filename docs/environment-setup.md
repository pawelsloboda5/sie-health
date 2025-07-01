# Environment Setup

## Required Environment Variables

Create a `.env.local` file in the root of the `sie-health` directory with the following variables:

```bash
# Azure Cosmos DB Configuration
COSMOS_DB_CONNECTION_STRING=mongodb+srv://username:password@cluster.azure.mongodb.net/?retryWrites=true&w=majority
COSMOS_DB_DATABASE_NAME=sie-nosql-db

# Azure Maps Configuration
AZURE_MAPS_KEY=your-azure-maps-key-here
```

## About the Environment Variables

### COSMOS_DB_CONNECTION_STRING
Your MongoDB connection string from Azure Cosmos DB. This should include authentication credentials.

### COSMOS_DB_DATABASE_NAME
The name of your database (e.g., `sie-nosql-db`). The app will search across ALL collections in this database.

### AZURE_MAPS_KEY
Your Azure Maps subscription key. This key is used for:
- **Client-side**: Address autocomplete in the AddressPicker component
- **Server-side**: Geocoding and validation (if needed)

By default, the same key is used for both client and server. If you need different keys for security:
```bash
# Optional: Separate key for client-side operations
NEXT_PUBLIC_AZURE_MAPS_KEY=your-public-azure-maps-key
```

## Why NEXT_PUBLIC_?

In Next.js:
- Variables with `NEXT_PUBLIC_` prefix are exposed to the browser (client-side)
- Variables without the prefix are only available server-side
- This is a security feature to prevent accidentally exposing sensitive data

Since the AddressPicker component runs in the browser and needs to call Azure Maps directly, it needs a client-accessible key.

## Collections Structure

The app searches across all collections in your database. Each collection represents a category:
- `dental_clinics`
- `community_health_centers`
- `chronic_disease_screenings`
- `primary_care_clinic`
- etc.

Documents must have a `free_services` array to appear in search results. 