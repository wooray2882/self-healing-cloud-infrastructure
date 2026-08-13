import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Clock, 
  RefreshCw, 
  Terminal, 
  ShieldAlert 
} from 'lucide-react';

interface AlertItem {
  id: string;
  name: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'firing' | 'resolved' | 'remediating';
  description: string;
  summary: string;
  pod?: string;
  namespace?: string;
  startsAt: string;
  promQL?: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'firing' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('http://localhost:4000/api/cluster/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const triggerTestAlert = async () => {
    try {
      setActionMessage('Dispatching test alert to Prometheus Alertmanager...');
      const res = await fetch('http://localhost:4000/api/chaos/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'cpu_spike' })
      });
      if (res.ok) {
        setActionMessage('Simulated alert dispatched! AI Remediation triggered.');
        fetchAlerts();
      }
    } catch (err) {
      setActionMessage('Failed to dispatch simulated alert');
    } finally {
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

  const firingCount = alerts.filter(a => a.status === 'firing').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <AlertTriangle className="h-7 w-7 text-amber-400" />
            Alertmanager Incident Stream
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time Prometheus rule evaluations, active firing states, and automated dispatch routes
          </p>
        </div>
        <div className="flex items-center gap-3">
          {actionMessage && (
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg animate-pulse">
              {actionMessage}
            </span>
          )}
          <button
            onClick={triggerTestAlert}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95"
          >
            <Flame className="h-4 w-4 text-rose-400" />
            Trigger Test Alert
          </button>
          <button
            onClick={fetchAlerts}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5 flex items-center gap-4">
          <div className={`p-3 rounded-xl border ${
            firingCount > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Firing Alerts</div>
            <div className="text-2xl font-bold text-white mt-0.5">{firingCount}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Resolved (24h)</div>
            <div className="text-2xl font-bold text-white mt-0.5">{resolvedCount}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5 flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Critical Rules</div>
            <div className="text-2xl font-bold text-white mt-0.5">{criticalCount}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5 flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg MTTR (AI Heal)</div>
            <div className="text-2xl font-bold text-white mt-0.5">4.2s</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-3.5">
        <div className="flex items-center gap-2">
          {(['all', 'firing', 'resolved'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                statusFilter === tab
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40'
              }`}
            >
              {tab} Alerts
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Severity:</span>
          {['all', 'critical', 'warning', 'info'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                severityFilter === sev
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed List */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="py-12 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
            <RefreshCw className="h-6 w-6 animate-spin text-amber-400 mx-auto mb-2" />
            Fetching live Alertmanager incidents...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            <p className="text-white font-medium">All Clear! No alerts matching filter.</p>
            <p className="text-xs text-slate-500">Prometheus is actively monitoring cluster health rules.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isFiring = alert.status === 'firing';
            const isCritical = alert.severity === 'critical';
            return (
              <div
                key={alert.id}
                className={`bg-slate-900/70 backdrop-blur-xl border rounded-2xl p-5 transition-all shadow-lg ${
                  isFiring
                    ? 'border-rose-500/40 shadow-rose-500/5 ring-1 ring-rose-500/20'
                    : 'border-slate-800/80 hover:border-slate-700/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl border mt-0.5 ${
                      isCritical
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : alert.severity === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    }`}>
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-base font-bold text-white">{alert.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : alert.severity === 'warning'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{alert.description}</p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    isFiring
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/40 animate-pulse'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {isFiring ? <Flame className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    {alert.status.toUpperCase()}
                  </span>
                </div>

                {/* Metadata details */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                  {alert.pod && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Pod:</span>
                      <span className="font-mono text-cyan-400">{alert.pod}</span>
                    </div>
                  )}
                  {alert.namespace && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Namespace:</span>
                      <span className="font-mono text-slate-300">{alert.namespace}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Triggered:</span>
                    <span className="text-slate-300">{alert.startsAt}</span>
                  </div>
                  {alert.promQL && (
                    <div className="w-full flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-400 overflow-x-auto">
                      <Terminal className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span>{alert.promQL}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
