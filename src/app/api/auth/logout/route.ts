import { successResponse, withErrorHandler } from '@/lib/apiHelpers';
import { sessionCookieOptions } from '@/lib/auth';

export const POST = withErrorHandler(async () => {
  const res = successResponse({ loggedOut: true });
  res.cookies.set(sessionCookieOptions().name, '', { ...sessionCookieOptions(), maxAge: 0 });
  return res;
});
