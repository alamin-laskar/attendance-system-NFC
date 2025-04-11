import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/connectDB';
import Admin from '@/models/admin';

export async function POST(req) {
  await connectDB();
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  const admin = await Admin.findOne({ username });
  if (!admin) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Sign JWT
  const token = jwt.sign(
    { adminId: admin._id, department: admin.department },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: '1h' }
  );

  const res = NextResponse.json({ message: 'Login successful' });
  res.cookies.set('adminToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600,
    path: '/',
  });

  return res;
}
