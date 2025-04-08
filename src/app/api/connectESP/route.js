// import crypto from 'crypto';

// const SECRET_KEY = process.env.SECRET_KEY; 

// export default function handler(req, res) {
//   const { uid, hash } = req.query;

//   if (!uid || !hash) {
//     return res.status(400).json({ error: 'Missing UID or hash' });
//   }

//   const expectedHash = crypto
//     .createHmac('sha256', SECRET_KEY)
//     .update(uid)
//     .digest('hex');

//   if (hash !== expectedHash) {
//     console.log(`❌ Invalid HMAC for UID: ${uid}`);
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   console.log(`✅ Verified UID: ${uid}`);
//   // TODO: Save to DB or perform actions here

//   res.status(200).json({ message: 'UID accepted' });
// }



// import { NextResponse } from 'next/server';
// import crypto from 'crypto';

// const SECRET_KEY = process.env.SECRET_KEY; 


// export async function POST(request) {
//   const { uid, hash } = await request.json();

//   const dataToHash = uid + SECRET_KEY;
//   const expectedHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

//   if (expectedHash !== hash) {
//     return NextResponse.json({ error: 'Invalid hash' }, { status: 401 });
//   }

//   // Hash is valid
//   console.log('Valid UID:', uid);
//   return NextResponse.json({ message: 'RFID data verified', uid });
// }




// src/app/api/rfid/route.js

import { NextResponse } from 'next/server';
import crypto from 'crypto';

const SECRET_KEY = process.env.SECRET_KEY;

let latestUID = null;

export async function POST(request) {
  const { uid, hash } = await request.json();

  const expectedHash = crypto.createHash('sha256')
    .update(uid + SECRET_KEY)
    .digest('hex');

  if (expectedHash !== hash) {
    return NextResponse.json({ error: 'Invalid hash' }, { status: 401 });
  }

  latestUID = uid;

  return NextResponse.json({ message: 'UID received', uid });
}

export async function GET() {
  if (!latestUID) {
    return NextResponse.json({ uid: null });
  }

  const tempUID = latestUID;
  latestUID = null; // clear after one-time read
  return NextResponse.json({ uid: tempUID });
}
