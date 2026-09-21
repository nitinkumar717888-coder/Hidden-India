/**
 * HIDDEN INDIA — ENVIRONMENT VARIABLES VALIDATION
 * Safe typing for server and client environment variables.
 */

export interface EnvConfig {
  nodeEnv: 'development' | 'production' | 'test';
  databaseUrl?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  googleMapsApiKey?: string;
  googleMapsServerKey?: string;
}

export const env: EnvConfig = {
  nodeEnv: (process.env.NODE_ENV as EnvConfig['nodeEnv']) || 'development',
  databaseUrl: process.env.DATABASE_URL,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  googleMapsServerKey: process.env.GOOGLE_MAPS_SERVER_KEY,
};

/**
 * Validates that essential environment variables exist for features that require them.
 */
export function assertDatabaseConfigured(): string {
  if (!env.databaseUrl) {
    throw new Error(
      'DATABASE_URL is not configured. Please set DATABASE_URL in your .env.local file.'
    );
  }
  return env.databaseUrl;
}
