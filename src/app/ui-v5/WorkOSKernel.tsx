import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Bell, Bot, BriefcaseBusiness, Building2, ChevronDown, Clock3, Command,
  FileStack, Home, LogOut, Menu, MessageCircle, PanelRight, Search, Settings,
  Sparkles, SunMoon, Users, X, type LucideIcon,
} from 'lucide-react';
import { useRouter } from '../components/router';
import './work-os-kernel.css';

export type V5Signal = 'neutral' | 'live' | 'healthy' | 'attention' | 'critical' | 'intelligence';

const productDestinations: Array<{ label: string; path: string; icon: LucideIcon }> = [
  { label: 'Home', path: '/org/admin/dashboard', icon: Home },
  { label: 'My Work', path: '/work/tasks', icon: BriefcaseBusiness },
  { label: 'Projects', path: '/work/projects', icon: FileStack },
  { label: 'People', path: '/people/employees', icon: Users },
  { label: 'Communication', path: '/communication/conversations', icon: MessageCircle },
  { label: 'Time', path: '/time/tracking', icon: Clock3 },
  { label: 'Files', path: '/knowledge/files', icon: FileStack },
  { label: 'Finance', path: '/finance/cockpit', icon: BriefcaseBusiness },
  { label: 'Reports', path: '/analytics/reports', icon: FileStack },
  { label: 'AI', path: '/ai/copilots', icon: Sparkles },
];

export function MatteSurface({ children, className = '', signal = 'neutral' }: { children: ReactNode; className?: string; signal?: V5Signal }) {
  return <section className={`v5-surface v5-edge-${signal} ${className}`}>{children}</section>;
}

export function Status({ children, signal = 'neutral' }: { children: ReactNode; signal?: V5Signal }) {
  return <span className={`v5-status v5-status-${signal}`}><i />{children}</span>;
}

export function KernelButton({ children, onClick, variant = 'primary', disabled = false, label }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'quiet' | 'icon'; disabled?: boolean; label?: string }) {
  return <button className={`v5-button v5-button-${variant}`} onClick={onClick} disabled={disabled} aria-label={label}>{children}</button>;
}

export function WorkRow({ title, context, status, progress, onClick }: { title: string; context?: string; status: string; progress?: number; onClick?: () => void }) {
  const signal: V5Signal = status === 'blocked' ? 'critical' : status === 'completed' ? 'healthy' : status === 'in_progress' ? 'live' : 'neutral';
  return <button className="v5-work-row" onClick={onClick}>
    <span className={`v5-work-state v5-work-state-${signal}`} />
    <span className="v5-work-copy"><strong>{title}</strong><small>{context || 'Organization work'}</small></span>
    {typeof progress === 'number' && <span className="v5-progress"><i style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></span>}
    <Status signal={signal}>{status.replace('_', ' ')}</Status>
    <span className="v5-row-arrow">→</span>
  </button>;
}

export function ActivityRow({ title, detail, time }: { title: string; detail?: string | null; time?: string }) {
  return <div className="v5-activity-row"><span className="v5-activity-mark" /><span><strong>{title}</strong>{detail && <small>{detail}</small>}</span>{time && <time>{time}</time>}</div>;
}

export function WorkspaceState({ kind, title, detail, action }: { kind: 'loading' | 'error' | 'empty'; title: string; detail: string; action?: ReactNode }) {
  return <div className={`v5-state v5-state-${kind}`}><span className="v5-state-glyph">{kind === 'loading' ? '···' : kind === 'error' ? '!' : '○'}</span><strong>{title}</strong><p>{detail}</p>{action}</div>;
}

export function AttentionSurface({ children, signal = 'attention' }: { children: ReactNode; signal?: 'attention' | 'critical' }) {
  return <MatteSurface className="v5-attention" signal={signal}>{children}</MatteSurface>;
}

export function IntelligenceSurface({ children, title = 'Work OS intelligence' }: { children: ReactNode; title?: string }) {
  return <MatteSurface className="v5-intelligence" signal="intelligence"><header><Sparkles size={15}/><strong>{title}</strong><Status signal="intelligence">AI</Status></header>{children}</MatteSurface>;
}

interface ShellProps {
  children: ReactNode; user: { name: string; email: string; role: string };
  currentOrg?: { name: string }; organizations: Array<{ id: string; name: string }>;
  onOrgSwitch: (id: string) => void; onLogout: () => void;
}

