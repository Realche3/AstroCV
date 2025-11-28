// src/lib/payments/jwt.ts
import crypto from 'crypto';

function base64url(input: Buffer | string) {
  return Buffer
    .from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export interface AccessPayload {
  type: 'bundle' | 'pro';
  exp: number; // unix seconds
  sid?: string; // sessionId
  email?: string | null;
}

export function issueAccessToken(payload: AccessPayload) {
  const secret = process.env.ACCESS_TOKEN_SECRET!;
  if (!secret) throw new Error('ACCESS_TOKEN_SECRET is not set');

  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = base64url(JSON.stringify(header));
  const bodyB64 = base64url(JSON.stringify(payload));
  const sig = crypto
    .createHmac('sha256', secret)
    .update(`${headerB64}.${bodyB64}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${headerB64}.${bodyB64}.${sig}`;
}

export function verifyAccessToken(token: string): AccessPayload | null {
  try {
    const secret = process.env.ACCESS_TOKEN_SECRET!;
    if (!secret) return null;
    const [headerB64, bodyB64, sig] = token.split('.');
    if (!headerB64 || !bodyB64 || !sig) return null;

    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${headerB64}.${bodyB64}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (expectedSig !== sig) return null;

    const payload = JSON.parse(Buffer.from(bodyB64, 'base64').toString('utf8')) as AccessPayload;
    if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
