import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { InvitationAcceptanceResult, InvitationCallback } from '../../../contexts/authInvitation';

export function InvitationAcceptanceScreen({ user, callback, onAccept }: {
  user: User | null;
  callback: InvitationCallback;
  onAccept: (password: string | null) => Promise<InvitationAcceptanceResult>;
}) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [passwordSet, setPasswordSet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const organization = user?.user_metadata?.invitation_organization_id;
  const validSession = callback.hasInviteProof && Boolean(user);

  const submit = async () => {
    if (submitting) return;
    if (!passwordSet && password.length < 8) return setError('Password must be at least 8 characters.');
    if (!passwordSet && password !== confirmation) return setError('Passwords do not match.');
    setSubmitting(true); setError('');
    try {
      await onAccept(passwordSet ? null : password);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Invitation acceptance failed safely.';
      if (message.startsWith('Your password is set')) setPasswordSet(true);
      setError(message); setSubmitting(false);
    }
  };

  return <main className="min-h-screen bg-slate-50 grid place-items-center p-4"><section className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-lg space-y-5">
    <header><h1 className="text-xl font-semibold">Accept your Work OS invitation</h1><p className="mt-1 text-sm text-slate-600">Set up your invited Organization Admin account.</p></header>
    {!validSession || callback.error ? <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{callback.error ?? 'This invitation link is invalid, expired, or has already been used. Ask an administrator to resend it.'}</div> : <>
      <label className="block text-sm">Email<input aria-label="Email" readOnly value={user?.email ?? ''} className="mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2" /></label>
      <div className="text-sm"><span className="block">Organization</span><div aria-label="Organization" className="mt-1 rounded-lg border bg-slate-50 px-3 py-2">{typeof organization === 'string' ? organization : 'Assigned organization'}</div></div>
      <div className="text-sm"><span className="block">Role</span><div aria-label="Role" className="mt-1 rounded-lg border bg-slate-50 px-3 py-2">Organization Admin</div></div>
      {!passwordSet && <><label className="block text-sm">New Password<input aria-label="New Password" type="password" autoComplete="new-password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
      <label className="block text-sm">Confirm Password<input aria-label="Confirm Password" type="password" autoComplete="new-password" value={confirmation} onChange={(e) => { setConfirmation(e.target.value); setError(''); }} className="mt-1 w-full rounded-lg border px-3 py-2" /></label></>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <button type="button" disabled={submitting} onClick={() => void submit()} className="w-full rounded-lg bg-primary px-4 py-2.5 text-primary-foreground disabled:opacity-50">{submitting ? 'Accepting…' : passwordSet ? 'Retry acceptance' : 'Accept invitation'}</button>
    </>}
  </section></main>;
}
