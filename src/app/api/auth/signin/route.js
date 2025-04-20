// src/app/api/auth/signin/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import { signToken } from '@/utils/jwt';


export async function POST(request) {
  try {
    await dbConnect();
    
    const { email, password } = await request.json();
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }
    
    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    // Create token
    const token = signToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    // Create the response first
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId
      },
      token
    });
    
    // Set the cookie directly on the response
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'strict'
    });
    
    // Don't return password
    user.password = undefined;
    
    return response;
    
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json({ 
      success: false,
      message: error.message || 'Server error' 
    }, { status: 500 });
  }
}