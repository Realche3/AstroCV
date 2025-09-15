import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/payments/jwt';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) return NextResponse.json({ valid: false });

  const payload = verifyAccessToken(token);
  if (!payload) return NextResponse.json({ valid: false });

  return NextResponse.json({ valid: true, type: payload.type, exp: payload.exp });
}
