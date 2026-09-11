import { useMemo, useState } from 'react';
import {
  ArrowRight, Check, CheckCircle2, Circle, CircleAlert, Clock3, Layers3,
  MessageSquare, Pause, Play, RefreshCw, Route, Timer, X,
} from 'lucide-react';
import { useWork } from '../work/useWork';
import { statusChangePatch } from '../work/taskLifecycle';
import type { WorkTask, WorkTaskStatus } from '../work/types';
import type { Subtask } from '../v2/types';
import { useV2Module } from '../v2/useV2Module';
import './v9-my-work.css';

type Lens = 'active' | 'queued' | 'blocked' | 'completed';
const lenses: Array<{ id: Lens; label: string }> = [
  { id: 'active', label: 'In motion' }, { id: 'queued', label: 'Up next' },
  { id: 'blocked', label: 'Needs attention' }, { id: 'completed', label: 'Delivered' },
];
const navigate = (path: string) => window.dispatchEvent(new CustomEvent('workos-navigate', { detail: { path } }));
const label = (status: WorkTaskStatus) => status.replace('_', ' ');
const complete = (chunk: Subtask) => chunk.status === 'completed' || chunk.progress >= 100;

function tasksFor(tasks: WorkTask[], lens: Lens) {
  if (lens === 'active') return tasks.filter(task => task.status === 'in_progress');
  if (lens === 'queued') return tasks.filter(task => task.status === 'todo');
  if (lens === 'blocked') return tasks.filter(task => task.status === 'blocked');
  return tasks.filter(task => task.status === 'completed');
}

