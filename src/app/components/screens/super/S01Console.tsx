import { PageLayout } from '../../shared/PageLayout';
import { LineChartComponent, BarChartComponent, DonutChartComponent } from '../../shared/Charts';
import { Layers, Building, TrendingUp, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { createOperationalError } from '../../../../operations/operationalError';
import { reportOperationalError } from '../../../../operations/telemetry';

export function S01Console() {
  const [monitoringStatus, setMonitoringStatus] = useState<string | null>(null);
  const sendMonitoringSelfTest = async () => {
    setMonitoringStatus('Sending test event…');
    const result = await reportOperationalError(createOperationalError({
      code: 'monitoring_self_test', category: 'server', severity: 'warning', retryable: false,
      userMessage: 'Operational monitoring self-test.', causeName: 'ControlledSelfTest',
    }));
    setMonitoringStatus(result.accepted ? `Test event accepted. Reference: ${result.eventId}` : `Test event was not accepted. Reference: ${result.eventId}`);
  };
  const revenueData = [
    { month: 'Jul', revenue: 125000 },
    { month: 'Aug', revenue: 142000 },
    { month: 'Sep', revenue: 158000 },
    { month: 'Oct', revenue: 165000 },
    { month: 'Nov', revenue: 178000 },
    { month: 'Dec', revenue: 195000 },
  ];

  const planDistribution = [
    { name: 'Starter', value: 45 },
    { name: 'Professional', value: 32 },
    { name: 'Enterprise', value: 23 },
  ];

  const userGrowth = [
    { month: 'Jul', users: 1820 },
    { month: 'Aug', users: 2150 },
    { month: 'Sep', users: 2480 },
    { month: 'Oct', users: 2890 },
    { month: 'Nov', users: 3250 },
    { month: 'Dec', users: 3675 },
  ];

  return (
    <PageLayout
      title="SUPER – S-01 – Console – v1.1"
      description="Platform-wide metrics and overview"
      kpis={[
        {
          title: 'Total Organizations',
          value: '156',
          change: '+12 this month',
          changeType: 'positive',
          icon: <Building className="h-5 w-5" />
        },
        {
          title: 'Total Users',
          value: '3,675',
          change: '+425 this month',
          changeType: 'positive',
          icon: <Layers className="h-5 w-5" />
        },
        {
          title: 'MRR',
          value: '$195K',
          change: '+9.5% growth',
          changeType: 'positive',
          icon: <DollarSign className="h-5 w-5" />
        },
        {
          title: 'Platform Health',
          value: '99.8%',
          change: 'Uptime',
          changeType: 'positive',
          icon: <TrendingUp className="h-5 w-5" />
        },
      ]}
    >
      <div className="space-y-6">
        <section className="rounded-lg border border-border bg-card p-6" aria-labelledby="operational-monitoring-title">
          <h3 id="operational-monitoring-title">Operational Monitoring</h3>
          <p className="mt-1 text-sm text-muted-foreground">Send a safe synthetic event through the authenticated production telemetry pipeline.</p>
          <button type="button" onClick={() => void sendMonitoringSelfTest()} className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground">Send test event</button>
          {monitoringStatus && <p className="mt-3 text-sm" role="status">{monitoringStatus}</p>}
        </section>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4">Monthly Revenue</h3>
            <LineChartComponent 
              data={revenueData}
              dataKey="revenue"
              xAxisKey="month"
              height={250}
            />
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4">Plan Distribution</h3>
            <DonutChartComponent 
              data={planDistribution}
              dataKey="value"
              nameKey="name"
              height={250}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4">User Growth (6 Months)</h3>
          <BarChartComponent 
            data={userGrowth}
            dataKey="users"
            xAxisKey="month"
            height={300}
          />
        </div>
      </div>
    </PageLayout>
  );
}
