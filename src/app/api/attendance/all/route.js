import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Attendance from '@/models/attendance';
import { verifyAuth } from '@/utils/jwt';

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = await verifyAuth(token);

    if (!decoded || decoded.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const attendance = await Attendance.find({ teacher: decoded.id })
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
    console.error('Failed to fetch attendance records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}