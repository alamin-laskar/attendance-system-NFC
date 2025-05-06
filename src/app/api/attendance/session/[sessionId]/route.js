import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/attendance';

export async function GET(request, context) {
  try {
    await dbConnect();
    const params = await context.params;
    const { sessionId } = params;

    const attendance = await Attendance.find({ sessionId })
      .populate('student', 'name')
      .sort({ createdAt: -1 });

    const formattedAttendance = attendance.map(record => ({
      _id: record._id,
      studentName: record.student.name,
      subject: record.subject,
      status: record.status,
      date: record.date,
      createdAt: record.createdAt
    }));

    return NextResponse.json(formattedAttendance);
  } catch (error) {
    console.error('Failed to fetch session attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance data' },
      { status: 500 }
    );
  }
}