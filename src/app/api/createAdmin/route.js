import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/connectDB';
import Admin from '@/models/admin';

export async function POST(req) {
  await connectDB();
  const { username, password, department } = await req.json();

  if (!username || !password || !department) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const existingAdmin = await Admin.findOne({ username });
  if (existingAdmin) {
    return NextResponse.json({ error: 'Admin already exists' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdmin = new Admin({ username, password: hashedPassword, department });
  await newAdmin.save();

  return NextResponse.json({ message: 'Admin created successfully' }, { status: 201 });
}
