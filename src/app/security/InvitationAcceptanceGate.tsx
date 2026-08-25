import type { ReactNode } from 'react';
import type { AuthMode } from '../contexts/AuthContext';

export function InvitationAcceptanceGate({ authMode, invitation, children }: { authMode: AuthMode; invitation: ReactNode; children: ReactNode }) {
  return <>{authMode === 'invitation_acceptance' ? invitation : children}</>;
}
