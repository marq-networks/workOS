import type { ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  File,
  LoaderCircle,
  Sparkles,
  User,
} from "lucide-react";

export type Signal =
  | "live"
  | "healthy"
  | "attention"
  | "critical"
  | "ai"
  | "neutral";

export function Surface({
  children,
  className = "",
  signal = "neutral",
  as = "section",
}: {
  children: ReactNode;
  className?: string;
  signal?: Signal;
  as?: "section" | "article" | "aside";
}) {
  const Component = as;
  return (
    <Component className={`gold-surface gold-edge-${signal} ${className}`}>
      {children}
    </Component>
  );
}

export function StatusBadge({
  children,
  signal = "neutral",
}: {
  children: ReactNode;
  signal?: Signal;
}) {
  return <span className={`gold-badge gold-badge-${signal}`}>{children}</span>;
}

export function Presence({
  label = "Available",
  state = "live",
}: {
  label?: string;
  state?: Signal;
}) {
  return (
    <span className="gold-presence">
      <i className={`gold-presence-dot gold-dot-${state}`} aria-hidden="true" />
      {label}
    </span>
  );
}

export function Progress({
  value,
  label = "Progress",
}: {
  value: number;
  label?: string;
}) {
  const bounded = Math.max(0, Math.min(100, value));
  return (
    <div className="gold-progress">
      <div className="gold-progress-copy">
        <span>{label}</span>
        <strong>{bounded}%</strong>
      </div>
      <div
        className="gold-progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={bounded}
      >
        <span style={{ width: `${bounded}%` }} />
      </div>
    </div>
  );
}

export function PersonChip({
  name,
  detail,
}: {
  name: string;
  detail?: string;
}) {
  return (
    <span className="gold-person">
      <span className="gold-avatar">
        <User />
      </span>
      <span>
        <strong>{name}</strong>
        {detail && <small>{detail}</small>}
      </span>
    </span>
  );
}

export function TaskRow({
  title,
  context,
  status,
  progress,
  onClick,
}: {
  title: string;
  context?: string;
  status: string;
  progress?: number;
  onClick?: () => void;
}) {
  const signal: Signal =
    status === "blocked"
      ? "critical"
      : status === "completed"
        ? "healthy"
        : status === "in_progress"
          ? "live"
          : "neutral";
  return (
    <button className="gold-task-row" onClick={onClick} type="button">
      <span className="gold-task-copy">
        <strong>{title}</strong>
        {context && <small>{context}</small>}
      </span>
      <StatusBadge signal={signal}>{status.replaceAll("_", " ")}</StatusBadge>
      {progress !== undefined && (
        <span className="gold-task-progress">{progress}%</span>
      )}
    </button>
  );
}

export function WorkChunkRow({
  title,
  complete,
}: {
  title: string;
  complete: boolean;
}) {
  return (
    <div className="gold-chunk">
      <span className={complete ? "is-complete" : ""}>
        {complete && <Check />}{" "}
      </span>
      <p>{title}</p>
    </div>
  );
}

export function ActivityRow({
  title,
  detail,
  time,
}: {
  title: string;
  detail?: string;
  time?: string;
}) {
  return (
    <div className="gold-activity">
      <i aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        {detail && <p>{detail}</p>}
      </div>
      {time && <time>{time}</time>}
    </div>
  );
}

export function FilePreviewShell({
  name,
  meta,
}: {
  name: string;
  meta?: string;
}) {
  return (
    <Surface className="gold-file">
      <File />
      <div>
        <strong>{name}</strong>
        <p>{meta || "File metadata unavailable"}</p>
      </div>
    </Surface>
  );
}

export function AiSurface({
  title = "Work OS AI",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <Surface signal="ai" className="gold-ai">
      <header>
        <Sparkles />
        <span>{title}</span>
        <StatusBadge signal="ai">intelligence</StatusBadge>
      </header>
      <div>{children}</div>
    </Surface>
  );
}

export function WorkspaceState({
  kind,
  title,
  detail,
  action,
}: {
  kind: "loading" | "empty" | "error";
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  const Icon =
    kind === "loading"
      ? LoaderCircle
      : kind === "error"
        ? AlertTriangle
        : Check;
  return (
    <div
      className={`gold-state gold-state-${kind}`}
      role={kind === "error" ? "alert" : "status"}
    >
      <Icon className={kind === "loading" ? "gold-spin" : ""} />
      <strong>{title}</strong>
      <p>{detail}</p>
      {action}
    </div>
  );
}

export function ContextDrawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <aside className="gold-drawer" aria-label={title}>
      <header>
        <div>
          <small>In context</small>
          <h2>{title}</h2>
        </div>
        <button onClick={onClose} aria-label="Close contextual panel">
          ×
        </button>
      </header>
      <div className="gold-drawer-body">{children}</div>
    </aside>
  );
}
