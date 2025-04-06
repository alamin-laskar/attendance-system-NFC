import { connectDB } from '@/lib/connectDB';
import { User } from '@/models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { rollNo, email, password } = await req.json();
    await connectDB();

    const user = await User.findOne({ rollNo, email });
    if (!user) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Response.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        rollNo: user.rollNo,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return Response.json({ token }, { status: 200 });
  } catch (error) {
    console.error('Signin Error:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}
