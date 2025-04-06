import { connectDB } from '@/lib/connectDB.js';

export async function GET() {
  try {
    await connectDB();
    return Response.json({ status: 'success', message: 'Connected to MongoDB' });
  } catch (err) {
    return Response.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
