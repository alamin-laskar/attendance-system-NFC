// ./src/middleware.js
// Token validation middleware
import { NextResponse } from 'next/server';
import { verifyToken } from './utils/jwt';

// Paths that require authentication
const protectedPaths = [
  '/student',
  '/teacher',
  '/admin',
];

// Paths that require specific roles
const roleBasedPaths = {
  '/student': ['student'],
  '/teacher': ['teacher'],
  '/admin': ['admin'],
};

// Public paths that should be accessible without authentication
const publicPaths = ['/signin', '/signup', '/', '/api/auth/signin', '/api/auth/signup'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath) {
    // Get the token from cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      // Store the attempted URL to redirect back after login
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
    
    // Verify the token
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
    
    // Check role-based access
    for (const [pathPrefix, allowedRoles] of Object.entries(roleBasedPaths)) {
      if (pathname.startsWith(pathPrefix) && !allowedRoles.includes(decoded.role)) {
        // Redirect to appropriate dashboard based on user role
        const dashboardPath = 
          decoded.role === 'admin' ? '/admin/dashboard' : 
          decoded.role === 'teacher' ? '/teacher/dashboard' : 
          '/student/dashboard';
        
        return NextResponse.redirect(new URL(dashboardPath, request.url));
      }
    }
  }
  
  return NextResponse.next();
}

// Configure the middleware to run on all paths except static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};