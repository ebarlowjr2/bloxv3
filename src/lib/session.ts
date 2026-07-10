// Signed-cookie session helpers. Web Crypto only, so they run in both the
// edge middleware and node route handlers.

export const SESSION_COOKIE = 'blox_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function hmacHex(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createSessionToken(secret: string): Promise<string> {
  const expiry = String(Date.now() + SESSION_TTL_MS);
  const sig = await hmacHex(expiry, secret);
  return `${expiry}.${sig}`;
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const [expiry, sig] = token.split('.');
  if (!expiry || !sig) return false;
  if (!/^\d+$/.test(expiry) || Number(expiry) < Date.now()) return false;
  const expected = await hmacHex(expiry, secret);
  // Constant-time comparison
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function passwordMatches(candidate: string, actual: string, secret: string): Promise<boolean> {
  // Compare HMACs rather than raw strings to avoid timing leaks.
  const a = await hmacHex(candidate, secret);
  const b = await hmacHex(actual, secret);
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0 && a.length === b.length;
}
