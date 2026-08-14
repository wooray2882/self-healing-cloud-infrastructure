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
import { fetchApi } from '../api/client';

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
      const res = await fetchApi('/api/cluster/alerts');
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
      const res = await fetchApi('/api/chaos/inject', {
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
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800/60">
        <div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
            Alertmanager Incident Stream
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Prometheus rule evaluations, active firing states, and automated dispatch routes
          </p>
        </div>
        <div className="flex items-center gap-2">
          {actionMessage && (
            <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-md animate-pulse">
              {actionMessage}
            </span>
          )}
          <button
            onClick={triggerTestAlert}
            className="btn-danger text-xs"
          >
            <Flame className="h-3.5 w-3.5" />
            Trigger Test Alert
          </button>
          <button
            onClick={fetchAlerts}
            disabled={refreshing}
            className="btn-secondary text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary KPI Cards (monday.com Minimalist Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-panel p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Firing Alerts</span>
            <Flame className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">{firingCount}</div>
        </div>

        <div className="card-panel p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Resolved (24h)</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">{resolvedCount}</div>
        </div>

        <div className="card-panel p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Critical Rules</span>
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">{criticalCount}</div>
        </div>

        <div className="card-panel p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Avg MTTR (AI)</span>
            <Clock className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">4.2s</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card-panel p-2.5 flex flex-col sm:flex-row gap-2.5 justify-between items-center">
        <div className="flex items-center gap-1.5">
          {(['all', 'firing', 'resolved'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${
                statusFilter === tab
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              {tab} Alerts
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] text-slate-500">Severity:</span>
          {['all', 'critical', 'warning', 'info'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-colors ${
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
      <div className="space-y-2.5">
        {loading ? (
          <div className="card-panel py-8 text-center text-slate-400">
            <RefreshCw className="h-5 w-5 animate-spin text-amber-400 mx-auto mb-1.5" />
            <p className="text-xs">Fetching live Alertmanager incidents...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="card-panel py-8 text-center text-slate-400 flex flex-col items-center justify-center gap-1.5">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            <p className="text-white text-xs font-semibold">All Clear! No alerts matching filter.</p>
            <p className="text-[11px] text-slate-500">Prometheus is actively monitoring cluster health rules.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isFiring = alert.status === 'firing';
            const isCritical = alert.severity === 'critical';
            return (
              <div
                key={alert.id}
                className={`card-panel p-3.5 transition-colors ${
                  isFiring ? 'border-rose-500/50 bg-rose-500/5' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 mb-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-md border mt-0.5 ${
                      isCritical
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : alert.severity === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                    }`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-semibold text-white">{alert.name}</h3>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : alert.severity === 'warning'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">{alert.description}</p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${
                    isFiring
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {isFiring ? <Flame className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                    {alert.status.toUpperCase()}
                  </span>
                </div>

                {/* Metadata details */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  {alert.pod && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Pod:</span>
                      <span className="font-mono text-sky-400">{alert.pod}</span>
                    </div>
                  )}
                  {alert.namespace && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Namespace:</span>
                      <span className="font-mono text-slate-300">{alert.namespace}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">Triggered:</span>
                    <span className="text-slate-300">{alert.startsAt}</span>
                  </div>
                  {alert.promQL && (
                    <div className="w-full flex items-center gap-1.5 bg-slate-950 p-1.5 rounded border border-slate-800 font-mono text-[10px] text-slate-400 overflow-x-auto">
                      <Terminal className="h-3 w-3 text-sky-400 shrink-0" />
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