export function WorkOSShell({ children, user, currentOrg, organizations, onOrgSwitch, onLogout }: ShellProps) {
  const { currentPath, navigate } = useRouter();
  const [commandOpen, setCommandOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [query, setQuery] = useState('');
  const commandInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    document.documentElement.dataset.workosUi = 'v5';
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setCommandOpen(true); }
      if (event.key === 'Escape') { setCommandOpen(false); setContextOpen(false); setMobileOpen(false); }
    };
    window.addEventListener('keydown', key);
    return () => { delete document.documentElement.dataset.workosUi; window.removeEventListener('keydown', key); };
  }, []);
  useEffect(() => { if (commandOpen) window.setTimeout(() => commandInput.current?.focus(), 30); }, [commandOpen]);
  useEffect(() => { if (lightMode) document.documentElement.dataset.workosTheme = 'light'; else delete document.documentElement.dataset.workosTheme; }, [lightMode]);
  const results = useMemo(() => productDestinations.filter(item => item.label.toLowerCase().includes(query.toLowerCase())), [query]);
  const go = (path: string) => { navigate(path); setCommandOpen(false); setMobileOpen(false); };

  return <div className="v5-canvas">
    <div className="v6-environment" aria-hidden="true"><i/><i/><i/></div>
    <header className="v5-system-bar">
      <button className="v5-mobile-trigger" onClick={() => setMobileOpen(v => !v)} aria-label="Open product navigation"><Menu /></button>
      <button className="v5-brand" onClick={() => go('/org/admin/dashboard')}><span className="v5-brand-mark">W</span><span><strong>WORK OS</strong><small>OPERATIONS</small></span><i className="v6-brand-live"/></button>
      <button className="v5-org-switch"><Building2/><span>{currentOrg?.name || 'Organization'}</span><ChevronDown/></button>
      <button className="v5-command-trigger" onClick={() => setCommandOpen(true)}><Search/><span>Find work or go anywhere</span><kbd><Command/> K</kbd></button>
      <div className="v5-system-actions">
        <KernelButton variant="icon" label={lightMode ? 'Use dark appearance' : 'Use light appearance'} onClick={() => setLightMode(v => !v)}><SunMoon/></KernelButton>
        <KernelButton variant="icon" label="Open notifications" onClick={() => setContextOpen(true)}><Bell/><span className="v5-unread-dot"/></KernelButton>
        <button className="v5-profile" onClick={() => setContextOpen(true)}><span>{user.name.slice(0, 1).toUpperCase()}</span><i><strong>{user.name}</strong><small>{user.role}</small></i></button>
      </div>
    </header>
    <nav className={`v5-product-nav ${mobileOpen ? 'is-open' : ''}`} aria-label="Product navigation">
      <div className="v5-nav-products">{productDestinations.map(item => { const Icon = item.icon; const active = currentPath === item.path || (item.label !== 'Home' && currentPath.startsWith(item.path.split('/').slice(0, 2).join('/'))); return <button key={item.label} aria-current={active ? 'page' : undefined} onClick={() => go(item.path)}><Icon/><span>{item.label}</span></button>; })}</div>
      <div className="v5-nav-secondary"><button onClick={() => go('/security/audit-logs')}><FileStack/><span>Audit</span></button><button onClick={() => go('/platform/org-settings')}><Settings/><span>Settings</span></button></div>
    </nav>
    <div className="v5-workspace">{children}</div>
    {contextOpen && <><button className="v5-scrim" aria-label="Close context panel" onClick={() => setContextOpen(false)}/><aside className="v5-context-panel" aria-label="Context panel"><header><div><small>STAY IN CONTEXT</small><h2>Workspace access</h2></div><KernelButton variant="icon" label="Close context panel" onClick={() => setContextOpen(false)}><X/></KernelButton></header><MatteSurface className="v5-context-identity"><Status signal="live">Signed in</Status><h3>{user.name}</h3><p>{user.email}</p><p>{currentOrg?.name}</p></MatteSurface><div className="v5-context-actions"><button onClick={() => go('/communication/conversations')}><MessageCircle/>Open communication<span>→</span></button><button onClick={() => go('/search')}><Search/>Advanced search<span>→</span></button><button onClick={() => go('/platform/org-settings')}><Settings/>Organization settings<span>→</span></button></div>{organizations.length > 1 && <label className="v5-org-select">Organization<select value={organizations.find(o => o.name === currentOrg?.name)?.id} onChange={e => onOrgSwitch(e.target.value)}>{organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>}<button className="v5-logout" onClick={onLogout}><LogOut/>Sign out</button></aside></>}
    {commandOpen && <div className="v5-command-layer" role="dialog" aria-modal="true" aria-label="Global command and search"><button className="v5-command-scrim" onClick={() => setCommandOpen(false)} aria-label="Close command search"/><section className="v5-command"><header><Search/><input ref={commandInput} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search product destinations…"/><kbd>ESC</kbd></header><div className="v5-command-label">AUTHORIZED DESTINATIONS</div><div className="v5-command-results">{results.map((item, index) => { const Icon = item.icon; return <button key={item.path} onClick={() => go(item.path)}><Icon/><span><strong>{item.label}</strong><small>{item.path}</small></span>{index < 3 && <em>Quick access</em>}<b>↵</b></button>; })}{!results.length && <WorkspaceState kind="empty" title="No destination found" detail="Try a product name such as Projects, People, or Time."/>}</div><footer><span>↑↓ Navigate</span><span>↵ Open</span><span>Esc Close</span></footer></section></div>}
  </div>;
}
