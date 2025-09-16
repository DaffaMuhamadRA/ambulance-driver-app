// Application configuration
// Handle base URL dynamically to avoid manual changes when port changes

/**
 * Get the current base URL for API calls
 * This function automatically detects the correct URL based on the environment
 */
export function getBaseUrl(): string {
  // In browser environment, use the current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Check for explicit environment variable first (highest priority)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // For Vercel deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // For development environment
  if (process.env.NODE_ENV === 'development') {
    // Next.js automatically sets the PORT environment variable
    // when running on a specific port
    const port = process.env.PORT || '3000';
    return `http://localhost:${port}`;
  }
  
  // For production environments, try to determine from common environment variables
  if (process.env.HOST) {
    return process.env.HOST;
  }
  
  if (process.env.SERVER_URL) {
    return process.env.SERVER_URL;
  }
  
  // Final fallback for production
  return 'http://localhost:3000';
}

// Export the base URL as a constant
export const BASE_URL = getBaseUrl();

export default {
  BASE_URL,
};