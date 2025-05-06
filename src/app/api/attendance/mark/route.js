// /src/app/api/attendance/mark/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/attendance';
import { verifyAuth } from '@/utils/jwt';

export async function POST(request) {
  try {
    // Verify student authentication
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyAuth(token);

    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get attendance data from request
    const { sessionId, studentId, subject, teacherId } = await request.json();

    if (!sessionId || !studentId || !subject || !teacherId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if attendance is already marked
    const existingAttendance = await Attendance.findOne({
      sessionId,
      student: studentId
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance already marked for this session' },
        { status: 400 }
      );
    }

    // Create new attendance record
    const attendance = new Attendance({
      sessionId,
      student: studentId,
      teacher: teacherId,
      subject,
      status: 'PRESENT',
      date: new Date()
    });

    await attendance.save();

    return NextResponse.json({
      message: 'Attendance marked successfully',
      attendance
    });

  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json(
      { error: 'Failed to mark attendance' },
      { status: 500 }
    );
  }
}