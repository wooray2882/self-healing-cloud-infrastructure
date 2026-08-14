import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Trash2, 
  Cpu, 
  HardDrive, 
  WifiOff, 
  X, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { fetchApi } from '../../api/client';
import { useNotifications } from '../../context/NotificationContext';
import type { NotificationItem } from '../../context/NotificationContext';

interface QuickChaosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickChaosModal({ isOpen, onClose }: QuickChaosModalProps) {
  const navigate = useNavigate();
  const { showToast, addNotification } = useNotifications();
  const [runningScenario, setRunningScenario] = useState<string | null>(null);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'cpu_spike',
      name: 'CPU Exhaustion Lock',
      icon: Cpu,
      color: 'text-amber-400',
      badge: 'Compute Saturation',
      description: 'Simulates 100% CPU lock on healops-backend. Triggers Prometheus alert & Bedrock AI auto-scale.',
      target: 'deployment/healops-backend',
      payload: 'cpu_spike'
    },
    {
      id: 'pod_kill',
      name: 'Pod Eviction / Crash',
      icon: Trash2,
      color: 'text-rose-400',
      badge: 'Pod Death',
      description: 'Force-terminates active pod replica. Proves zero-downtime Kubernetes self-healing.',
      target: 'pod/healops-backend-*',
      payload: 'pod_kill'
    },
    {
      id: 'memory_pressure',
      name: 'Memory Leak Stress',
      icon: HardDrive,
      color: 'text-sky-400',
      badge: 'CGroup Limit',
      description: 'Consumes memory to 85% threshold. Validates Alertmanager webhook ingestion before OOMKill.',
      target: 'cgroup/memory',
      payload: 'memory_pressure'
    },
    {
      id: 'network_loss',
      name: 'Network Latency Drop',
      icon: WifiOff,
      color: 'text-purple-400',
      badge: 'Endpoint Drift',
      description: 'Injects 400ms roundtrip delay to test readiness probe traffic rerouting.',
      target: 'svc/healops-frontend-svc',
      payload: 'network_loss'
    }
  ];

  const handleInject = async (scenario: typeof scenarios[0]) => {
    setRunningScenario(scenario.id);
    showToast('warning', `🔥 Injecting Fault: ${scenario.name}...`);

    try {
      const res = await fetchApi('/api/chaos/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenario.payload, initiator: 'Ray Woo (Quick Chaos Topbar)' })
      });

      if (res.ok) {
        const json = await res.json();
        const incId = json.incidentId || 'INC-' + Math.floor(1000 + Math.random() * 9000);

        const newIncident: NotificationItem = {
          id: incId.toLowerCase(),
          type: 'incident',
          severity: 'critical',
          title: `Incident ${incId} (${scenario.name})`,
          summary: `Fault injected on ${scenario.target}. Prometheus Alertmanager firing into Bedrock AI remediation engine.`,
          target: scenario.target,
          remediationAction: 'SCALE_UP / RESTART (Autonomous)',
          mttr: '4.2s',
          time: 'Just now',
          link: '/self-healing'
        };

        addNotification(newIncident);
        showToast('error', `🚨 [${incId}] Firing: ${scenario.name} active on cluster!`);
      }
    } catch (err: any) {
      showToast('error', `Fault injection failed: ${err.message || 'Network error'}`);
    } finally {
      setRunningScenario(null);
    }
  };

  const handleOpenFullLab = () => {
    onClose();
    navigate('/chaos');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-md max-w-lg w-full p-5 shadow-2xl space-y-3.5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-md">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                Quick Chaos Fault Injection
                <span className="bg-rose-600 text-white text-[9px] font-bold uppercase px-1.5 py-0.2 rounded">
                  Live Action
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Trigger real-time Prometheus anomalies and Bedrock AI self-healing
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Safety Note */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-md p-2.5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 text-[11px]">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Safety Guardrails: Amazon Bedrock AI actively enforces cluster auto-recovery.</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-semibold">GUARDRAILS ON</span>
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isRunning = runningScenario === sc.id;
            return (
              <div 
                key={sc.id}
                className="card-panel p-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-3.5 w-3.5 ${sc.color}`} />
                      <h3 className="text-xs font-semibold text-white">{sc.name}</h3>
                    </div>
                    <span className="text-[9px] font-mono bg-slate-800 text-slate-300 px-1 py-0.2 rounded border border-slate-700">
                      {sc.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                    {sc.description}
                  </p>
                </div>

                <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-slate-500 truncate max-w-[120px]">
                    {sc.target}
                  </span>

                  <button
                    onClick={() => handleInject(sc)}
                    disabled={isRunning}
                    className="btn-danger text-[10px] py-1 px-2 shrink-0"
                  >
                    <Flame className={`h-3 w-3 ${isRunning ? 'animate-spin' : ''}`} />
                    {isRunning ? 'Injecting...' : 'Inject Fault'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleOpenFullLab}
            className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition-colors"
          >
            Open Full Chaos Engineering Lab <ExternalLink className="h-3 w-3" />
          </button>

          <button
            onClick={onClose}
            className="btn-secondary text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
