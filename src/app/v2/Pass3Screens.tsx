/* eslint-disable react-hooks/exhaustive-deps -- reloads are intentionally keyed to validated organization IDs, not unstable scope objects */
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Bot,
  FileText,
  Hash,
  Headphones,
  MessageSquare,
  PanelRight,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings2,
  Users,
  Video,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  ActivityRow,
  AiSurface,
  ContextDrawer,
  PersonChip,
  Progress,
  StatusBadge,
  Surface,
  TaskRow,
  WorkspaceState,
  WorkChunkRow,
} from "../components/shared/GoldenPrimitives";
import { useAuth } from "../contexts/AuthContext";
import { useOrganization } from "../contexts/OrganizationContext";
import { useWork } from "../work/useWork";
import { useV2Module } from "./useV2Module";
import type {
  AgentConfig,
  AutomationRule,
  Conversation,
  Message,
  Pass3Repository,
  SearchResult,
} from "./pass3Types";
import type { ProjectWorkspaceData } from "./closureTypes";
import {
  ActivityRow as V5ActivityRow,
  AttentionSurface,
  IntelligenceSurface,
  KernelButton,
  MatteSurface,
  Status as V5Status,
  WorkRow,
  WorkspaceState as V5WorkspaceState,
} from "../ui-v5/WorkOSKernel";
const repository: Promise<Pass3Repository> =
  import("./supabasePass3Repository").then((m) => m.supabasePass3Repository);
