import { useEffect, useMemo, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import {
  Bell, BriefcaseBusiness, Building2, ChevronDown, Clock3, Command,
  FileStack, Home, LogOut, Menu, MessageCircle, Search, Settings,
  Sparkles, SunMoon, Users, X, Activity, Timer, PanelRight, type LucideIcon,
} from 'lucide-react';
import { useRouter } from '../components/router';
import type { Role } from '../nav/navManifest';
import './work-os-foundation.css';

export type V8Signal = 'neutral' | 'live' | 'healthy' | 'attention' | 'critical' | 'intelligence';

const productDestinations: Array<{ label: string; path: string; icon: LucideIcon; roles: Role[] }> = [
  { label: 'Home', path: '/org/admin/dashboard', icon: Home, roles: ['org_admin'] },
  { label: 'My Work', path: '/work/my-work', icon: BriefcaseBusiness, roles: ['employee', 'org_admin'] },
  { label: 'Projects', path: '/work/projects', icon: FileStack, roles: ['employee', 'org_admin'] },
  { label: 'People', path: '/people/employees', icon: Users, roles: ['org_admin'] },
  { label: 'Communication', path: '/communication/conversations', icon: MessageCircle, roles: ['org_admin'] },
  { label: 'Time', path: '/time/tracking', icon: Clock3, roles: ['org_admin'] },
  { label: 'Files', path: '/knowledge/files', icon: FileStack, roles: ['org_admin'] },
  { label: 'Finance', path: '/finance/cockpit', icon: BriefcaseBusiness, roles: ['org_admin'] },
  { label: 'Reports', path: '/analytics/reports', icon: FileStack, roles: ['org_admin'] },
  { label: 'AI', path: '/ai/copilots', icon: Sparkles, roles: ['employee', 'org_admin'] },
];

const routeMeta: Record<string, { eyebrow: string; title: string }> = {
  '/org/admin/dashboard': { eyebrow: 'OPERATING PICTURE', title: 'Command Center' }, '/work/my-work': { eyebrow: 'PERSONAL EXECUTION', title: 'My Work' },
  '/work/projects': { eyebrow: 'WORK SYSTEM', title: 'Projects' }, '/work/tasks': { eyebrow: 'WORK SYSTEM', title: 'Tasks' }, '/work/milestones': { eyebrow: 'WORK SYSTEM', title: 'Milestones' },
  '/work/assignments': { eyebrow: 'WORK SYSTEM', title: 'Assignments' }, '/work/reports': { eyebrow: 'WORK SYSTEM', title: 'Work Reports' }, '/work/workspace': { eyebrow: 'PERSISTENT CONTEXT', title: 'Project Workspace' },
  '/people/employees': { eyebrow: 'ORGANIZATION', title: 'People' }, '/people/members': { eyebrow: 'ACCESS & IDENTITY', title: 'Memberships' }, '/people/departments': { eyebrow: 'ORGANIZATION', title: 'Departments' },
  '/time/tracking': { eyebrow: 'TIME SYSTEM', title: 'Time Entries' }, '/time/sessions': { eyebrow: 'TIME SYSTEM', title: 'Work Sessions' }, '/time/corrections': { eyebrow: 'TIME SYSTEM', title: 'Review & Corrections' },
  '/communication/conversations': { eyebrow: 'COLLABORATION', title: 'Communication' }, '/communication/communicate': { eyebrow: 'COLLABORATION', title: 'Communication' },
  '/knowledge/files': { eyebrow: 'CONNECTED EVIDENCE', title: 'Files' }, '/finance/cockpit': { eyebrow: 'FINANCIAL CONTEXT', title: 'Finance' }, '/analytics/reports': { eyebrow: 'OPERATIONAL TRUTH', title: 'Reports' },
  '/security/audit-logs': { eyebrow: 'TRUST & CONTROL', title: 'Audit' }, '/automation/rules': { eyebrow: 'CONTROL PLANE', title: 'Automation' }, '/ai/agents': { eyebrow: 'INTELLIGENCE', title: 'Agent Center' },
  '/ai/copilots': { eyebrow: 'CONTEXTUAL INTELLIGENCE', title: 'AI Copilots' }, '/search': { eyebrow: 'GLOBAL DISCOVERY', title: 'Search' }, '/platform/org-settings': { eyebrow: 'ORGANIZATION CONTROL', title: 'Settings' },
  '/employee/my-day': { eyebrow: 'TIME SYSTEM', title: 'Work Session' }, '/employee/time-logs': { eyebrow: 'TIME SYSTEM', title: 'Time Entries' }, '/employee/profile': { eyebrow: 'PERSON CONTEXT', title: 'My Profile' },
};
const sectionRoutes: Record<string, Array<[string, string]>> = {
  work: [['My Work','/work/my-work'],['Projects','/work/projects'],['Tasks','/work/tasks'],['Milestones','/work/milestones'],['Assignments','/work/assignments'],['Workspace','/work/workspace'],['Reports','/work/reports']],
  people: [['Directory','/people/employees'],['Memberships','/people/members'],['Departments','/people/departments']], time: [['Entries','/time/tracking'],['Sessions','/time/sessions'],['Corrections','/time/corrections']],
};

export function MatteSurface({ children, className = '', signal = 'neutral' }: { children: ReactNode; className?: string; signal?: V8Signal }) {
  return <section className={`v8-surface v8-edge-${signal} ${className}`}>{children}</section>;
}

export function FocusSurface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`v8-surface v8-focus-surface ${className}`}>{children}</section>;
}

