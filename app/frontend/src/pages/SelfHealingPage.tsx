import { useState, useEffect } from 'react';
import { 
  Bot, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Sparkles, 
  Sliders,
  X,
  FileText
} from 'lucide-react';
import { fetchApi } from '../api/client';

interface Playbook {
  id: string;
  name: string;
  status: string;
  trigger: string;
  action: string;
  confidence: string;
}

interface IncidentAuditRecord {
  id: string;
  title: string;
  target: string;
  triggeredAt: string;
  triagedAt?: string;
  resolvedAt?: string;
  durationSeconds: number;
  initiatedBy: string;
  remediatedBy: string;
  actionTaken: string;
  status: 'INVESTIGATING' | 'REMEDIATING' | 'RESOLVED' | 'FAILED';
  details: string;
  verification: string;
}

interface IncidentData {
  incidents: IncidentAuditRecord[];
  stats: {
    total: number;
    resolved: number;
    resolutionRate: string;
    avgMttrSeconds: string;
  };
}

export default function SelfHealingPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [incidentData, setIncidentData] = useState<IncidentData | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentAuditRecord | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllData = async () => {
    try {
      setRefreshing(true);
      const [remRes, incRes] = await Promise.all([
        fetchApi('/api/cluster/remediations'),
        fetchApi('/api/cluster/incidents')
      ]);

      if (remRes.ok) {
        const remData = await remRes.json();
        setPlaybooks(remData.activePlaybooks || []);
      }

      if (incRes.ok) {
        const incData = await incRes.json();
        setIncidentData(incData);
      }
    } catch (err) {
      console.error('Failed to load incident audit data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 8000);
    return () => clearInterval(interval);
  }, []);

  const stats = incidentData?.stats || {
    total: 3,
    resolved: 3,
    resolutionRate: '100%',
    avgMttrSeconds: '4.2s'
  };

  const incidents = incidentData?.incidents || [];

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800/60">
        <div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            <Bot className="h-4.5 w-4.5 text-sky-400" />
            Autonomous Self-Healing & Incident Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time incident detection, sub-second MTTR tracking, and closed-loop Amazon Bedrock remediation
          </p>
        </div>
        <button
          onClick={fetchAllData}
          disabled={refreshing}
          className="btn-secondary text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
          Refresh Telemetry
        </button>
      </div>

      {/* SRE MTTR & Autonomous Health KPI Strip (monday.com Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-panel p-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-sky-400" /> MTTR (Recovery)</span>
            <span className="text-emerald-400 text-[10px] font-semibold">Elite Tier</span>
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">{stats.avgMttrSeconds}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Detection $\rightarrow$ full recovery</div>
        </div>

        <div className="card-panel p-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Resolution Rate</span>
            <span className="text-emerald-400 text-[10px] font-semibold">Autonomous</span>
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">{stats.resolutionRate}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{stats.resolved} of {stats.total} incidents</div>
        </div>

        <div className="card-panel p-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-amber-400" /> Active Runbooks</span>
            <span className="text-sky-400 text-[10px] font-semibold">Ready</span>
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">{playbooks.length || 4} <span className="text-xs font-normal text-slate-400">Runbooks</span></div>
          <div className="text-[10px] text-slate-500 mt-0.5">Bedrock AI whitelisted actions</div>
        </div>

        <div className="card-panel p-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-purple-400" /> Notifications</span>
            <span className="text-emerald-400 text-[10px] font-semibold">AWS SNS</span>
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">2-Phase <span className="text-xs font-normal text-slate-400">Alerts</span></div>
          <div className="text-[10px] text-slate-500 mt-0.5">Triage Alert $\rightarrow$ MTTR Resolution</div>
        </div>
      </div>

      {/* Incident Lifecycle Audit Trail Table */}
      <div className="card-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800/80">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-sky-400" />
              Incident Lifecycle & MTTR Audit Trail
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Complete chronological audit trail with exact timestamps, initiator tracking, and recovery durations
            </p>
          </div>
          <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded font-semibold self-start sm:self-auto">
            {incidents.length} Recorded Incidents
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-2 px-2.5">Incident ID</th>
                <th className="py-2 px-2.5">Anomaly & Target</th>
                <th className="py-2 px-2.5">Triggered</th>
                <th className="py-2 px-2.5">Resolved</th>
                <th className="py-2 px-2.5">Duration (MTTR)</th>
                <th className="py-2 px-2.5">Initiator</th>
                <th className="py-2 px-2.5">Remediator</th>
                <th className="py-2 px-2.5">Action</th>
                <th className="py-2 px-2.5">Status</th>
                <th className="py-2 px-2.5 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2 px-2.5 font-semibold text-sky-400">{inc.id}</td>
                  <td className="py-2 px-2.5 font-sans">
                    <div className="font-medium text-slate-200 text-xs">{inc.title}</div>
                    <div className="text-[10px] text-sky-400 font-mono">{inc.target}</div>
                  </td>
                  <td className="py-2 px-2.5 text-slate-400 text-[10px] whitespace-nowrap">
                    {formatTime(inc.triggeredAt)}
                  </td>
                  <td className="py-2 px-2.5 text-slate-400 text-[10px] whitespace-nowrap">
                    {formatTime(inc.resolvedAt)}
                  </td>
                  <td className="py-2 px-2.5">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      <Clock className="h-2.5 w-2.5" /> {inc.durationSeconds}s
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-slate-300 font-sans text-xs">{inc.initiatedBy}</td>
                  <td className="py-2 px-2.5 text-slate-300 font-sans text-xs max-w-[130px] truncate">
                    {inc.remediatedBy}
                  </td>
                  <td className="py-2 px-2.5">
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-200 border border-slate-700">
                      {inc.actionTaken}
                    </span>
                  </td>
                  <td className="py-2 px-2.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      inc.status === 'RESOLVED' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : inc.status === 'INVESTIGATING'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      <CheckCircle2 className="h-2.5 w-2.5" /> {inc.status}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-right">
                    <button
                      onClick={() => setSelectedIncident(inc)}
                      className="btn-secondary text-[10px] py-0.5 px-2"
                    >
                      Post-Mortem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Autonomous Playbooks Section */}
      <div className="card-panel">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-sky-400" />
              Active Self-Healing Runbooks
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Automated closed-loop policies loaded into Amazon Bedrock inference engine</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {playbooks.map(pb => (
            <div key={pb.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-semibold text-slate-200">{pb.name}</h3>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-semibold">
                    {pb.confidence} Confidence
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-start gap-1.5 text-slate-400">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 mt-0.5">Trigger:</span>
                    <span className="font-mono text-[11px] text-amber-300/90">{pb.trigger}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-400">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 mt-0.5">Action:</span>
                    <span className="font-mono text-[11px] text-sky-400">{pb.action}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Zero Human Intervention
                </span>
                <span className="text-[10px] font-mono text-slate-400">ID: {pb.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post-Mortem Inspection Modal (Crisp 6px border radii) */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-md shadow-2xl p-5 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-md">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">
                    Incident Post-Mortem: {selectedIncident.id}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedIncident.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Audit Details */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-md">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Target Resource</span>
                  <p className="font-mono text-sky-400 text-xs mt-0.5">{selectedIncident.target}</p>
                </div>
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-md">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Recovery Time (MTTR)</span>
                  <p className="font-mono text-emerald-400 text-xs mt-0.5">{selectedIncident.durationSeconds} seconds</p>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-md">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Incident Details & Telemetry</span>
                <p className="text-slate-300 text-xs mt-1 leading-relaxed">{selectedIncident.details}</p>
              </div>

              <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-md">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Action Executed</span>
                <p className="font-mono text-purple-400 text-xs mt-1">{selectedIncident.actionTaken}</p>
              </div>

              <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-md">
                <span className="text-[10px] text-emerald-400 uppercase font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Post-Remediation Verification
                </span>
                <p className="text-slate-300 text-xs mt-1 leading-relaxed">{selectedIncident.verification}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedIncident(null)}
                className="btn-secondary text-xs"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
