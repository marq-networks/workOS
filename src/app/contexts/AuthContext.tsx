/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { authModeForEvent, replaceRecoveryPassword, type AuthMode, type PasswordRecoveryResult } from './authRecovery';
import { requestPasswordRecovery, safeSignInError } from './authOperations';
import { acceptAuthenticatedInvitation, inspectInvitationCallback, type InvitationAcceptanceResult, type InvitationCallback } from './authInvitation';

export type { AuthMode } from './authRecovery';

interface AuthContextValue {
  initializing: boolean;
  authMode: AuthMode;
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<PasswordRecoveryResult>;
  invitationCallback: InvitationCallback;
  acceptInvitation: (newPassword: string | null) => Promise<InvitationAcceptanceResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const invitationCallback = useMemo(() => inspectInvitationCallback(window.location), []);
  const [initializing, setInitializing] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const initialMode: AuthMode = invitationCallback.requested ? 'invitation_acceptance' : 'normal';
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const authModeRef = useRef<AuthMode>(initialMode);

  useEffect(() => {
    let mounted = true;
    let authEventReceived = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted && !authEventReceived) {
        setSession(data.session);
        setInitializing(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, nextSession) => {
      if (mounted) {
        authEventReceived = true;
        setSession(nextSession);
        const nextMode = authModeForEvent(authModeRef.current, event);
        authModeRef.current = nextMode;
        setAuthMode(nextMode);
        setInitializing(false);
      }
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    initializing,
    authMode,
    session,
    user: session?.user ?? null,
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw safeSignInError(error);
    },
    requestPasswordReset: async (email) => requestPasswordRecovery(
      supabase.auth,
      email,
      `${window.location.origin}/reset-password`,
    ),
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error('Unable to sign out. Please try again.');
    },
    updatePassword: async (newPassword) => {
      const result = await replaceRecoveryPassword(supabase.auth, authModeRef.current, session, newPassword);
      authModeRef.current = 'normal';
      setAuthMode('normal');
      setSession(null);
      return result;
    },
    invitationCallback,
    acceptInvitation: async (newPassword) => {
      const result = await acceptAuthenticatedInvitation(supabase.auth, supabase.functions, session, newPassword);
      authModeRef.current = 'normal';
      setAuthMode('normal');
      window.history.replaceState({}, '', '/');
      return result;
    },
  }), [authMode, initializing, invitationCallback, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