export function SupportSurface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`v8-surface v8-support-surface ${className}`}>{children}</section>;
}

export function SplitInspector({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <aside className="v8-split-inspector" aria-label={`${title} inspector`}><header><div><small>INSPECT IN CONTEXT</small><h2>{title}</h2></div><KernelButton variant="icon" label="Close inspector" onClick={onClose}><X /></KernelButton></header>{children}</aside>;
}

export function FoundationInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`v8-input ${props.className ?? ''}`} />;
}

export function Status({ children, signal = 'neutral' }: { children: ReactNode; signal?: V8Signal }) {
  return <span className={`v8-status v8-status-${signal}`}><i />{children}</span>;
}

export function KernelButton({ children, onClick, variant = 'primary', disabled = false, label }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'quiet' | 'icon'; disabled?: boolean; label?: string }) {
  return <button className={`v8-button v8-button-${variant}`} onClick={onClick} disabled={disabled} aria-label={label}>{children}</button>;
}

export function WorkRow({ title, context, status, progress, onClick }: { title: string; context?: string; status: string; progress?: number; onClick?: () => void }) {
  const signal: V8Signal = status === 'blocked' ? 'critical' : status === 'completed' ? 'healthy' : status === 'in_progress' ? 'live' : 'neutral';
  return <button className="v8-work-row" onClick={onClick}>
    <span className={`v8-work-state v8-work-state-${signal}`} />
    <span className="v8-work-copy"><strong>{title}</strong><small>{context || 'Organization work'}</small></span>
    {typeof progress === 'number' && <span className="v8-progress"><i style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></span>}
    <Status signal={signal}>{status.replace('_', ' ')}</Status>
    <span className="v8-row-arrow">→</span>
  </button>;
}

export function ActivityRow({ title, detail, time }: { title: string; detail?: string | null; time?: string }) {
  return <div className="v8-activity-row"><span className="v8-activity-mark" /><span><strong>{title}</strong>{detail && <small>{detail}</small>}</span>{time && <time>{time}</time>}</div>;
}

export function WorkspaceState({ kind, title, detail, action }: { kind: 'loading' | 'error' | 'empty'; title: string; detail: string; action?: ReactNode }) {
  return <div className={`v8-state v8-state-${kind}`}><span className="v8-state-glyph">{kind === 'loading' ? '···' : kind === 'error' ? '!' : '○'}</span><strong>{title}</strong><p>{detail}</p>{action}</div>;
}

export function AttentionSurface({ children, signal = 'attention' }: { children: ReactNode; signal?: 'attention' | 'critical' }) {
  return <MatteSurface className="v8-attention" signal={signal}>{children}</MatteSurface>;
}

export function IntelligenceSurface({ children, title = 'Work OS intelligence' }: { children: ReactNode; title?: string }) {
  return <MatteSurface className="v8-intelligence" signal="intelligence"><header><Sparkles size={15}/><strong>{title}</strong><Status signal="intelligence">AI</Status></header>{children}</MatteSurface>;
}

interface ShellProps {
  role: Extract<Role, 'employee' | 'org_admin'>;
  children: ReactNode; user: { name: string; email: string; role: string };
  currentOrg?: { name: string }; organizations: Array<{ id: string; name: string }>;
  onOrgSwitch: (id: string) => void; onLogout: () => void;
}

