import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';

const State = ({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) => (
  <main className="min-h-screen grid place-items-center bg-slate-50 p-6">
    <section className="max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-semibold">{title}</h1><p className="mt-2 text-sm text-slate-600">{detail}</p>
      {action}
    </section>
  </main>
);

export const NoOrganizationAccess = ({ onSignOut }: { onSignOut: () => Promise<void> }) => <State
  title="No organization access"
  detail="Your account has no active organization membership. Contact an administrator."
  action={<button type="button" className="mt-6 font-medium text-slate-700 underline underline-offset-4 hover:text-slate-950" onClick={() => void onSignOut()}>Sign out</button>}
/>;

export function ProtectedShell({ login, children }: { login: ReactNode; children: ReactNode }) {
  const { initializing, user, signOut } = useAuth();
  const { loading, switching, memberships, activeMembership, error } = useOrganization();
  if (initializing) return <State title="Loading" detail="Restoring your secure session…" />;
  if (!user) return <>{login}</>;
  if (loading || switching) return <State title="Loading workspace" detail="Validating organization membership…" />;
  if (error) return <State title="Access unavailable" detail={error} />;
  if (memberships.length === 0) return <NoOrganizationAccess onSignOut={signOut} />;
  if (!activeMembership) return <State title="Access unavailable" detail="An active organization membership could not be validated." />;
  return <>{children}</>;
}
