import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  isEnrolled,
  needsVerification,
  verifyBiometric,
  isPlatformAuthAvailable,
  clearVerified,
} from "@/lib/biometric";
import { BrandLogo } from "@/components/brand-logo";
import { Fingerprint, Loader2, LogOut } from "lucide-react";

export function BiometricGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const [locked, setLocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Decide whether the lock screen needs to show
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (loading) return;
      if (!user) {
        setLocked(false);
        setChecking(false);
        return;
      }
      const supported = await isPlatformAuthAvailable();
      if (cancelled) return;
      const enrolled = supported && isEnrolled(user.id);
      const mustVerify = enrolled && needsVerification();
      setLocked(!!mustVerify);
      setChecking(false);
      // Auto-prompt once when locked
      if (mustVerify) attempt(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loading]);

  async function attempt(silentOnFail = false) {
    if (!user) return;
    setBusy(true);
    setError(null);
    const ok = await verifyBiometric(user.id);
    setBusy(false);
    if (ok) {
      setLocked(false);
    } else if (!silentOnFail) {
      setError("Biometric check failed. Try again.");
    }
  }

  async function handleSignOut() {
    clearVerified();
    await signOut();
    setLocked(false);
  }

  if (checking || (loading && user)) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (locked) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center px-6">
        <BrandLogo size={80} className="drop-shadow-[0_0_30px_rgba(212,175,55,0.35)]" />
        <p className="text-xs uppercase tracking-[0.3em] text-primary mt-6">Secure unlock</p>
        <h1 className="font-display text-2xl sm:text-3xl mt-2 text-center">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
          Use Face ID, fingerprint or device passcode to continue.
        </p>

        <button
          onClick={() => attempt(false)}
          disabled={busy}
          className="mt-8 inline-flex items-center gap-2 bg-gold-gradient text-primary-foreground font-medium px-7 py-3.5 rounded-full shadow-gold-glow disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-5 w-5" />}
          Unlock
        </button>

        {error && <p className="text-xs text-destructive mt-4">{error}</p>}

        <button
          onClick={handleSignOut}
          className="mt-10 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign in as a different user
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
