// /src/app/api/attendance/end-session/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Attendance from '@/models/attendance';
import { verifyToken } from '@/utils/jwt';

export async function POST(request) {
  try {
    // Parse request body
    const { sessionId } = await request.json();

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

    // Update all attendance records for this session to mark it as completed
    await Attendance.updateMany(
      { sessionId },
      { $set: { sessionEnded: true, sessionEndTime: new Date() } }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Attendance session ended successfully' 
    });
  } catch (error) {
    console.error('Error ending attendance session:', error);
    return NextResponse.json(
      { error: 'Failed to end attendance session' },
      { status: 500 }
    );
  }
}