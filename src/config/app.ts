/**
 * Application-wide configuration constants.
 * Values are derived from environment variables with safe defaults.
 */
const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME ?? 'MyApp',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    description: 'A production-ready Next.js 14 starter template',
  },

  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? '/api',
    timeout: 10_000,
  },

  auth: {
    sessionKey: 'auth-storage',
    tokenExpiry: 60 * 60 * 24 * 7, // 7 days in seconds
  },

  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
} as const;

export default config;
