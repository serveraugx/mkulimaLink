import { NextRequest, NextResponse } from 'next/server';

type HandlerFn = (req: NextRequest, context?: unknown) => Promise<NextResponse>;

/**
 * Wraps an API route handler in a try/catch block.
 * Returns a 500 response with error details on unhandled exceptions.
 */
export function withErrorHandler(handler: HandlerFn): HandlerFn {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error('[API Error]', error);
      const message = error instanceof Error ? error.message : 'Internal Server Error';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}

/**
 * Creates a standard JSON success response.
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data, success: true }, { status });
}

/**
 * Creates a standard JSON error response.
 */
export function errorResponse(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message, success: false }, { status });
}
