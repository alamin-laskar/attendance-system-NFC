// ./app/api/connect-esp/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import Attendance from '@/models/attendance';

const ESP_SECRET_KEY = process.env.ESP_SECRET_KEY ;

// Store the latest NFC scan in memory for registration form to access
let latestNfcScan = null;

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { uid, semester, subject, hash } = body;

    // Validate required fields
    if (!uid) {
      return NextResponse.json({ 
        error: 'Missing NFC UID' 
      }, { status: 400 });
    }
    
    // Store this card ID for registration form to access
    latestNfcScan = {
      uid: uid,
      timestamp: Date.now()
    };
    
    // Find the user by NFC ID
    const user = await User.findOne({ nfcId: uid });
  
    // If user not found, return the UID for registration purposes
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        uid: uid,
        isRegistered: false
      }, { status: 404 });
    }
    
    // Verify hash for security
    const expectedHash = crypto.createHash('sha256')
      .update(uid + semester + subject + ESP_SECRET_KEY)
      .digest('hex');

    if (expectedHash !== hash) {
      return NextResponse.json({ 
        error: 'Invalid hash' 
      }, { status: 401 });
    }

    // Check if user has already attended this class today
    const hasAttended = await Attendance.hasAttendedClass(user._id, subject, new Date());
    if (hasAttended) {
      return NextResponse.json({ 
        error: 'Attendance already marked for today',
        status: 'duplicate'
      }, { status: 409 });
    }

    // Create attendance record
    const attendance = await Attendance.create({
      user: user._id,
      nfcId: uid,
      subject,
      semester,
      scanTime: new Date(),
      classSession: body.classSession || 'default',
      role: user.role,
      metadata: {
        deviceId: request.headers.get('x-device-id') || 'unknown',
        verificationMethod: 'nfc'
      }
    });

    return NextResponse.json({ 
      message: 'Attendance recorded successfully',
      attendance: {
        id: attendance._id,
        subject,
        semester,
        status: attendance.status,
        scanTime: attendance.scanTime
      }
    });

  } catch (error) {
    console.error('ESP connection error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Return the latest card scan if available and recent (last 30 seconds)
    if (latestNfcScan && (Date.now() - latestNfcScan.timestamp < 30000)) {
      return NextResponse.json({
        uid: latestNfcScan.uid,
        timestamp: latestNfcScan.timestamp
      });
    }
    
    // Otherwise return an empty response
    return NextResponse.json({
      message: 'No recent card scans'
    });
  } catch (error) {
    console.error('ESP data retrieval error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Add a route for testing the API connection
export async function OPTIONS(request) {
  return NextResponse.json({
    status: 'ok',
    message: 'ESP connection test successful'
  });
}