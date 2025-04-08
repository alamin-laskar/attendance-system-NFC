import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/connectDB';
import Student from '@/models/student';

export async function GET(request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'UID is required' }, { status: 400 });
  }

  try {
    const student = await Student.findOne({ uid });

    if (student) {
      return NextResponse.json({
        exists: true,
        message: 'This RFID card is already registered.',
      });
    } else {
      return NextResponse.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking UID:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