function useScope() {
  const { user } = useAuth();
  const { activeMembership, activeRole } = useOrganization();
  return {
    user,
    role: activeRole,
    scope: activeMembership
      ? {
          tenantId: activeMembership.tenantId,
          organizationId: activeMembership.organizationId,
          membershipId: activeMembership.id,
        }
      : null,
  };
}
function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="premium-page">
      <header className="flex flex-col gap-2 border-b pb-5">
        <p className="premium-eyebrow">Work OS · Live workspace</p>
        <h1 className="premium-title">{title}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Authorized, organization-scoped operational data.
        </p>
      </header>
      {children}
    </main>
  );
}
export function CommunicationScreen() {
  const { scope } = useScope();
  const people = useV2Module("people");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const load = async () => {
    if (!scope) return;
    setLoading(true);
    setError("");
    try {
      const r = await repository;
      const c = await r.listConversations(scope);
      setConversations(c);
      const id = selected || c[0]?.id || "";
      setSelected(id);
      setMessages(id ? (await r.listMessages(scope, id)).items : []);
    } catch {
      setError("Communication could not be loaded for this organization.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [scope?.organizationId, selected]);
  const create = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!scope) return;
    const d = new FormData(e.currentTarget);
    try {
      await (
        await repository
      ).createConversation(scope, {
        kind: String(d.get("kind")),
        title: String(d.get("title")),
        participants: [String(d.get("participant"))],
      });
      setCreating(false);
      await load();
    } catch {
      setError(
        "Conversation was not created. Check your current membership and retry.",
      );
    }
  };
  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!scope || !selected) return;
    const form = e.currentTarget;
    const body = String(new FormData(form).get("body"));
    try {
      await (await repository).postMessage(scope, selected, body);
      form.reset();
      await load();
    } catch {
      setError(
        "Message was not sent. Membership or conversation access may have changed.",
      );
    }
  };
  const active = conversations.find((c) => c.id === selected);
  const personRecords = people.records as {
    membershipId: string;
    displayName: string;
    jobTitle?: string;
  }[];
  return (
    <main className="premium-page">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
        <div>
          <p className="premium-eyebrow">Communication · live workspace</p>
          <h1 className="premium-title">Stay with the work</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Authorized conversations and their execution context, side by side.
          </p>
        </div>
        <Button onClick={() => setCreating((v) => !v)}>
          <Plus />
          New conversation
        </Button>
      </header>
      {creating && (
        <Surface className="p-4">
          <form
            onSubmit={create}
            className="grid gap-3 sm:grid-cols-[8rem_1fr_1fr_auto]"
          >
            <select
              name="kind"
              className="h-10 rounded-lg border bg-background px-3"
            >
              <option value="direct">Direct</option>
              <option value="channel">Channel</option>
            </select>
            <Input name="title" required placeholder="Conversation title" />
            <select
              name="participant"
              required
              className="h-10 rounded-lg border bg-background px-3"
            >
              <option value="">Participant</option>
              {personRecords.map((p) => (
                <option value={p.membershipId} key={p.membershipId}>
                  {p.displayName}
                </option>
              ))}
            </select>
            <Button>Create</Button>
          </form>
        </Surface>
      )}
      {error && (
        <WorkspaceState
          kind="error"
          title="Communication unavailable"
          detail={error}
          action={
            <Button variant="outline" onClick={() => void load()}>
              <RefreshCw />
              Retry
            </Button>
          }
        />
      )}
      {!error && (
        <div className="grid min-h-[34rem] overflow-hidden rounded-2xl border bg-card/50 lg:grid-cols-[15rem_minmax(20rem,1fr)_18rem]">
          <aside className="border-r bg-muted/15 p-3">
            <div className="mb-4 flex items-center justify-between px-2">
              <strong className="text-sm">Conversations</strong>
              <StatusBadge signal="live">
                {conversations.length} active
              </StatusBadge>
            </div>
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-muted-foreground">
              Direct · channels · projects
            </p>
            {conversations.map((c) => (
              <button
                className={`mb-1 flex w-full items-center gap-2 rounded-xl p-2.5 text-left text-sm transition ${selected === c.id ? "bg-primary/10 text-primary" : "hover:bg-muted/60"}`}
                key={c.id}
                onClick={() => setSelected(c.id)}
              >
                {c.kind === "channel" ? <Hash /> : <MessageSquare />}
                <span className="truncate">{c.title || c.kind}</span>
              </button>
            ))}
            {!conversations.length && !loading && (
              <WorkspaceState
                kind="empty"
                title="No conversations"
                detail="Create an authorized direct or channel conversation."
              />
            )}
          </aside>
          <section className="flex min-w-0 flex-col">
            <header className="flex items-center justify-between border-b px-5 py-3">
              <div>
                <strong>{active?.title || "Select a conversation"}</strong>
                <p className="text-xs text-muted-foreground">
                  {active?.kind || "Conversation stream"}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  disabled
                  title="Audio calling is not configured"
                  aria-label="Audio calling unavailable"
                >
                  <Headphones />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled
                  title="Video calling is not configured"
                  aria-label="Video calling unavailable"
                >
                  <Video />
                </Button>
              </div>
            </header>
            <div className="flex-1 space-y-4 overflow-auto p-5">
              {loading ? (
                <WorkspaceState
                  kind="loading"
                  title="Loading messages"
                  detail="Reading the authorized conversation."
                />
              ) : messages.length ? (
                messages.map((m) => (
                  <article className="flex gap-3" key={m.id}>
                    <span className="gold-avatar">
                      <Users />
                    </span>
                    <div className="max-w-[80%] rounded-2xl rounded-tl-md border bg-muted/25 px-3 py-2">
                      <p className="text-sm leading-relaxed">{m.body}</p>
                      <time className="mt-1 block text-[10px] text-muted-foreground">
                        {new Date(m.createdAt).toLocaleString()}
                      </time>
                    </div>
                  </article>
                ))
              ) : (
                <WorkspaceState
                  kind="empty"
                  title="Quiet conversation"
                  detail="No authorized messages are available yet."
                />
              )}
            </div>
            <form
              onSubmit={send}
              className="m-4 flex items-center gap-2 rounded-xl border bg-background/60 p-2"
            >
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled
                title="Attachments require configured storage"
                aria-label="File attachment unavailable"
              >
                <Paperclip />
              </Button>
              <Input
                name="body"
                required
                maxLength={20000}
                disabled={!selected}
                placeholder="Write a message…"
                className="border-0 bg-transparent"
              />
              <Button disabled={!selected}>
                <Send />
                Send
              </Button>
            </form>
          </section>
          <aside className="border-l bg-muted/10 p-4">
            <div className="mb-5 flex items-center gap-2">
              <PanelRight className="text-primary" />
              <strong className="text-sm">Work context</strong>
            </div>
            {active?.projectId ? (
              <Surface signal="live" className="p-3">
                <p className="text-xs text-muted-foreground">Related project</p>
                <strong className="mt-1 block text-sm">
                  Project context linked
                </strong>
              </Surface>
            ) : (
              <WorkspaceState
                kind="empty"
                title="No linked work"
                detail="This conversation has no project, task, or milestone context."
              />
            )}
            <div className="mt-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.14em] text-muted-foreground">
                People
              </p>
              {personRecords.slice(0, 4).map((p) => (
                <div className="mb-3" key={p.membershipId}>
                  <PersonChip name={p.displayName} detail={p.jobTitle} />
                </div>
              ))}
            </div>
            <AiSurface title="Conversation AI">
              <p className="text-xs text-muted-foreground">
                AI actions stay unavailable until a provider is configured.
              </p>
            </AiSurface>
          </aside>
        </div>
      )}
    </main>
  );
}
export function UnifiedSearchScreen() {
  const { scope } = useScope();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState("");
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!scope) return;
    try {
      setResults(
        await (
          await repository
        ).search(scope, String(new FormData(e.currentTarget).get("query"))),
      );
    } catch {
      setError("Search could not be completed with the current authorization.");
    }
  };
  return (
    <Shell title="Search">
      <form onSubmit={submit} className="flex gap-2 max-w-2xl">
        <Input
          name="query"
          required
          maxLength={120}
          placeholder="Search authorized work, conversations, and files"
        />
        <Button>
          <Search />
          Search
        </Button>
      </form>
      <div className="divide-y border rounded-xl bg-card">
        {results.map((r) => (
          <a
            className="block p-4 hover:bg-muted"
            href={r.href}
            key={`${r.entityType}:${r.entityId}`}
          >
            <strong>{r.title}</strong>
            <p className="text-sm text-muted-foreground">
              {r.entityType} · {r.subtitle}
            </p>
          </a>
        ))}
      </div>
      {error && <p role="alert">{error}</p>}
    </Shell>
  );
}
export function FilesEvidenceScreen() {
  const { scope } = useScope();
  const work = useWork();
  const [task, setTask] = useState("");
  const [items, setItems] = useState<unknown[]>([]);
  const [notice, setNotice] = useState("");
  const load = async (id: string) => {
    if (!scope || !id) return;
    setTask(id);
    setItems(await (await repository).listEvidence(scope, id));
  };
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!scope || !task) return;
    const d = new FormData(e.currentTarget);
    await (
      await repository
    ).submitLinkEvidence(scope, {
      taskId: task,
      kind: String(d.get("kind")),
      uri: String(d.get("uri")),
      summary: String(d.get("summary") || ""),
    });
    await load(task);
  };
  const upload = async () => {
    if (!scope) return;
    const state = await (
      await repository
    ).prepareUpload(scope, {
      fileName: "pending",
      mimeType: "application/octet-stream",
      sizeBytes: 0,
      context: { taskId: task },
    });
    setNotice(
      state.status === "configuration_required"
        ? state.message
        : "Upload ready",
    );
  };
  return (
    <Shell title="Files & Evidence">
      <select
        className="h-9 border rounded px-3"
        value={task}
        onChange={(e) => void load(e.target.value)}
      >
        <option value="">Select task</option>
        {work.tasks.map((t) => (
          <option key={t.id} value={t.id}>
            {t.title}
          </option>
        ))}
      </select>
      <Button variant="outline" onClick={() => void upload()}>
        <FileText />
        Prepare secure upload
      </Button>
      {notice && <p role="status">{notice}</p>}
      <form onSubmit={submit} className="grid gap-2 max-w-xl">
        <select name="kind" className="h-9 border rounded px-3">
          <option value="link">Link</option>
          <option value="document">Document</option>
          <option value="external_work">External work</option>
        </select>
        <Input name="uri" type="url" required placeholder="https://…" />
        <Input name="summary" placeholder="Evidence summary" />
        <Button disabled={!task}>Submit evidence</Button>
      </form>
      <pre className="text-xs border rounded p-3 overflow-auto">
        {JSON.stringify(items, null, 2)}
      </pre>
    </Shell>
  );
}
export function AutomationScreen() {
  const { scope, user, role } = useScope();
  const [items, setItems] = useState<AutomationRule[]>([]);
  const [error, setError] = useState("");
  const load = async () => {
    if (scope) setItems(await (await repository).listAutomationRules(scope));
  };
  useEffect(() => {
    void load();
  }, [scope?.organizationId]);
  const save = async (input: Partial<AutomationRule> & { name: string }) => {
    if (scope && user) {
      await (await repository).saveAutomationRule(scope, user.id, input);
      await load();
    }
  };
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    try {
      await save({
        name: String(d.get("name")),
        status: "draft",
        trigger: { type: "manual" },
        condition: {},
        action: { type: "notification" },
        requiresApproval: true,
      });
    } catch {
      setError("Rule was not saved.");
    }
  };
  return (
    <Shell title="Automation">
      <form onSubmit={submit} className="flex gap-2">
        <Input name="name" required placeholder="Rule name" />
        <Button disabled={role !== "org_admin"}>
          <Settings2 />
          Create draft
        </Button>
      </form>
      {items.map((r) => (
        <article className="border rounded p-4" key={r.id}>
          <strong>{r.name}</strong>
          <p>
            {r.status} · approval{" "}
            {r.requiresApproval ? "required" : "not required"}
          </p>
          <Button
            variant="outline"
            onClick={() =>
              void save({
                ...r,
                name: r.name,
                status: r.status === "active" ? "paused" : "active",
              })
            }
          >
            {r.status === "active" ? "Disable" : "Enable"}
          </Button>
          {r.status === "active" && (
            <Button
              onClick={() =>
                void repository
                  .then((x) => x.executeAutomation(r))
                  .catch(() => setError("Trusted execution failed."))
              }
            >
              Run approved action
            </Button>
          )}
        </article>
      ))}
      {error && <p role="alert">{error}</p>}
    </Shell>
  );
}
export function AgentCenterScreen() {
  const { scope, user, role } = useScope();
  const [items, setItems] = useState<AgentConfig[]>([]);
  const load = async () => {
    if (scope) setItems(await (await repository).listAgentConfigs(scope));
  };
  useEffect(() => {
    void load();
  }, [scope?.organizationId]);
  const types = [
    "project_manager",
    "risk",
    "workload",
    "reporting",
    "knowledge",
  ];
  const save = async (input: Partial<AgentConfig> & { agentType: string }) => {
    if (scope && user) {
      await (await repository).saveAgentConfig(scope, user.id, input);
      await load();
    }
  };
  return (
    <Shell title="Agent Center">
      <p className="text-muted-foreground">
        Agents are disabled by default and cannot silently execute protected
        changes.
      </p>
      {types.map((type) => {
        const config = items.find((i) => i.agentType === type);
        return (
          <article
            className="border rounded p-4 flex justify-between"
            key={type}
          >
            <div>
              <strong>{type.replaceAll("_", " ")}</strong>
              <p>
                {config
                  ? `${config.enabled ? "Enabled" : "Disabled"} · ${config.authority}`
                  : "Not configured"}
              </p>
            </div>
            {config ? (
              <Button
                disabled={role !== "org_admin"}
                onClick={() =>
                  void save({
                    ...config,
                    agentType: type,
                    enabled: !config.enabled,
                  })
                }
              >
                {config.enabled ? "Disable" : "Enable"}
              </Button>
            ) : (
              <Button
                disabled={role !== "org_admin"}
                onClick={() =>
                  void save({
                    agentType: type,
                    enabled: false,
                    authority: "read",
                  })
                }
              >
                <Bot />
                Configure
              </Button>
            )}
          </article>
        );
      })}
    </Shell>
  );
}
export function CommandCenterScreen() {
  const work = useWork();
  const sessions = useV2Module("sessions");
  const notifications = useV2Module("notifications");
  const records = notifications.records as {
    id: string;
    title: string;
    body: string | null;
    readAt: string | null;
    createdAt?: string;
  }[];
  const activeSessions = (
    sessions.records as { endedAt: string | null }[]
  ).filter((s) => !s.endedAt).length;
  const blocked = work.tasks.filter((t) => t.status === "blocked");
  const active = work.tasks.filter((t) => t.status === "in_progress");
  const unread = records.filter((n) => !n.readAt);
  const nextWork = [...blocked, ...active, ...work.tasks.filter((t) => t.status !== "blocked" && t.status !== "in_progress")];
  const openWork = () => window.dispatchEvent(new CustomEvent('workos-navigate', { detail: { path: '/work/tasks' } }));
  if (work.loading)
    return (
      <main className="v5-page">
        <V5WorkspaceState
          kind="loading"
          title="Preparing Command Center"
          detail="Loading your authorized operating picture."
        />
      </main>
    );
  if (work.error)
    return (
      <main className="v5-page v5-command-center">
        <header className="v5-command-header"><div><p>COMMAND CENTER / CONNECTION INTERRUPTED</p><h1>Organization operations</h1><span>The new workspace remains available while authorized work reconnects.</span></div><KernelButton onClick={() => void work.reload()}><RefreshCw/>Retry connection</KernelButton></header>
        <div className="v5-offline-workspace">
          <MatteSurface className="v5-offline-primary" signal="critical"><div className="v5-section-heading"><div><small>EXECUTION LANE</small><h2>Your working set</h2><p>The operating surface is holding its secure boundary while data reconnects.</p></div><V5Status signal="critical">Data offline</V5Status></div><div className="v6-offline-focus"><V5WorkspaceState kind="error" title="Authorized work is unavailable" detail={work.error.message}/><div className="v6-continuity" aria-label="Connection continuity"><span><i/>Organization context <b>Preserved</b></span><span><i/>Operational metrics <b>Not inferred</b></span><span><i/>Next action <b>Reconnect source</b></span></div></div><div className="v6-boundary-strip" aria-label="Protected workspace state"><span><small>IDENTITY</small><b>Authenticated</b></span><span><small>SCOPE</small><b>Organization locked</b></span><span><small>DATA POLICY</small><b>No synthetic fallback</b></span></div></MatteSurface>
          <aside><AttentionSurface signal="critical"><small>NEEDS ATTENTION</small><h2>Connection required</h2><p>No operational state is inferred while the organization repository is unavailable.</p></AttentionSurface><IntelligenceSurface title="Operational briefing"><p>Intelligence stays unavailable until authorized context and a configured provider are connected.</p></IntelligenceSurface></aside>
        </div>
      </main>
    );
  return (
    <main className="v5-page v5-command-center">
      <header className="v5-command-header"><div><p>COMMAND CENTER / AUTHORIZED LIVE STATE</p><h1>Organization operations</h1><span>Move work forward without leaving the operating context.</span></div><div className="v5-live-context"><V5Status signal="live">Repository connected</V5Status><span>{activeSessions ? `${activeSessions} active work session${activeSessions === 1 ? '' : 's'}` : 'No active work sessions'}</span></div></header>
      <section className="v5-operating-strip">
        <div className="v5-now"><small>HAPPENING NOW</small><strong>{active.length ? `${active.length} task${active.length === 1 ? '' : 's'} moving` : 'No work in progress'}</strong><span>{activeSessions ? 'Active time is being captured.' : 'No active session is currently recorded.'}</span></div>
        <div className={blocked.length ? 'is-risk' : 'is-clear'}><small>ATTENTION</small><strong>{blocked.length ? `${blocked.length} blocked` : 'Queue clear'}</strong><span>{blocked.length ? 'Intervention is required.' : 'No authorized blockers.'}</span></div>
        <div><small>RECENT SIGNALS</small><strong>{unread.length ? `${unread.length} unread` : 'All caught up'}</strong><span>Organization notifications</span></div>
        <KernelButton onClick={openWork}>Open all work <span>→</span></KernelButton>
      </section>
      <div className="v5-operations-grid">
        <MatteSurface className="v5-execution-lane" signal={blocked.length ? 'attention' : 'live'}><div className="v5-section-heading"><div><small>NEXT BEST WORK</small><h2>Execution lane</h2><p>Blocked work first, then active and queued assignments.</p></div><V5Status signal={blocked.length ? 'attention' : 'live'}>{work.tasks.length} authorized</V5Status></div><div className="v5-work-list">{nextWork.length ? nextWork.slice(0, 8).map(t => <WorkRow key={t.id} title={t.title} context={t.projectName} status={t.status} progress={t.progress} onClick={openWork}/>) : <V5WorkspaceState kind="empty" title="No assigned work" detail="Your authorized working set is empty."/>}</div><footer><button onClick={openWork}>Continue in My Work <span>→</span></button></footer></MatteSurface>
        <aside className="v5-signal-lane">
          <AttentionSurface signal={blocked.length ? 'critical' : 'attention'}><div className="v5-section-heading"><div><small>NEEDS ATTENTION</small><h2>{blocked.length ? 'Blocked work' : 'No blockers'}</h2></div><V5Status signal={blocked.length ? 'critical' : 'healthy'}>{blocked.length ? 'Action needed' : 'Healthy'}</V5Status></div>{blocked.length ? blocked.slice(0, 3).map(t => <WorkRow key={t.id} title={t.title} context={t.projectName} status={t.status} onClick={openWork}/>) : <p className="v5-calm-copy">No blocked authorized tasks require intervention.</p>}</AttentionSurface>
          <MatteSurface className="v5-change-feed"><div className="v5-section-heading"><div><small>WHAT CHANGED</small><h2>Recent signals</h2></div><V5Status signal={unread.length ? 'attention' : 'neutral'}>{unread.length} unread</V5Status></div>{records.length ? records.slice(0, 5).map(n => <V5ActivityRow key={n.id} title={n.title} detail={n.body}/>) : <V5WorkspaceState kind="empty" title="No recent changes" detail="Authorized notifications will appear here."/>}</MatteSurface>
          <IntelligenceSurface title="Attention briefing"><p>AI analysis is permission-scoped and remains unavailable until an intelligence provider is configured.</p><button onClick={() => window.dispatchEvent(new CustomEvent('workos-navigate', { detail: { path: '/ai/copilots' } }))}>Review availability <span>→</span></button></IntelligenceSurface>
        </aside>
      </div>
    </main>
  );
}
export function ProjectWorkspaceScreen() {
  const { scope } = useScope();
  const work = useWork();
  const [project, setProject] = useState("");
  const [tab, setTab] = useState("Overview");
  const [data, setData] = useState<ProjectWorkspaceData | null>(null);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<string | null>(null);
  const tabs = [
    "Overview",
    "Plan",
    "Tasks",
    "Milestones",
    "Team",
    "Conversations",
    "Files",
    "Time",
    "Activity",
    "Finance",
    "Reports",
    "AI",
  ];
  useEffect(() => {
    setData(null);
    setError("");
    setDetail(null);
    if (scope && project)
      void import("./supabaseClosureRepository")
        .then((m) =>
          m.supabaseClosureRepository.loadProjectWorkspace(scope, project),
        )
        .then(setData)
        .catch(() =>
          setError("The authorized project workspace could not be loaded."),
        );
  }, [scope?.organizationId, project]);
  const complete =
    data?.tasks.filter((t) => t.status === "completed").length || 0;
  const progress = data?.tasks.length
    ? Math.round((complete / data.tasks.length) * 100)
    : 0;
  const selectedTask = data?.tasks.find((t) => t.id === detail);
  return (
    <main className="premium-page">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
        <div>
          <p className="premium-eyebrow">
            Project Workspace · persistent context
          </p>
          <h1 className="premium-title">
            {data?.project.name || "Select a project"}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {data?.project.description ||
              "Open an authorized project without leaving the operating shell."}
          </p>
        </div>
        <select
          aria-label="Current project"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          className="h-10 min-w-60 rounded-xl border bg-card px-3"
        >
          <option value="">Select project</option>
          {work.projects.map((p) => (
            <option value={p.id} key={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </header>
      {error && (
        <WorkspaceState
          kind="error"
          title="Project workspace unavailable"
          detail={error}
        />
      )}{" "}
      {!project && !error && (
        <WorkspaceState
          kind="empty"
          title="Choose a project"
          detail="Only projects authorized for your active organization appear here."
        />
      )}
      {project && !data && !error && (
        <WorkspaceState
          kind="loading"
          title="Assembling project context"
          detail="Loading tasks, milestones, people, files, time, activity and AI state."
        />
      )}
      {data && (
        <>
          <section className="grid gap-3 md:grid-cols-[1.3fr_repeat(3,.7fr)]">
            <Surface
              signal={data.project.status === "active" ? "live" : "neutral"}
              className="p-5"
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Project state</p>
                  <h2 className="mt-2 text-xl font-semibold">
                    {data.project.name}
                  </h2>
                </div>
                <StatusBadge
                  signal={data.project.status === "active" ? "live" : "neutral"}
                >
                  {data.project.status}
                </StatusBadge>
              </div>
              <div className="mt-5">
                <Progress value={progress} label="Completed tasks" />
              </div>
            </Surface>
            <Surface className="p-5">
              <p className="text-xs text-muted-foreground">Tasks</p>
              <strong className="mt-4 block text-3xl">
                {data.tasks.length}
              </strong>
            </Surface>
            <Surface
              signal={
                data.tasks.some((t) => t.status === "blocked")
                  ? "critical"
                  : "healthy"
              }
              className="p-5"
            >
              <p className="text-xs text-muted-foreground">Blocked</p>
              <strong className="mt-4 block text-3xl">
                {data.tasks.filter((t) => t.status === "blocked").length}
              </strong>
            </Surface>
            <Surface className="p-5">
              <p className="text-xs text-muted-foreground">Milestones</p>
              <strong className="mt-4 block text-3xl">
                {data.milestones.length}
              </strong>
            </Surface>
          </section>
          <nav className="premium-tabs" aria-label="Project workspace sections">
            {tabs.map((t) => (
              <button
                className={`rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap ${tab === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                onClick={() => setTab(t)}
                key={t}
              >
                {t}
              </button>
            ))}
          </nav>
          <Surface className="min-h-72 p-5">
            <div className="mb-5">
              <p className="premium-eyebrow">{data.project.name}</p>
              <h2 className="mt-1 text-lg font-semibold">{tab}</h2>
            </div>
            {tab === "Overview" && (
              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold">Execution summary</h3>
                  <div className="mt-2">
                    {data.tasks.slice(0, 5).map((t) => (
                      <TaskRow
                        key={t.id}
                        title={t.title}
                        context={t.projectName}
                        status={t.status}
                        progress={t.progress}
                        onClick={() => setDetail(t.id)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Recent activity</h3>
                  {data.activity.slice(0, 5).map((a) => (
                    <ActivityRow
                      key={a.id}
                      title={a.action}
                      detail={`${a.targetType}${a.targetId ? ` · ${a.targetId}` : ""}`}
                      time={new Date(a.occurredAt).toLocaleDateString()}
                    />
                  ))}
                </div>
              </div>
            )}
            {tab === "Tasks" &&
              (data.tasks.length ? (
                data.tasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    title={t.title}
                    context={t.projectName}
                    status={t.status}
                    progress={t.progress}
                    onClick={() => setDetail(t.id)}
                  />
                ))
              ) : (
                <WorkspaceState
                  kind="empty"
                  title="No tasks"
                  detail="This project has no authorized tasks."
                />
              ))}
            {tab === "Milestones" && (
              <RecordList
                records={data.milestones.map((m) => ({
                  id: m.id,
                  title: m.name,
                  detail: `${m.status}${m.dueDate ? ` · due ${m.dueDate}` : ""}`,
                }))}
                empty="No milestones are available."
              />
            )}
            {tab === "Team" && (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.people.map((p) => (
                  <Surface className="p-3" key={p.id}>
                    <PersonChip
                      name={p.displayName}
                      detail={p.jobTitle || p.role}
                    />
                  </Surface>
                ))}
              </div>
            )}
            {tab === "Conversations" && (
              <RecordList
                records={data.conversations.map((c) => ({
                  id: c.id,
                  title: c.title || c.kind,
                  detail: c.kind,
                }))}
                empty="No project conversations are linked."
              />
            )}
            {tab === "Files" && (
              <RecordList
                records={data.files.map((f) => ({
                  id: f.id,
                  title: f.fileName,
                  detail: `${f.mimeType} · ${f.sizeBytes} bytes`,
                }))}
                empty="No project files are linked."
              />
            )}
            {tab === "Time" && (
              <RecordList
                records={data.timeEntries.map((t) => ({
                  id: t.id,
                  title: `${new Date(t.startedAt).toLocaleString()} – ${new Date(t.endedAt).toLocaleTimeString()}`,
                  detail: t.status,
                }))}
                empty="No time entries are linked."
              />
            )}
            {tab === "Activity" && (
              <RecordList
                records={data.activity.map((a) => ({
                  id: a.id,
                  title: a.action,
                  detail: new Date(a.occurredAt).toLocaleString(),
                }))}
                empty="No project activity is available."
              />
            )}
            {tab === "Plan" && (
              <RecordList
                records={data.dependencies.map((d) => ({
                  id: d.id,
                  title: "Task dependency",
                  detail: `${d.predecessorTaskId} → ${d.successorTaskId}`,
                }))}
                empty="No task dependencies are recorded."
              />
            )}
            {tab === "Reports" && (
              <div>
                <Progress value={progress} label="Task completion rollup" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Derived only from the authorized tasks loaded for this
                  project.
                </p>
              </div>
            )}
            {tab === "Finance" && (
              <WorkspaceState
                kind="empty"
                title="Finance context not available"
                detail="No project-finance data is part of the authorized workspace repository. Nothing has been inferred."
              />
            )}
            {tab === "AI" && (
              <AiSurface title="Project AI">
                <p className="text-sm text-muted-foreground">
                  {data.ai.message}
                </p>
              </AiSurface>
            )}
          </Surface>
        </>
      )}
      <ContextDrawer
        open={Boolean(selectedTask)}
        title={selectedTask?.title || "Task"}
        onClose={() => setDetail(null)}
      >
        {selectedTask && (
          <div className="space-y-5">
            <div className="flex justify-between">
              <StatusBadge
                signal={
                  selectedTask.status === "blocked"
                    ? "critical"
                    : selectedTask.status === "completed"
                      ? "healthy"
                      : "live"
                }
              >
                {selectedTask.status}
              </StatusBadge>
              <span className="text-xs text-muted-foreground">
                {selectedTask.projectName}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedTask.description || "No task description."}
            </p>
            <Progress value={selectedTask.progress} />
            <div>
              <h3 className="text-sm font-semibold">Work chunks</h3>
              {data?.subtasks
                .filter((s) => s.taskId === selectedTask.id)
                .map((s) => (
                  <WorkChunkRow
                    key={s.id}
                    title={s.title}
                    complete={s.status === "completed"}
                  />
                ))}
              {!data?.subtasks.some((s) => s.taskId === selectedTask.id) && (
                <p className="mt-2 text-xs text-muted-foreground">
                  No work chunks recorded.
                </p>
              )}
            </div>
          </div>
        )}
      </ContextDrawer>
    </main>
  );
}
function RecordList({
  records,
  empty,
}: {
  records: { id: string; title: string; detail: string }[];
  empty: string;
}) {
  return records.length ? (
    <div className="divide-y">
      {records.map((r) => (
        <article className="py-3" key={r.id}>
          <strong className="text-sm">{r.title}</strong>
          <p className="mt-1 text-xs text-muted-foreground">{r.detail}</p>
        </article>
      ))}
    </div>
  ) : (
    <WorkspaceState kind="empty" title="Nothing here yet" detail={empty} />
  );
}
export function AiCopilotScreen() {
  const { scope } = useScope();
  const [state, setState] = useState("Checking AI configuration…");
  useEffect(() => {
    if (scope)
      void repository
        .then((r) => r.getAiState(scope))
        .then((s) => setState(s.message));
  }, [scope?.organizationId]);
  return (
    <Shell title="AI Copilots">
      <Bot />
      <p>{state}</p>
      <p className="text-sm text-muted-foreground">
        Project, Task, My Work, conversation, and Knowledge assistance never
        fabricate results when no provider is configured.
      </p>
    </Shell>
  );
}
