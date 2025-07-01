// Environment validation utility (T-03)
export function validateEnv() {
  const required = [
    'COSMOS_DB_CONNECTION_STRING',
    'COSMOS_DB_DATABASE_NAME',
    'AZURE_MAPS_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file'
    );
  }
}

// Type-safe environment variable access
export const env = {
  cosmosDb: {
    connectionString: process.env.COSMOS_DB_CONNECTION_STRING!,
    databaseName: process.env.COSMOS_DB_DATABASE_NAME!,
  },
  azureMaps: {
    // Client-side key (optional - only if different from server key)
    publicKey: process.env.NEXT_PUBLIC_AZURE_MAPS_KEY || process.env.AZURE_MAPS_KEY!,
    // Server-side key
    serverKey: process.env.AZURE_MAPS_KEY!,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    isDev: process.env.NODE_ENV === 'development',
  },
}; 