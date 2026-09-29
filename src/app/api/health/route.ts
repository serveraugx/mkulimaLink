import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Returns the health status of the application.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '0.1.0',
      environment: process.env.NODE_ENV,
    },
    { status: 200 }
  );
}
