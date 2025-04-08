import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/connectDB';
import Student from '@/models/student';

export async function POST(request) {
    await connectDB();
    const { uid, fullName, rollNo, regNo, admissionYear, age, semester, branch } = await request.json();

    try {
        const existing = await Student.findOne({ uid });
        if (existing) {
            return NextResponse.json({ error: 'UID already registered' }, { status: 409 });
        }

        const student = await Student.create({
            uid,
            fullName,
            rollNo,
            regNo,
            admissionYear,
            age,
            semester,
            branch
        });

        return NextResponse.json({ message: 'Student registered', student });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
    }
}
