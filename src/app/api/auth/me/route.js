//api/auth/me/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import { verifyToken } from '@/utils/jwt';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    await dbConnect();
    
    // Get token from cookies - make sure to await cookies()
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    // Find user by id
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        nfcId: user.nfcId
      }
    });
    
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json({ 
      success: false,
      message: error.message || 'Server error' 
    }, { status: 500 });
  }
}