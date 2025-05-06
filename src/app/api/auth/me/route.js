//api/auth/me/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import { verifyToken } from '@/utils/jwt';
import { cookies } from 'next/headers';
import { RateLimiter } from 'limiter';

// Create a rate limiter: 10 requests per 10 seconds per IP
const limiter = new RateLimiter({
  tokensPerInterval: 10,
  interval: 10000,
  fireImmediately: true
});

// In-memory cache with expiration
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds cache

export async function GET(request) {
  try {
    // Get client IP
    const ip = request.headers.get('x-forwarded-for') || request.ip;
    
    // Check rate limit
    const remainingRequests = await limiter.tryRemoveTokens(1);
    if (remainingRequests < 0) {
      return NextResponse.json({ 
        success: false,
        message: 'Too many requests. Please try again later.' 
      }, { 
        status: 429,
        headers: {
          'Retry-After': '10'
        }
      });
    }

    await dbConnect();
    
    // Get token from cookies asynchronously
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    
    // Verify token asynchronously
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Check cache first
    const cacheKey = `user:${decoded.id}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData && cachedData.expiry > Date.now()) {
      return NextResponse.json({
        success: true,
        user: cachedData.data,
        cached: true
      });
    }
    
    // If not in cache or expired, fetch from database
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Prepare user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      nfcId: user.nfcId,
      department: user.department,
      subjects: user.subjects,
      qualification: user.qualification,
      specialization: user.specialization
    };

    // Store in cache
    cache.set(cacheKey, {
      data: userData,
      expiry: Date.now() + CACHE_TTL
    });
    
    const response = NextResponse.json({
      success: true,
      user: userData
    }, {
      headers: {
        'Cache-Control': 'private, max-age=30',
        'X-RateLimit-Remaining': String(remainingRequests)
      }
    });

    return response;
    
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json({ 
      success: false,
      message: error.message || 'Server error' 
    }, { status: 500 });
  }
}