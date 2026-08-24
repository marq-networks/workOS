import { useState } from 'react';
import { ArrowRight, Building2, Eye, EyeOff, Lock, Mail } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRequestPasswordReset: (email: string) => Promise<void>;
}

export function LoginScreen({ onLogin, onRequestPasswordReset }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  const handleLogin = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await onLogin(email, password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Sign in failed.');
      setIsSubmitting(false);
    }
  };

  const handleRecovery = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await onRequestPasswordReset(email);
      setRecoverySent(true);
    } catch (recoveryError) {
      setError(recoveryError instanceof Error ? recoveryError.message : 'Unable to request a recovery link right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRecovery = () => {
    setRecoveryOpen((open) => !open);
    setRecoverySent(false);
    setError('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <section className="w-full max-w-md rounded-2xl border border-border bg-white shadow-lg overflow-hidden" aria-labelledby="login-title">
        <header className="border-b border-border bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Building2 className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
          </div>
          <h1 id="login-title" className="text-2xl text-foreground">Sign in to Work OS</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your access is determined by your organization membership after sign-in.</p>
        </header>

        <div className="space-y-5 px-8 py-6">
          {recoveryOpen && (
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900" role="status">
              {recoverySent
                ? 'If an account exists for this email, a password recovery link has been sent.'
                : 'Enter your email and we’ll send a recovery link. For privacy, the result does not reveal whether an account exists.'}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-sm text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input id="login-email" name="email" type="email" autoComplete="email" value={email}
                onChange={(event) => { setEmail(event.target.value); setError(''); }}
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter email" />
            </div>
          </div>

          {!recoveryOpen && (
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-sm text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password}
                  onChange={(event) => { setPassword(event.target.value); setError(''); }}
                  onKeyDown={(event) => event.key === 'Enter' && void handleLogin()}
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter password" />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{error}</p>}

          <button type="button" onClick={() => void (recoveryOpen ? handleRecovery() : handleLogin())}
            disabled={isSubmitting || !email || (!recoveryOpen && !password) || recoverySent}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting ? (recoveryOpen ? 'Requesting link...' : 'Signing in...') : (recoveryOpen ? 'Send recovery link' : 'Sign in')}
            {!isSubmitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button type="button" onClick={toggleRecovery} className="w-full text-sm text-primary hover:underline">
            {recoveryOpen ? 'Return to sign in' : 'Forgot password?'}
          </button>
        </div>
      </section>
    </main>
  );
}
