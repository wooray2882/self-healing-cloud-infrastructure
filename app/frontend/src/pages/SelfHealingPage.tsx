import { useState, useEffect } from 'react';
import { 
  Bot, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Sparkles, 
  Sliders 
} from 'lucide-react';

interface Playbook {
  id: string;
  name: string;
  status: string;
  trigger: string;
  action: string;
  confidence: string;
}

interface HealingEvent {
  id: number;
  action: string;
  target: string;
  time: string;
  status: 'success' | 'remediating' | 'failed';
  pct: number;
  details?: string;
}

export default function SelfHealingPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [events, setEvents] = useState<HealingEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRemediations = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('http://localhost:4000/api/cluster/remediations');
      if (res.ok) {
        const data = await res.json();
        setPlaybooks(data.activePlaybooks || []);
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Failed to load remediations:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRemediations();
    const interval = setInterval(fetchRemediations, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Bot className="h-7 w-7 text-cyan-400" />
            Autonomous Self-Healing Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Amazon Bedrock powered AI reasoning, automated runbooks, and closed-loop Kubernetes remediation
          </p>
        </div>
        <button
          onClick={fetchRemediations}
          disabled={refreshing}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          Refresh
        </button>
      </div>

      {/* AI Engine Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Bot className="h-48 w-48 text-cyan-400" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> AI Engine Active
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Guardrails Enforced
            </span>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            Zero-Human Intervention Cluster Autopilot
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mb-6">
            HealOps ingests real-time Prometheus alert webhooks, translates anomaly metrics into context-rich prompts for Amazon Bedrock AI Agents, evaluates safety guardrails, and executes Kubernetes mutations autonomously within seconds.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Mean Time to Heal</div>
              <div className="text-xl font-bold text-cyan-400 mt-0.5">4.2s</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Success Rate</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">98.4%</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Active Playbooks</div>
              <div className="text-xl font-bold text-white mt-0.5">4 Runbooks</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Security Isolation</div>
              <div className="text-xl font-bold text-indigo-400 mt-0.5">AWS IRSA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Autonomous Playbooks Grid */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Sliders className="h-5 w-5 text-indigo-400" />
          Active Self-Healing Runbooks
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
          {playbooks.map(pb => (
            <div 
              key={pb.id}
              className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-lg group"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {pb.name}
                    </h3>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="h-3 w-3" /> Auto-Remediation {pb.status}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-full font-bold">
                  {pb.confidence} Conf.
                </span>
              </div>

              <div className="space-y-2 text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 my-3">
                <div>
                  <span className="text-slate-500 font-medium">Trigger Condition:</span>{' '}
                  <span className="font-mono text-amber-300">{pb.trigger}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Remediation Action:</span>{' '}
                  <span className="text-slate-200">{pb.action}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Audit Trail / Event History */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-cyan-400" />
          Autonomous Remediation Event Log
        </h2>

        <div className="divide-y divide-slate-800/60">
          {events.map(ev => (
            <div key={ev.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/20 rounded-xl px-2 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white font-mono">{ev.action}</div>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>Target: <strong className="text-slate-200">{ev.target}</strong></span>
                    <span>•</span>
                    <span className="text-slate-500">{ev.details}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-500 font-mono">{ev.time}</span>
                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
                  100% Healed
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
