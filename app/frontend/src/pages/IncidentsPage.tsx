import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Check, 
  Sparkles,
  RefreshCw,
  XCircle,
  Wrench,
  Bot
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { fetchApi } from '../api/client';
import { io } from 'socket.io-client';

export interface IncidentAttempt {
  timestamp: string;
  action: string;
  outcome: 'success' | 'failed';
}

export interface IncidentRecord {
  id: string;
  title: string;
  targetResource: string;
  confidence: number;
  reasoning: string;
  proposedAction: string;
  status: 'pending_approval' | 'remediated' | 'escalated' | 'rejected' | 'resolved';
  humanSummary: string;
  attempts: IncidentAttempt[];
  createdAt: string;
  updatedAt: string;
}

export default function IncidentsPage() {
  const { showToast } = useNotifications();
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/api/incidents');
      if (res.ok) {
        const json = await res.json();
        setIncidents(json);
      }
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();

    const socket = io(window.location.port === '5173' ? 'http://localhost:4000' : undefined, {
      transports: ['websocket', 'polling'],
      upgrade: true
    });

    socket.on('incident_created', (newIncident: IncidentRecord) => {
      setIncidents(prev => [newIncident, ...prev.filter(inc => inc.id !== newIncident.id)]);
      showToast('warning', `⚠️ New Incident Alert: ${newIncident.id} (${newIncident.status})`);
    });

    socket.on('incident_updated', (updated: IncidentRecord) => {
      setIncidents(prev => prev.map(inc => inc.id === updated.id ? updated : inc));
      showToast('success', `Status updated for Incident ${updated.id}: ${updated.status}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleApprove = async (id: string) => {
    try {
      showToast('info', `Executing approved remediation for ${id}...`);
      const res = await fetchApi(`/api/incidents/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setIncidents(prev => prev.map(inc => inc.id === id ? json.incident : inc));
        showToast('success', `✓ Incident ${id} approved & remediated!`);
      }
    } catch (err: any) {
      showToast('error', `Failed to approve incident: ${err.message}`);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetchApi(`/api/incidents/${id}/reject`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setIncidents(prev => prev.map(inc => inc.id === id ? json.incident : inc));
        showToast('info', `Incident ${id} rejected. No cluster changes made.`);
      }
    } catch (err: any) {
      showToast('error', `Failed to reject incident: ${err.message}`);
    }
  };

  const handleSimulateLowConfidence = async () => {
    setSimulating(true);
    try {
      showToast('info', 'Simulating low-confidence anomaly payload (<85%)...');
      const res = await fetchApi('/api/incidents/simulate-low-confidence', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setIncidents(prev => [json.incident, ...prev.filter(i => i.id !== json.incident.id)]);
        showToast('warning', `Simulated Low-Confidence Incident ${json.incident.id} Created!`);
      }
    } catch (err: any) {
      showToast('error', `Simulation failed: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const handleSimulateCircuitBreaker = async () => {
    setSimulating(true);
    try {
      showToast('info', 'Simulating 3 consecutive remediation failures...');
      const res = await fetchApi('/api/incidents/simulate-circuit-breaker', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setIncidents(prev => [json.incident, ...prev.filter(i => i.id !== json.incident.id)]);
        showToast('error', `🚨 Circuit Breaker Tripped: ${json.incident.id} Escalated!`);
      }
    } catch (err: any) {
      showToast('error', `Simulation failed: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return (
          <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase shadow-sm flex items-center gap-1">
            <Clock className="h-3 w-3" /> PENDING APPROVAL
          </span>
        );
      case 'escalated':
        return (
          <span className="bg-rose-600 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase shadow-sm flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> ESCALATED (CIRCUIT BREAKER)
          </span>
        );
      case 'remediated':
      case 'resolved':
        return (
          <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase shadow-sm flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> REMEDIATED
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-slate-700 text-white font-semibold px-2 py-0.5 rounded text-[10px] uppercase shadow-sm flex items-center gap-1">
            <XCircle className="h-3 w-3" /> REJECTED
          </span>
        );
      default:
        return (
          <span className="bg-sky-600 text-white font-semibold px-2 py-0.5 rounded text-[10px] uppercase shadow-sm">
            {status}
          </span>
        );
    }
  };

  const pendingCount = incidents.filter(i => i.status === 'pending_approval').length;
  const escalatedCount = incidents.filter(i => i.status === 'escalated').length;

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800/60">
        <div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
            Incidents & Human Escalation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Low-confidence alerts, circuit breaker escalations, and Bedrock plain-English summaries
          </p>
        </div>
        
        {/* Demo Simulation Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSimulateLowConfidence}
            disabled={simulating}
            className="btn-secondary text-xs"
            title="Simulate <85% confidence incident requiring approval"
          >
            <Bot className="h-3.5 w-3.5 text-amber-400" />
            Test Low-Confidence (&lt;85%)
          </button>
          <button
            onClick={handleSimulateCircuitBreaker}
            disabled={simulating}
            className="btn-danger text-xs"
            title="Simulate 3 failed remediation attempts"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Test Circuit Breaker
          </button>
          <button
            onClick={fetchIncidents}
            disabled={loading}
            className="btn-secondary text-xs"
            title="Refresh incident list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-panel p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Pending Approval</span>
            <Clock className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white font-mono mt-1">
            {pendingCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">&lt;85% confidence score</div>
        </div>

        <div className="card-panel p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Circuit Breaker</span>
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white font-mono mt-1">
            {escalatedCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">3 failed tries / 15m window</div>
        </div>

        <div className="card-panel p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>AI Summaries</span>
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white font-mono mt-1">Bedrock</div>
          <div className="text-[10px] text-slate-400 mt-0.5">4-sentence plain English</div>
        </div>

        <div className="card-panel p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Alerting</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white font-mono mt-1">SNS + WebSockets</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Real-time live push</div>
        </div>
      </div>

      {/* Incidents Feed */}
      <div className="space-y-3">
        {incidents.length === 0 ? (
          <div className="card-panel py-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-md">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-sm font-semibold text-white">Zero Active Incidents</h3>
            <p className="text-xs text-slate-400 max-w-md">
              All incident alerts are clear. Use the test buttons above to simulate low-confidence or circuit breaker scenarios.
            </p>
          </div>
        ) : (
          incidents.map((incident) => (
            <div
              key={incident.id}
              className={`card-panel p-4 flex flex-col gap-3 transition-all ${
                incident.status === 'pending_approval'
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : incident.status === 'escalated'
                    ? 'border-rose-500/40 bg-rose-500/5'
                    : 'border-slate-800'
              }`}
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-sky-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {incident.id}
                  </span>
                  <h3 className="text-xs sm:text-sm font-semibold text-white">
                    {incident.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400">
                    Confidence: <strong className={incident.confidence < 85 ? 'text-amber-400' : 'text-emerald-400'}>{incident.confidence}%</strong>
                  </span>
                  {getStatusBadge(incident.status)}
                </div>
              </div>

              {/* Natural Language Bedrock Summary */}
              <div className="bg-slate-950/80 p-3 rounded-md border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-purple-400 mb-1">
                  <Sparkles className="h-3 w-3" />
                  Bedrock Plain-English Summary
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {incident.humanSummary}
                </p>
              </div>

              {/* Failed Attempt History for Escalated Incidents */}
              {incident.attempts && incident.attempts.length > 0 && (
                <div className="bg-slate-900/90 p-2.5 rounded-md border border-slate-800 text-xs">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Remediation Attempt Log ({incident.attempts.length} attempts in 15m window)
                  </div>
                  <div className="space-y-1 font-mono text-[10px]">
                    {incident.attempts.map((att, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-300">
                        <span>Try #{idx + 1}: {att.action} ({att.timestamp})</span>
                        <span className={att.outcome === 'success' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {att.outcome.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Reasoning Expandable */}
              <div>
                <button
                  onClick={() => setExpandedId(expandedId === incident.id ? null : incident.id)}
                  className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold"
                >
                  {expandedId === incident.id ? 'Hide Technical Reasoning' : 'View Technical Reasoning'}
                </button>
                {expandedId === incident.id && (
                  <div className="mt-2 p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-slate-400 block mb-1">AI Reasoning:</strong>
                    {incident.reasoning}
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <span className="text-[10px] text-slate-400 font-mono">
                  Target: <code className="text-sky-400">{incident.targetResource}</code>
                </span>

                <div className="flex items-center gap-2">
                  {incident.status === 'pending_approval' && (
                    <>
                      <button
                        onClick={() => handleReject(incident.id)}
                        className="btn-secondary text-[11px] py-1 px-3 text-slate-300 hover:text-rose-400"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => handleApprove(incident.id)}
                        className="btn-primary text-[11px] py-1 px-3 bg-emerald-600 hover:bg-emerald-500"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve & Execute Fix
                      </button>
                    </>
                  )}

                  {incident.status === 'escalated' && (
                    <button
                      onClick={() => handleApprove(incident.id)}
                      className="btn-primary text-[11px] py-1 px-3 bg-sky-600 hover:bg-sky-500"
                    >
                      <Wrench className="h-3.5 w-3.5" /> Fix Manually
                    </button>
                  )}

                  {(incident.status === 'remediated' || incident.status === 'resolved' || incident.status === 'rejected') && (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Incident Closed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
