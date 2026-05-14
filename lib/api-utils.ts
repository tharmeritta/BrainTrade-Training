import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/session/server';
import type { UserRole } from '@/types';

type ApiHandler = (req: NextRequest, context: any, user: NonNullable<Awaited<ReturnType<typeof getServerUser>>>) => Promise<NextResponse>;

/**
 * Higher-order function to wrap API handlers with authentication and authorization.
 * Also handles standard error catching and logging.
 */
export function withApiAuth(handler: ApiHandler, allowedRoles?: UserRole[]) {
  return async (req: NextRequest, context: any) => {
    try {
      const user = await getServerUser();
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Special case: 'admin' always has access if any role is specified
        if (user.role !== 'admin') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }

      return await handler(req, context, user);
    } catch (err: any) {
      console.error(`[API Error] ${req.method} ${req.nextUrl.pathname}:`, err);
      
      const status = err.message === 'Forbidden' ? 403 : 500;
      const errorMsg = status === 403 ? 'Forbidden' : 'Internal Server Error';
      
      return NextResponse.json({ 
        error: errorMsg, 
        message: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }, { status });
    }
  };
}

/**
 * Standard error response for API routes
 */
export function apiError(message: string, status: number = 500, details?: any) {
  return NextResponse.json({ 
    error: status === 400 ? 'Bad Request' : (status === 401 ? 'Unauthorized' : (status === 403 ? 'Forbidden' : 'Internal Server Error')),
    message,
    details 
  }, { status });
}
