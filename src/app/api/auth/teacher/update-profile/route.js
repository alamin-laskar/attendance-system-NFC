import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import { verifyToken } from '@/utils/jwt';
import { cookies } from 'next/headers';

export async function PUT(request) {
  try {
    await dbConnect();

    const updates = await request.json();
    
    if (!updates) {
      return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
    }

    // Get token from cookies asynchronously
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ 
        success: false,
        message: 'Not authenticated' 
      }, { status: 401 });
    }

    // Verify token asynchronously
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid token' 
      }, { status: 401 });
    }

    // Ensure the user is a teacher
    if (decoded.role !== 'teacher') {
      return NextResponse.json({ 
        success: false,
        message: 'Unauthorized - Teachers only' 
      }, { status: 403 });
    }

    // Update the teacher's profile
    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ 
        success: false,
        message: 'User not found' 
      }, { status: 404 });
    }

    // Don't return sensitive data
    updatedUser.password = undefined;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ 
      success: false,
      message: error.message || 'Server error' 
    }, { status: 500 });
  }
}