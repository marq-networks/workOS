import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { InvitationAcceptanceGate } from './InvitationAcceptanceGate';
import { InvitationAcceptanceScreen } from '../components/screens/auth/InvitationAcceptanceScreen';

describe('InvitationAcceptanceGate', () => {
  it('renders invitation acceptance before normal login/application content', () => {
    const screen = <InvitationAcceptanceScreen user={{ email: 'invitee@example.com', user_metadata: { invitation_organization_id: 'assigned-org' } } as never} callback={{ requested: true, hasInviteProof: true, error: null }} onAccept={vi.fn()} />;
    const markup = renderToStaticMarkup(<InvitationAcceptanceGate authMode="invitation_acceptance" invitation={screen}><p>Sign in to Work OS</p></InvitationAcceptanceGate>);
    expect(markup).toContain('Accept your Work OS invitation');
    expect(markup).not.toContain('Sign in to Work OS');
    expect(markup).toContain('value="invitee@example.com"');
    expect(markup).toContain('readonly');
    expect(markup).toContain('assigned-org');
    expect(markup).toContain('Organization Admin');
    expect(markup).not.toContain('Platform Admin');
    expect(markup).not.toContain('Employee');
    expect(markup).not.toContain('&lt;select');
  });

  it('fails safely when an invitation has no valid provider proof/session', () => {
    const screen = <InvitationAcceptanceScreen user={null} callback={{ requested: true, hasInviteProof: false, error: null }} onAccept={vi.fn()} />;
    const markup = renderToStaticMarkup(screen);
    expect(markup).toContain('invalid, expired, or has already been used');
    expect(markup).not.toContain('Accept invitation</button>');
  });
});
