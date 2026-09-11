import { useState, type CSSProperties } from 'react';
import {
  Activity, ArrowRight, CheckCircle2, CircleAlert, Clock3, Command, Layers3,
  MessageSquare, Play, Search, Sparkles, Timer, X,
} from 'lucide-react';
import { useWork } from '../work/useWork';
import type { WorkTask } from '../work/types';
import { useV2Module } from '../v2/useV2Module';
import './v9-command-center.css';

const navigate = (path: string) => window.dispatchEvent(new CustomEvent('workos-navigate', { detail: { path } }));

function stateLabel(status: WorkTask['status']) {
  return status.replace('_', ' ');
}

function TaskLine({ task, selected, onSelect }: { task: WorkTask; selected?: boolean; onSelect: () => void }) {
  return <button className={`v9-task-line is-${task.status}${selected ? ' is-selected' : ''}`} onClick={onSelect}>
    <span className="v9-task-state" aria-hidden="true" />
    <span className="v9-task-copy"><strong>{task.title}</strong><small>{task.projectName}</small></span>
    <span className="v9-task-progress" aria-label={`${task.progress}% complete`}><i style={{ width: `${task.progress}%` }} /></span>
    <span className="v9-task-status">{stateLabel(task.status)}</span>
    <ArrowRight aria-hidden="true" />
  </button>;
}

