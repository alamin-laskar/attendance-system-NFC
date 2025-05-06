// /src/app/api/attendance/count/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Attendance from '@/models/attendance';
import { verifyToken } from '@/utils/jwt';

export async function GET(request) {
  try {
    // Get session ID from query parameters
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Count attendance records for this session
    const count = await Attendance.countDocuments({ sessionId });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error counting attendance:', error);
    return NextResponse.json(
      { error: 'Failed to count attendance' },
      { status: 500 }
    );
  }
}