import crypto from 'crypto';

const SECRET_KEY = process.env.SECRET_KEY; 

export default function handler(req, res) {
  const { uid, hash } = req.query;

  if (!uid || !hash) {
    return res.status(400).json({ error: 'Missing UID or hash' });
  }

  const expectedHash = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(uid)
    .digest('hex');

  if (hash !== expectedHash) {
    console.log(`❌ Invalid HMAC for UID: ${uid}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log(`✅ Verified UID: ${uid}`);
  // TODO: Save to DB or perform actions here

  res.status(200).json({ message: 'UID accepted' });
}
