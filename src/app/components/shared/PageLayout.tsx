import { ReactNode } from 'react';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
}

function KPICard({ title, value, change, changeType = 'neutral', icon }: KPICardProps) {
  const changeColor = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground'
  }[changeType];

  return (
    <div className="premium-surface group p-5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight">{value}</h3>
          {change && (
            <p className={`mt-2 text-sm ${changeColor}`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/10 bg-primary/5 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface PageLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  kpis?: KPICardProps[];
  children: ReactNode;
  subNav?: ReactNode;
  drawer?: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: ReactNode;
  };
}

export function PageLayout({ title, description, actions, kpis, children, subNav, drawer }: PageLayoutProps) {
  return (
    <div className="relative flex h-full">
      <div className="flex-1 overflow-auto">
        <div className="premium-page">
          {/* Page Header */}
          <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="premium-eyebrow">Work OS</p>
              <h1 className="premium-title mt-1">{title}</h1>
              {description && (
                <p className="mt-1 text-muted-foreground">{description}</p>
              )}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>

          {/* Sub Navigation */}
          {subNav && <div className="premium-tabs">{subNav}</div>}

          {/* KPI Strip */}
          {kpis && kpis.length > 0 && (
            <div className="premium-grid">
              {kpis.map((kpi, index) => (
                <KPICard key={index} {...kpi} />
              ))}
            </div>
          )}

          {/* Main Content */}
          {children}
        </div>
      </div>

      {/* Right Drawer */}
      {drawer?.isOpen && (
        <div className="flex w-96 flex-col border-l border-border bg-card">
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <h2>{drawer.title}</h2>
            <Button variant="ghost" size="icon" onClick={drawer.onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-6">
            {drawer.content}
          </div>
        </div>
      )}
    </div>
  );
}
