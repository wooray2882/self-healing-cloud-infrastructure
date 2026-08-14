import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  Check, 
  Sparkles
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import type { NotificationItem } from '../context/NotificationContext';
import { fetchApi } from '../api/client';

export default function IncidentsPage() {
  const navigate = useNavigate();
  const { notifications, dismissNotification, clearAllNotifications, showToast, addNotification } = useNotifications();
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateIncident = async () => {
    setIsSimulating(true);
    try {
      showToast('warning', 'Injecting CPU fault to trigger live Alertmanager webhook...');
      const res = await fetchApi('/api/chaos/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'cpu_spike', initiator: 'Ray Woo (Incident Console)' })
      });

      if (res.ok) {
        const json = await res.json();
        const incId = json.incidentId || 'INC-' + Math.floor(1000 + Math.random() * 9000);
        
        const newIncident: NotificationItem = {
          id: incId.toLowerCase(),
          type: 'incident',
          severity: 'critical',
          title: `Incident ${incId} (CPU Saturation Alert)`,
          summary: 'Prometheus HighCPUUsage webhook ingested. Bedrock AI actively executing autonomous HPA scale-out.',
          target: 'deployment/healops-backend',
          remediationAction: 'SCALE_UP (Autonomous AI)',
          mttr: '3.8s',
          time: 'Just now',
          link: '/self-healing'
        };

        addNotification(newIncident);
        showToast('error', `🚨 [${incId}] Critical Anomaly Detected: CPU > 85% on healops-backend!`);
      }
    } catch (err: any) {
      showToast('error', `Failed to trigger incident: ${err.message || 'Network error'}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDismiss = (id: string, title: string) => {
    dismissNotification(id);
    showToast('success', `Acknowledged and dismissed: ${title}`);
  };

  const handleNavigateAndDismiss = (item: NotificationItem) => {
    dismissNotification(item.id);
    navigate(item.link);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="bg-rose-600 text-white font-semibold px-2 py-0.5 rounded text-[10px] uppercase shadow-sm">CRITICAL</span>;
      case 'warning':
        return <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase shadow-sm">WARNING</span>;
      case 'healthy':
        return <span className="bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded text-[10px] uppercase shadow-sm">VERIFIED</span>;
      default:
        return <span className="bg-slate-700 text-white font-semibold px-2 py-0.5 rounded text-[10px] uppercase shadow-sm">INFO</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800/60">
        <div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
            Incident Management & Live Remediations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Active Prometheus rule violations, Bedrock AI remediation tracking, and notification sync
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateIncident}
            disabled={isSimulating}
            className="btn-danger text-xs"
          >
            <Flame className={`h-3.5 w-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? 'Simulating...' : 'Simulate New Incident'}
          </button>
          
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="btn-secondary text-xs"
              title="Acknowledge and dismiss all"
            >
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              Acknowledge All
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-panel p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Active Incidents</span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">
            {notifications.length} <span className="text-xs font-normal text-slate-400">Unacknowledged</span>
          </div>
        </div>

        <div className="card-panel p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>SRE MTTR Avg</span>
            <Clock className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">4.2s</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Autonomous AI resolution</div>
        </div>

        <div className="card-panel p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Remediation Engine</span>
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">Bedrock AI</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Closed-loop policy guardrails</div>
        </div>

        <div className="card-panel p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Alerting Protocol</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">AWS SNS</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Live Email Dispatch active</div>
        </div>
      </div>

      {/* Incidents Feed & Sync Table */}
      {notifications.length === 0 ? (
        /* Empty State */
        <div className="card-panel py-12 px-4 text-center flex flex-col items-center justify-center gap-3">
          <div className="p-3 bg-emerald-600 text-white rounded-md shadow-md">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">All Caught Up! Zero Active Incidents</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              All incident alerts have been acknowledged and cleared from your notification center. Prometheus Alertmanager is continuously probing cluster health.
            </p>
          </div>
          <button
            onClick={handleSimulateIncident}
            className="btn-primary text-xs mt-1"
          >
            <Flame className="h-3.5 w-3.5" /> Trigger Test Incident
          </button>
        </div>
      ) : (
        /* Active Incidents List */
        <div className="space-y-2.5">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="card-panel p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="shrink-0 mt-0.5">
                  {getSeverityBadge(item.severity)}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 
                      onClick={() => handleNavigateAndDismiss(item)}
                      className="text-xs font-semibold text-white hover:text-sky-400 cursor-pointer transition-colors"
                    >
                      {item.title}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">• {item.time}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                    {item.target && (
                      <span className="flex items-center gap-1">
                        <span className="text-slate-500">Target:</span>
                        <code className="font-mono text-sky-400">{item.target}</code>
                      </span>
                    )}
                    {item.remediationAction && (
                      <span className="flex items-center gap-1">
                        <span className="text-slate-500">Action:</span>
                        <span className="text-purple-400 font-mono">{item.remediationAction}</span>
                      </span>
                    )}
                    {item.mttr && (
                      <span className="flex items-center gap-1">
                        <span className="text-slate-500">MTTR:</span>
                        <span className="text-emerald-400 font-semibold">{item.mttr}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleNavigateAndDismiss(item)}
                  className="btn-secondary text-[11px] py-1 px-2.5"
                  title="Navigate to resource & clear alert"
                >
                  View Details <ExternalLink className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleDismiss(item.id, item.title)}
                  className="btn-secondary text-[11px] py-1 px-2 text-slate-300 hover:text-emerald-400"
                  title="Acknowledge & Remove"
                >
                  <Check className="h-3.5 w-3.5" />
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
