// src/app/api/admin/create-admin/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import { verifyToken } from '@/utils/jwt';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    await dbConnect();
    
    // Get token from cookies - make sure to await cookies()
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    // Find user by id and verify they are an admin
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
    }
    
    // Get new admin data
    const { name, email, password } = await request.json();
    
    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email and password are required' }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 400 });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create admin user
    const newAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });
    
    // Don't return password
    newAdmin.password = undefined;
    
    return NextResponse.json({ 
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({ 
      success: false,
      message: error.message || 'Server error' 
    }, { status: 500 });
  }
}