export function WorkOSFoundation({ children, user, role, currentOrg, organizations, onOrgSwitch, onLogout }: ShellProps) {
  const { currentPath, navigate } = useRouter();
  const [commandOpen, setCommandOpen] = useState(false);
  const [contextMode, setContextMode] = useState<'profile' | 'organization' | 'notifications' | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lightMode, setLightMode] = useState(() => window.localStorage.getItem('workos-theme') === 'light');
  const [query, setQuery] = useState('');
  const commandInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    document.documentElement.dataset.workosUi = 'v8';
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setCommandOpen(true); }
      if (event.key === 'Escape') { setCommandOpen(false); setContextMode(null); setMobileOpen(false); }
    };
    window.addEventListener('keydown', key);
    return () => { delete document.documentElement.dataset.workosUi; window.removeEventListener('keydown', key); };
  }, []);
  useEffect(() => { if (commandOpen) window.setTimeout(() => commandInput.current?.focus(), 30); }, [commandOpen]);
  useEffect(() => { if (lightMode) document.documentElement.dataset.workosTheme = 'light'; else delete document.documentElement.dataset.workosTheme; }, [lightMode]);
  const destinations = useMemo(() => productDestinations.filter(item => item.roles.includes(role)), [role]);
  const results = useMemo(() => destinations.filter(item => item.label.toLowerCase().includes(query.toLowerCase())), [destinations, query]);
  const meta = routeMeta[currentPath] ?? { eyebrow: 'WORK OS', title: 'Workspace' };
  const section = currentPath.startsWith('/work/') ? 'work' : currentPath.startsWith('/people/') ? 'people' : currentPath.startsWith('/time/') ? 'time' : '';
  const localRoutes = (sectionRoutes[section] ?? []).filter(([, path]) => role === 'org_admin' || !path.includes('workspace'));
  const go = (path: string) => { navigate(path); setCommandOpen(false); setMobileOpen(false); };
  const isProductActive = (label: string, path: string) => {
    if (label === 'My Work') return currentPath === '/work/my-work';
    if (label === 'Projects') return currentPath.startsWith('/work/') && currentPath !== '/work/my-work';
    if (label === 'Home') return currentPath === path;
    const section = path.split('/').slice(0, 2).join('/');
    return currentPath === path || currentPath.startsWith(`${section}/`);
  };
  useEffect(() => { window.localStorage.setItem('workos-theme', lightMode ? 'light' : 'dark'); }, [lightMode]);

  return <div className="v8-canvas">
    <div className="v8-environment" aria-hidden="true"><i/><i/><i/></div>
    <header className="v8-system-bar">
      <button className="v8-mobile-trigger" onClick={() => setMobileOpen(v => !v)} aria-label="Open product navigation"><Menu /></button>
      <button className="v8-brand" onClick={() => go(role === 'org_admin' ? '/org/admin/dashboard' : '/work/my-work')}><span className="v8-brand-mark">W</span><span><strong>WORK OS</strong><small>OPERATIONS</small></span><i className="v8-brand-live"/></button>
      <button className="v8-org-switch" onClick={() => setContextMode('organization')} aria-label="Switch organization"><Building2/><span>{currentOrg?.name || 'Organization'}</span><ChevronDown/></button>
      <button className="v8-command-trigger" onClick={() => setCommandOpen(true)}><Search/><span>Find work or go anywhere</span><kbd><Command/> K</kbd></button>
      <div className="v8-system-actions">
        <KernelButton variant="icon" label={lightMode ? 'Use dark appearance' : 'Use light appearance'} onClick={() => setLightMode(v => !v)}><SunMoon/></KernelButton>
        <KernelButton variant="icon" label="Open notifications" onClick={() => setContextMode('notifications')}><Bell/><span className="v8-unread-dot"/></KernelButton>
        <button className="v8-profile" onClick={() => setContextMode('profile')} aria-label={`Open profile for ${user.name}`}><span>{user.name.slice(0, 1).toUpperCase()}</span><i><strong>{user.name}</strong><small>{user.role}</small></i></button>
      </div>
    </header>
    <nav className={`v8-product-nav ${mobileOpen ? 'is-open' : ''}`} aria-label="Product navigation">
      <div className="v8-nav-products">{destinations.map(item => { const Icon = item.icon; const active = isProductActive(item.label, item.path); return <button key={item.label} aria-current={active ? 'page' : undefined} onClick={() => go(item.path)}><Icon/><span>{item.label}</span></button>; })}</div>
      {role === 'org_admin' && <div className="v8-nav-secondary"><button onClick={() => go('/security/audit-logs')}><FileStack/><span>Audit</span></button><button onClick={() => go('/platform/org-settings')}><Settings/><span>Settings</span></button></div>}
    </nav>
    <div className={`v8-workspace ${currentPath === '/org/admin/dashboard' ? 'is-v9-home' : ''}`}><div className="v8-workspace-frame"><header className="v8-route-bar"><div><small>{meta.eyebrow}</small><h1>{meta.title}</h1></div>{localRoutes.length > 0 && <nav aria-label={`${meta.title} workspace views`}>{localRoutes.map(([label,path]) => <button key={path} aria-current={currentPath === path ? 'page' : undefined} onClick={() => go(path)}>{label}</button>)}</nav>}<span><Activity/> LIVE CONTEXT</span></header><main className="v8-route-content">{children}</main></div><aside className="v8-utility-rail" aria-label="Context tools"><button onClick={() => setCommandOpen(true)} title="Command"><Search/></button><button onClick={() => go(role === 'org_admin' ? '/time/tracking' : '/employee/my-day')} title="Time"><Timer/></button><button onClick={() => go(role === 'org_admin' ? '/communication/conversations' : '/communication/communicate')} title="Communication"><MessageCircle/></button><button onClick={() => go('/ai/copilots')} title="AI"><Sparkles/></button><button onClick={() => setContextMode('profile')} title="Context"><PanelRight/></button></aside></div>
    {contextMode && <><button className="v8-scrim" aria-label="Close context panel" onClick={() => setContextMode(null)}/><aside className="v8-context-panel" aria-label="Context panel"><header><div><small>STAY IN CONTEXT</small><h2>{contextMode === 'notifications' ? 'Notification center' : contextMode === 'organization' ? 'Organization context' : 'Workspace access'}</h2></div><KernelButton variant="icon" label="Close context panel" onClick={() => setContextMode(null)}><X/></KernelButton></header>{contextMode === 'notifications' ? <MatteSurface className="v8-context-identity"><Status signal="attention">Live surface</Status><h3>Operational signals</h3><p>Authorized notification detail remains in the Command Center’s recent signals feed.</p><button className="v8-context-link" onClick={() => { go(role === 'org_admin' ? '/org/admin/dashboard' : '/work/my-work'); setContextMode(null); }}>Open recent signals <span>→</span></button></MatteSurface> : <><MatteSurface className="v8-context-identity"><Status signal="live">Signed in</Status><h3>{user.name}</h3><p>{user.email}</p><p>{currentOrg?.name}</p></MatteSurface><div className="v8-context-actions"><button onClick={() => go(role === 'org_admin' ? '/communication/conversations' : '/communication/communicate')}><MessageCircle/>Open communication<span>→</span></button><button onClick={() => go('/search')}><Search/>Advanced search<span>→</span></button>{role === 'org_admin' && <button onClick={() => go('/platform/org-settings')}><Settings/>Organization settings<span>→</span></button>}</div>{organizations.length > 1 ? <label className="v8-org-select">Organization<select value={organizations.find(o => o.name === currentOrg?.name)?.id} onChange={e => onOrgSwitch(e.target.value)}>{organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label> : <p className="v8-single-org">This identity has one authorized organization.</p>}<button role="menuitem" className="v8-logout" onClick={onLogout}><LogOut/>Log out</button></>}</aside></>}
    {commandOpen && <div className="v8-command-layer" role="dialog" aria-modal="true" aria-label="Global command and search"><button className="v8-command-scrim" onClick={() => setCommandOpen(false)} aria-label="Close command search"/><section className="v8-command"><header><Search/><input ref={commandInput} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search product destinations…"/><kbd>ESC</kbd></header><div className="v8-command-label">AUTHORIZED DESTINATIONS</div><div className="v8-command-results">{results.map((item, index) => { const Icon = item.icon; return <button key={item.path} onClick={() => go(item.path)}><Icon/><span><strong>{item.label}</strong><small>{item.path}</small></span>{index < 3 && <em>Quick access</em>}<b>↵</b></button>; })}{!results.length && <WorkspaceState kind="empty" title="No destination found" detail="Try a product name such as Projects, People, or Time."/>}</div><footer><span>↑↓ Navigate</span><span>↵ Open</span><span>Esc Close</span></footer></section></div>}
  </div>;
}