export function V9CommandCenter() {
  const work = useWork();
  const sessions = useV2Module('sessions');
  const notifications = useV2Module('notifications');
  const [selected, setSelected] = useState<WorkTask | null>(null);
  const records = notifications.records as { id: string; title: string; body: string | null; readAt: string | null; createdAt?: string }[];
  const activeSessions = (sessions.records as { endedAt: string | null }[]).filter(session => !session.endedAt).length;
  const blocked = work.tasks.filter(task => task.status === 'blocked');
  const moving = work.tasks.filter(task => task.status === 'in_progress');
  const unread = records.filter(record => !record.readAt);
  const queue = [...blocked, ...moving, ...work.tasks.filter(task => task.status === 'todo')];
  const primary = queue[0] ?? null;

  if (work.loading) return <main className="v9-home"><div className="v9-loading"><span/><p>Assembling your authorized operating picture</p><small>WORK OS / COMMAND CENTER</small></div></main>;

  if (work.error) return <main className="v9-home"><section className="v9-recovery"><CircleAlert/><p>CONNECTION INTERRUPTED</p><h1>Your operating context is protected.</h1><span>No work state has been inferred. Reconnect the authorized organization repository to continue.</span><button onClick={() => void work.reload()}>Retry connection <ArrowRight/></button></section></main>;

  return <main className="v9-home">
    <header className="v9-horizon">
      <div><p>COMMAND CENTER <i/> AUTHORIZED LIVE STATE</p><h1>Good work starts with<br/><em>a clear field of view.</em></h1></div>
      <div className="v9-horizon-status"><span><Activity/> Repository connected</span><small>{work.projects.length} active project{work.projects.length === 1 ? '' : 's'} · {work.tasks.length} authorized tasks</small></div>
    </header>

    <section className="v9-instrument-panel" aria-label="Operating picture">
      <aside className="v9-action-spine" aria-label="Quick actions">
        <span className="v9-spine-label">ACT</span>
        <button aria-label="Resume work" onClick={() => navigate('/work/my-work')}><Play/><span>Resume work</span></button>
        <button aria-label="Open time" onClick={() => navigate('/time/tracking')}><Timer/><span>Open time</span></button>
        <button aria-label="Open communication" onClick={() => navigate('/communication/conversations')}><MessageSquare/><span>Message</span></button>
        <button aria-label="Open command search" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}><Search/><span>Command</span></button>
        <kbd><Command/>K</kbd>
      </aside>

      <div className="v9-field">
        <div className="v9-field-heading"><div><p>NOW / NEXT</p><h2>{primary ? 'Your execution vector' : 'Your field is clear'}</h2></div><span>{queue.length} OPEN</span></div>
        {primary ? <button className={`v9-primary-work is-${primary.status}`} onClick={() => setSelected(primary)}>
          <span className="v9-orbit" style={{ '--v9-progress': `${primary.progress}%` } as CSSProperties} aria-hidden="true"><i/><i/><b>{primary.progress}<small>%</small></b></span>
          <span className="v9-primary-copy"><small>{primary.status === 'blocked' ? 'INTERVENTION REQUIRED' : 'BEST NEXT MOVE'}</small><strong>{primary.title}</strong><em>{primary.projectName}</em><p>{primary.description || 'No additional task detail has been recorded.'}</p><span>Inspect without leaving Home <ArrowRight/></span></span>
        </button> : <div className="v9-clear-state"><CheckCircle2/><strong>No open work requires action.</strong><p>New authorized work will enter this field when it is assigned.</p></div>}
        <div className="v9-telemetry" aria-label="Current operating state">
          <span className={moving.length ? 'is-live' : ''}><small>MOVING</small><strong>{moving.length}</strong><em>{moving.length ? 'tasks in progress' : 'No work in progress'}</em></span>
          <span className={blocked.length ? 'is-alert' : 'is-good'}><small>ATTENTION</small><strong>{blocked.length}</strong><em>{blocked.length ? 'blocked tasks' : 'Queue clear'}</em></span>
          <span><small>SESSION</small><strong>{activeSessions}</strong><em>{activeSessions ? 'active now' : 'No time running'}</em></span>
        </div>
      </div>

      <aside className="v9-signal-stack">
        <section className="v9-attention-stream"><header><span><CircleAlert/> ATTENTION</span><b>{blocked.length}</b></header>{blocked.length ? blocked.slice(0, 3).map(task => <button key={task.id} onClick={() => setSelected(task)}><i/><span><strong>{task.title}</strong><small>{task.projectName}</small></span><ArrowRight/></button>) : <div className="v9-quiet"><CheckCircle2/><span><strong>No blockers</strong><small>Nothing requires intervention.</small></span></div>}</section>
        <section className="v9-signal-stream"><header><span><Layers3/> SIGNALS</span><b>{unread.length} unread</b></header>{records.length ? records.slice(0, 4).map(record => <article key={record.id}><i/><span><strong>{record.title}</strong>{record.body && <small>{record.body}</small>}</span></article>) : <div className="v9-quiet"><Activity/><span><strong>No recent signals</strong><small>Authorized changes will surface here.</small></span></div>}</section>
        <section className="v9-intelligence-note"><Sparkles/><div><small>INTELLIGENCE</small><strong>Briefing unavailable</strong><p>Connect an approved provider before Work OS can analyze this operating picture.</p></div></section>
      </aside>
    </section>

    <section className="v9-workstream" aria-label="Current workstream">
      <header><div><p>CURRENT WORKSTREAM</p><h2>Work already in motion</h2></div><button onClick={() => navigate('/work/my-work')}>Open My Work <ArrowRight/></button></header>
      <div>{queue.length ? queue.slice(0, 6).map(task => <TaskLine key={task.id} task={task} selected={selected?.id === task.id} onSelect={() => setSelected(task)}/>) : <p className="v9-empty-line">There is no queued work in the authorized repository.</p>}</div>
    </section>

    {selected && <><button className="v9-inspector-scrim" aria-label="Close work inspector" onClick={() => setSelected(null)}/><aside className="v9-inspector" aria-label="Work inspector">
      <header><div><p>INSPECT IN CONTEXT</p><h2>{selected.title}</h2></div><button aria-label="Close inspector" onClick={() => setSelected(null)}><X/></button></header>
      <div className="v9-inspector-project"><small>PROJECT</small><strong>{selected.projectName}</strong><span className={`is-${selected.status}`}>{stateLabel(selected.status)}</span></div>
      <section><small>RECORDED DETAIL</small><p>{selected.description || 'No additional task detail has been recorded.'}</p></section>
      <section><small>PROGRESS</small><div className="v9-inspector-meter"><i style={{ width: `${selected.progress}%` }}/></div><strong>{selected.progress}% complete</strong></section>
      <div className="v9-inspector-actions"><button onClick={() => navigate('/work/my-work')}><Play/>Continue in My Work <ArrowRight/></button><button onClick={() => navigate('/communication/conversations')}><MessageSquare/>Open communication <ArrowRight/></button><button onClick={() => navigate('/time/tracking')}><Clock3/>Open time context <ArrowRight/></button></div>
      <footer>Repository-backed task · organization scope preserved</footer>
    </aside></>}
  </main>;
}