export function V9MyWork() {
  const work = useWork();
  const chunkState = useV2Module('subtasks');
  const [lens, setLens] = useState<Lens>('active');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const selected = work.tasks.find(task => task.id === selectedId) ?? null;
  const chunks = chunkState.records as Subtask[];
  const visible = useMemo(() => tasksFor(work.tasks, lens), [work.tasks, lens]);
  const selectedChunks = selected ? chunks.filter(chunk => chunk.taskId === selected.id) : [];
  const completedChunks = selectedChunks.filter(complete).length;

  async function transition(task: WorkTask, status: WorkTaskStatus) {
    setSaving(true); setNotice('');
    try { await work.updateTask(task, statusChangePatch(task, status)); setNotice('Authoritative task state updated.'); }
    catch { setNotice('Change not saved. The latest authoritative task state has been restored.'); await work.reload(); }
    finally { setSaving(false); }
  }

  if (work.loading) return <main className="v9-work"><div className="v9-work-loading"><span/><p>Aligning your authorized execution field</p><small>WORK OS / MY WORK</small></div></main>;
  if (work.error) return <main className="v9-work"><section className="v9-work-recovery"><CircleAlert/><small>CONNECTION INTERRUPTED</small><h1>Your assignments remain protected.</h1><p>No work has been inferred. Reconnect the organization repository to restore this execution field.</p><button onClick={() => void work.reload()}><RefreshCw/>Retry connection</button></section></main>;

  return <main className="v9-work">
    <header className="v9-work-horizon">
      <div><p>MY WORK <i/> AUTHORIZED EXECUTION</p><h1>Turn outcomes into<br/><em>clear next moves.</em></h1></div>
      <aside><span><i className="is-live"/>{work.tasks.filter(t => t.status === 'in_progress').length}<small>moving</small></span><span><i className="is-risk"/>{work.tasks.filter(t => t.status === 'blocked').length}<small>blocked</small></span><span><i className="is-done"/>{work.tasks.filter(t => t.status === 'completed').length}<small>delivered</small></span></aside>
    </header>

    <section className="v9-work-deck" aria-label="My Work execution field">
      <nav aria-label="Work lenses">{lenses.map(item => <button key={item.id} className={lens === item.id ? 'is-active' : ''} onClick={() => { setLens(item.id); setSelectedId(null); }}><span>{item.label}</span><b>{tasksFor(work.tasks, item.id).length}</b></button>)}</nav>
      <div className="v9-work-field">
        <header><div><small>{lens.toUpperCase()} / OUTCOMES</small><h2>{lens === 'active' ? 'What you are moving now' : lens === 'queued' ? 'Prepared for a clean start' : lens === 'blocked' ? 'Decisions and intervention' : 'Recently delivered'}</h2></div><p>{visible.length} authorized {visible.length === 1 ? 'task' : 'tasks'}</p></header>
        {visible.length ? <div className="v9-work-routes">{visible.map((task, index) => {
          const taskChunks = chunks.filter(chunk => chunk.taskId === task.id);
          const done = taskChunks.filter(complete).length;
          return <button key={task.id} className={`v9-work-route is-${task.status}${selectedId === task.id ? ' is-selected' : ''}`} onClick={() => setSelectedId(task.id)}>
            <span className="v9-route-index">{String(index + 1).padStart(2, '0')}</span><span className="v9-route-line"><i/></span>
            <span className="v9-route-copy"><small>{task.projectName}</small><strong>{task.title}</strong><em>{task.description || 'No task brief has been recorded.'}</em></span>
            <span className="v9-route-checkpoints"><b>{chunkState.loading ? '—' : taskChunks.length ? `${done}/${taskChunks.length}` : '0'}</b><small>{taskChunks.length ? 'chunks complete' : 'no chunks'}</small></span>
            <span className="v9-route-state">{label(task.status)}</span><ArrowRight/>
          </button>;
        })}</div> : <div className="v9-work-clear"><CheckCircle2/><h3>This field is clear.</h3><p>No authorized tasks match this lens. Work OS will not manufacture activity to fill the space.</p></div>}
      </div>
      <aside className="v9-work-rail"><section><small>EXECUTION PRINCIPLE</small><Route/><h3>Progress should explain itself.</h3><p>Tasks hold the outcome. Repository-backed chunks show the path when they exist.</p></section><section><small>CONTEXT LINKS</small><button onClick={() => navigate('/time/tracking')}><Timer/>Time context <ArrowRight/></button><button onClick={() => navigate('/communication/conversations')}><MessageSquare/>Communication <ArrowRight/></button></section><footer><span>Repository connected</span><small>Organization scope preserved</small></footer></aside>
    </section>

    {selected && <><button className="v9-work-scrim" aria-label="Close task inspector" onClick={() => setSelectedId(null)}/><aside className="v9-task-inspector" aria-label="Task execution inspector">
      <header><div><small>EXECUTE IN CONTEXT</small><span className={`is-${selected.status}`}>{label(selected.status)}</span></div><button aria-label="Close task inspector" onClick={() => setSelectedId(null)}><X/></button></header>
      <div className="v9-task-inspector-scroll"><section className="v9-task-identity"><p>{selected.projectName}</p><h2>{selected.title}</h2><span>{selected.description || 'No task brief has been recorded.'}</span></section>
      <section className="v9-chunk-sequence"><header><div><small>EXECUTION PATH</small><h3>Work chunks</h3></div><b>{selectedChunks.length ? `${completedChunks}/${selectedChunks.length}` : 'NONE'}</b></header>
        {chunkState.loading ? <p className="v9-chunk-truth">Loading authorized chunks…</p> : chunkState.error ? <p className="v9-chunk-truth">Chunks are unavailable from the authorized repository.</p> : selectedChunks.length ? selectedChunks.map((chunk, index) => <article key={chunk.id} className={complete(chunk) ? 'is-complete' : `is-${chunk.status}`}><span>{complete(chunk) ? <Check/> : chunk.status === 'in_progress' ? <Play/> : chunk.status === 'blocked' ? <Pause/> : <Circle/>}</span><div><small>CHUNK {String(index + 1).padStart(2, '0')}</small><strong>{chunk.title}</strong></div><em>{chunk.status.replace('_', ' ')}</em></article>) : <div className="v9-chunk-empty"><Layers3/><strong>No chunks are linked to this task.</strong><p>Progress cannot be explained as checkpoints yet. Work OS will not invent them.</p>{work.isAdmin && <button onClick={() => navigate('/work/tasks')}>Open task administration <ArrowRight/></button>}</div>}
      </section>
      <section className="v9-lifecycle"><small>AUTHORITATIVE LIFECYCLE</small><div>{selected.status === 'todo' && <button disabled={saving} onClick={() => void transition(selected, 'in_progress')}><Play/>Start task</button>}{selected.status === 'in_progress' && <button disabled={saving} onClick={() => void transition(selected, 'blocked')}><Pause/>Mark blocked</button>}{selected.status === 'blocked' && <button disabled={saving} onClick={() => void transition(selected, 'in_progress')}><Play/>Resume task</button>}{!['completed', 'archived'].includes(selected.status) && <button disabled={saving} onClick={() => void transition(selected, 'completed')}><CheckCircle2/>Complete outcome</button>}</div>{notice && <p role="status">{notice}</p>}</section>
      <section className="v9-context-jumps"><button onClick={() => navigate('/time/tracking')}><Clock3/><span><small>TIME</small>Open time context</span><ArrowRight/></button><button onClick={() => navigate('/communication/conversations')}><MessageSquare/><span><small>DISCUSS</small>Open communication</span><ArrowRight/></button></section></div>
      <footer>Repository-backed task · optimistic concurrency preserved</footer>
    </aside></>}
  </main>;
}
