import { NextResponse } from 'next/server';
import crypto from 'crypto';

function verifyToken(token: string) {
  try {
    const [header, body, sig] = token.split('.');
    if (!header || !body || !sig) return null;
    const expected = crypto
      .createHmac('sha256', process.env.ACCESS_TOKEN_SECRET!)
      .update(`${header}.${body}`)
      .digest('base64url');
    if (expected !== sig) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) return NextResponse.json({ valid: false });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ valid: false });

  return NextResponse.json({ valid: true, type: payload.type, exp: payload.exp });
}
