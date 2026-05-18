// Lightweight WebAuthn-based biometric gate.
// We use the platform authenticator (Face ID / Touch ID / Android fingerprint /
// Windows Hello) purely as a *local* unlock for an already-valid Supabase
// session. No server-side WebAuthn verification — the actual auth-of-record
// remains the Supabase session.

const ENROLL_KEY = (userId: string) => `auren_biometric_v1_${userId}`;
const LAST_ENROLLED_KEY = "auren_biometric_last_user";
const VERIFIED_AT_KEY = "auren_biometric_verified_at";

// How long a successful biometric unlock stays valid before re-prompting.
export const VERIFY_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

type EnrollRecord = {
  credentialId: string; // base64url
  email: string;
  createdAt: number;
};

function b64urlToBytes(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function bytesToB64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function isPlatformAuthAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function getEnrollment(userId: string): EnrollRecord | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(ENROLL_KEY(userId));
    return raw ? (JSON.parse(raw) as EnrollRecord) : null;
  } catch {
    return null;
  }
}

export function getLastEnrolledUserId(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(LAST_ENROLLED_KEY);
}

export function isEnrolled(userId: string): boolean {
  return !!getEnrollment(userId);
}

export function disableBiometric(userId: string) {
  localStorage.removeItem(ENROLL_KEY(userId));
  if (localStorage.getItem(LAST_ENROLLED_KEY) === userId) {
    localStorage.removeItem(LAST_ENROLLED_KEY);
  }
  localStorage.removeItem(VERIFIED_AT_KEY);
}

export function markVerified() {
  localStorage.setItem(VERIFIED_AT_KEY, String(Date.now()));
}
export function clearVerified() {
  localStorage.removeItem(VERIFIED_AT_KEY);
}
export function needsVerification(ttl = VERIFY_TTL_MS): boolean {
  const t = Number(localStorage.getItem(VERIFIED_AT_KEY) || 0);
  if (!t) return true;
  return Date.now() - t > ttl;
}

export async function enrollBiometric(userId: string, email: string): Promise<void> {
  if (!(await isPlatformAuthAvailable())) {
    throw new Error("Biometric authentication isn't available on this device.");
  }
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userIdBytes = new TextEncoder().encode(userId);

  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: "Auren Plumbing Supplies", id: window.location.hostname },
      user: {
        id: userIdBytes,
        name: email,
        displayName: email,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },   // ES256
        { type: "public-key", alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60_000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;

  if (!cred) throw new Error("Biometric enrolment was cancelled.");

  const record: EnrollRecord = {
    credentialId: bytesToB64url(cred.rawId),
    email,
    createdAt: Date.now(),
  };
  localStorage.setItem(ENROLL_KEY(userId), JSON.stringify(record));
  localStorage.setItem(LAST_ENROLLED_KEY, userId);
  markVerified();
}

export async function verifyBiometric(userId: string): Promise<boolean> {
  const rec = getEnrollment(userId);
  if (!rec) return false;
  if (!(await isPlatformAuthAvailable())) return false;
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60_000,
        userVerification: "required",
        rpId: window.location.hostname,
        allowCredentials: [
          {
            id: b64urlToBytes(rec.credentialId),
            type: "public-key",
            transports: ["internal"],
          },
        ],
      },
    });
    if (!assertion) return false;
    markVerified();
    return true;
  } catch {
    return false;
  }
}
