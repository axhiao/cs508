import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });
  const { pathname } = req.nextUrl;

  // Define routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile', '/messages', '/transactions', '/listings/create', '/offers'];

  // If the user is not authenticated and tries to access a protected route, redirect to login
  if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/messages/:path*', '/transactions/:path*', '/listings/create', '/offers/:path*'],
}; 