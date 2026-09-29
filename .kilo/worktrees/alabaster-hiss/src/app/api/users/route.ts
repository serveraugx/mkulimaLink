import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/users
 * Returns a paginated list of users.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 10);

  // TODO: Replace with real database query
  const mockUsers = Array.from({ length: limit }, (_, i) => ({
    id: (page - 1) * limit + i + 1,
    name: `User ${(page - 1) * limit + i + 1}`,
    email: `user${(page - 1) * limit + i + 1}@example.com`,
    role: 'user',
    createdAt: new Date().toISOString(),
  }));

  return NextResponse.json({
    data: mockUsers,
    pagination: {
      page,
      limit,
      total: 100,
      totalPages: Math.ceil(100 / limit),
    },
  });
}

/**
 * POST /api/users
 * Creates a new user.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  // TODO: Validate body and persist to database
  const newUser = {
    id: Date.now(),
    ...body,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ data: newUser }, { status: 201 });
}
