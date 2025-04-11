// import { NextResponse } from 'next/server';
// import crypto from 'crypto';

// const SECRET_KEY = process.env.SECRET_KEY;

// let latestUID = null;

// export async function POST(request) {
//   const { uid, hash } = await request.json();

//   const expectedHash = crypto.createHash('sha256')
//     .update(uid + SECRET_KEY)
//     .digest('hex');

//   if (expectedHash !== hash) {
//     return NextResponse.json({ error: 'Invalid hash' }, { status: 401 });
//   }

//   latestUID = uid;

//   return NextResponse.json({ message: 'UID received', uid });
// }

// export async function GET() {
//   if (!latestUID) {
//     return NextResponse.json({ uid: null });
//   }

//   const tempUID = latestUID;
//   latestUID = null; // clear after one-time read
//   return NextResponse.json({ uid: tempUID });
// }


import { NextResponse } from 'next/server';
import crypto from 'crypto';

const SECRET_KEY = process.env.SECRET_KEY;

let latestData = null; // Store UID and year

export async function POST(request) {
  const { uid, year, hash } = await request.json();

  const expectedHash = crypto.createHash('sha256')
    .update(uid + SECRET_KEY)
    .digest('hex');

  if (expectedHash !== hash) {
    return NextResponse.json({ error: 'Invalid hash' }, { status: 401 });
  }

  latestData = { uid, year }; // Store both

  return NextResponse.json({ message: 'UID and year received', uid, year });
}

export async function GET() {
  if (!latestData) {
    return NextResponse.json({ uid: null, year: null });
  }

  const temp = latestData;
  latestData = null; // Clear after one-time read

  return NextResponse.json(temp); // { uid, year }
}
