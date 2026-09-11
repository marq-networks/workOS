import { ArrowRight, Building2, FileCheck2, Landmark, LockKeyhole, PlugZap, ReceiptText, ShieldCheck, WalletCards } from 'lucide-react';
import { Button } from '../components/ui/button';

const lanes = [
  { icon: ReceiptText, title: 'Intake & review', detail: 'Expenses, invoices, and approvals', state: 'Awaiting connection' },
  { icon: WalletCards, title: 'Accounts & ledger', detail: 'Balances and transaction records', state: 'No data source' },
  { icon: Landmark, title: 'Business reporting', detail: 'Cash flow and operating reports', state: 'Unavailable' },
];

export function FinanceOperationsScreen() {
  return <main className="premium-page finance-command">
    <header className="command-hero">
      <div><p className="premium-eyebrow">Business operations · controlled access</p><h1 className="premium-title">Finance command</h1><p>Connect an authorized source before monetary records or reporting can appear.</p></div>
      <span className="connection-pill"><span /> Not connected</span>
    </header>
    <section className="finance-grid">
      <article className="finance-onboarding">
        <div className="finance-mark"><PlugZap /></div>
        <p className="premium-eyebrow">Configuration required</p>
        <h2>Bring finance into the operating picture</h2>
        <p>There is no authorized finance provider or production finance schema connected to this workspace. Work OS will not estimate balances, revenue, or margin.</p>
        <div className="finance-steps">
          <div><b>01</b><span><strong>Choose a source</strong><small>Accounting or banking provider</small></span></div>
          <div><b>02</b><span><strong>Validate access</strong><small>Roles, organization scope, and consent</small></span></div>
          <div><b>03</b><span><strong>Review mapping</strong><small>Accounts, projects, and categories</small></span></div>
        </div>
        <Button disabled title="Finance integrations are not configured">Configure connection <ArrowRight /></Button>
      </article>
      <aside className="finance-assurance">
        <ShieldCheck /><h2>Designed for trustworthy data</h2>
        <ul><li><LockKeyhole />No placeholder financial totals</li><li><Building2 />Organization-scoped access required</li><li><FileCheck2 />Reviewable imports and decisions</li></ul>
        <p>Finance remains a future module pending approved product policy and infrastructure.</p>
      </aside>
    </section>
    <section className="finance-lanes" aria-label="Future finance workspaces">{lanes.map(({icon:Icon,...lane})=><article key={lane.title}><Icon/><div><h2>{lane.title}</h2><p>{lane.detail}</p></div><span>{lane.state}</span></article>)}</section>
  </main>;
}
