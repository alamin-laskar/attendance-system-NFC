// ./app/api/auth/admin/create-student/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await dbConnect();

    // Verify admin token from cookies
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      name,
      studentId,
      regNo,
      department,
      semester,
      email,
      phone,
      nfcId
    } = await request.json();

    // Validate required fields
    if (!name || !studentId || !regNo || !department || !semester || !email || !phone || !nfcId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check if there's an existing user with this NFC ID
    let existingUserWithNfc = null;
    if (nfcId) {
      existingUserWithNfc = await User.findOne({ nfcId });
    }

    // Check if student already exists by email or studentId or regNo
    const existingStudent = await User.findOne({
      $or: [
        { email },
        { studentId },
        { regNo }
      ]
    });

    // If the student with the same email/studentId/regNo exists
    if (existingStudent) {
      // If the existing student already has an NFC ID (different from the current one)
      if (existingStudent.nfcId && existingStudent.nfcId !== nfcId) {
        return NextResponse.json({
          error: `Student already has a different NFC card registered`
        }, { status: 400 });
      }

      // If someone else already has this NFC ID
      if (existingUserWithNfc && existingUserWithNfc._id.toString() !== existingStudent._id.toString()) {
        return NextResponse.json({
          error: `This NFC card is already registered to another user`
        }, { status: 400 });
      }

      // Update the existing student with the new NFC ID and any other missing information
      const updates = {
        nfcId,
        department: department || existingStudent.department,
        semester: semester || existingStudent.semester,
        phone: phone || existingStudent.phone,
        role: 'student' // Ensure role is set to student
      };

      // Update student record
      const updatedStudent = await User.findByIdAndUpdate(
        existingStudent._id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      return NextResponse.json({
        message: 'Student information updated successfully',
        student: {
          id: updatedStudent._id,
          name: updatedStudent.name,
          studentId: updatedStudent.studentId,
          email: updatedStudent.email,
          updated: true
        }
      });
    }

    // If no existing student but the NFC ID is already in use
    if (existingUserWithNfc) {
      return NextResponse.json({
        error: `This NFC card is already registered to another user`
      }, { status: 400 });
    }

    // Create new student if no existing record was found
    // Create random password for student (they can change it later)
    const tempPassword = Math.random().toString(36).slice(-8);

    // Create new student
    const student = await User.create({
      name,
      studentId,
      regNo,
      department,
      semester,
      email,
      phone,
      nfcId,
      password: tempPassword, // This should be hashed in the User model
      role: 'student'
    });

    // TODO: Send email to student with their credentials

    return NextResponse.json({
      message: 'Student registered successfully',
      student: {
        id: student._id,
        name: student.name,
        studentId: student.studentId,
        email: student.email
      }
    });

  } catch (error) {
    console.error('Student registration error:', error);
    return NextResponse.json({
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}