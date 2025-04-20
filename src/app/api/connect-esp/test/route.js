// ./app/api/connect-esp/test/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: "ok",
    message: "ESP API connection successful",
    timestamp: new Date().toISOString()
  });
}