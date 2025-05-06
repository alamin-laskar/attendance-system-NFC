// ./src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = cookies();

    // Create response first
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Set cookie asynchronously
    await response.cookies.set({
      name: 'token',
      value: '',
      httpOnly: true,
      path: '/',
      expires: new Date(0),
      sameSite: 'strict'
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ 
      success: false,
      message: error.message || 'Server error' 
    }, { status: 500 });
  }
}
