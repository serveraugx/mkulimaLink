import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/users/[id]
 * Returns a single user by ID.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = params;

  // TODO: Replace with real database query
  const user = { id, name: `User ${id}`, email: `user${id}@example.com`, role: 'user' };

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ data: user });
}

/**
 * PATCH /api/users/[id]
 * Partially updates a user.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  const body = await request.json();

  // TODO: Validate and persist update
  const updated = { id, ...body, updatedAt: new Date().toISOString() };

  return NextResponse.json({ data: updated });
}

/**
 * DELETE /api/users/[id]
 * Deletes a user by ID.
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = params;

  // TODO: Delete from database
  console.warn(`Deleting user ${id}`);

  return new NextResponse(null, { status: 204 });
}
