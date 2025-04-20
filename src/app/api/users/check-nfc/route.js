// ./app/api/users/check-nfc/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import { verifyToken } from '@/utils/jwt';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    await dbConnect();
    
    // Get token from cookies to verify admin access
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the NFC ID from query params
    const { searchParams } = new URL(request.url);
    const nfcId = searchParams.get('nfcId');
    
    if (!nfcId) {
      return NextResponse.json({ 
        error: 'Missing NFC ID parameter'
      }, { status: 400 });
    }
    
    // Find user by NFC ID
    const user = await User.findOne({ nfcId }).select('-password');
    
    if (!user) {
      return NextResponse.json({
        exists: false,
        message: 'No user found with this NFC ID'
      });
    }
    
    return NextResponse.json({
      exists: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        regNo: user.regNo,
        department: user.department,
        semester: user.semester,
        phone: user.phone,
        nfcId: user.nfcId
      }
    });
    
  } catch (error) {
    console.error('Check NFC user error:', error);
    return NextResponse.json({ 
      success: false,
      message: error.message || 'Server error' 
    }, { status: 500 });
  }
}