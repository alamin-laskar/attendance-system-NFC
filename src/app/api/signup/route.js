import { connectDB } from '@/lib/connectDB';
import { User } from '@/models/user';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    await connectDB();
    const { name, rollNo, email, password } = await req.json();

    // Simple validation
    if (!name || !rollNo || !email || !password) {
      return Response.json({ message: 'All fields are required.' }, { status: 400 });
    }

    // Check if user already exists
    const existingEmail = await User.findOne({ email });
    const existingRoll = await User.findOne({ rollNo });

    if (existingEmail) {
      return Response.json({ message: 'Email already registered.' }, { status: 409 });
    }
    if (existingRoll) {
      return Response.json({ message: 'Roll number already registered.' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
      name,
      rollNo,
      email,
      password: hashedPassword,
    });

    return Response.json({ message: 'User registered successfully.' }, { status: 201 });
  } catch (err) {
    console.error('Signup Error:', err);
    return Response.json({ message: 'Something went wrong.' }, { status: 500 });
  }
}
