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
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send
} from 'lucide-react';
import { fetchApi } from '../../api/client';
import { useNotifications } from '../../context/NotificationContext';

interface QuickChaosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickChaosModal({ isOpen, onClose }: QuickChaosModalProps) {
  const navigate = useNavigate();
  const { showToast } = useNotifications();
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'guided' | 'manual'>('guided');

  if (!isOpen) return null;

  const guidedScenarios = [
    {
      id: 'guided_auto_healed',
      name: '1. Crash Loop — Auto-Healed',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      badge: 'High Confidence (94%)',
      description: 'Routine pod crash. Confidence (94% >= 85%) triggers clean automated self-healing.',
      payload: 'guided_auto_healed'
    },
    {
      id: 'guided_circuit_breaker',
      name: '2. Crash Loop — Circuit Breaker',
      icon: AlertTriangle,
      color: 'text-rose-400',
      badge: 'Circuit Breaker',
      description: 'Simulates 3 failed attempts in 15 mins. Auto-healing stops and escalates to human.',
      payload: 'guided_circuit_breaker'
    },
    {
      id: 'guided_low_confidence',
      name: '3. Low-Confidence Anomaly',
      icon: Clock,
      color: 'text-amber-400',
      badge: '<85% Confidence',
      description: 'Ambiguous anomaly (74%). Lands in pending_approval with Bedrock reasoning & Approve buttons.',
      payload: 'guided_low_confidence'
    },
    {
      id: 'guided_notification_walkthrough',
      name: '4. Notification Walkthrough',
      icon: Send,
      color: 'text-purple-400',
      badge: 'Bedrock SNS',
      description: 'Bedrock 4-sentence plain-English summary dispatched to SNS email + Socket.io toast.',
      payload: 'guided_notification_walkthrough'
    }
  ];

  const manualScenarios = [
    {
      id: 'cpu_spike',
      name: 'CPU Exhaustion Lock',
      icon: Cpu,
      color: 'text-amber-400',
      badge: 'Compute Load',
      description: 'Simulates 100% CPU lock on healops-backend. Triggers Prometheus alert & Bedrock AI auto-scale.',
      payload: 'cpu_spike'
    },
    {
      id: 'pod_kill',
      name: 'Pod Eviction / Crash',
      icon: Trash2,
      color: 'text-rose-400',
      badge: 'Pod Death',
      description: 'Force-terminates active pod replica. Proves zero-downtime Kubernetes self-healing.',
      payload: 'pod_kill'
    },
    {
      id: 'memory_pressure',
      name: 'Memory Leak Stress',
      icon: HardDrive,
      color: 'text-sky-400',
      badge: 'CGroup Limit',
      description: 'Consumes memory to 85% threshold. Validates Alertmanager webhook ingestion before OOMKill.',
      payload: 'memory_pressure'
    },
    {
      id: 'network_loss',
      name: 'Network Latency Drop',
      icon: WifiOff,
      color: 'text-purple-400',
      badge: 'Endpoint Drift',
      description: 'Injects 400ms roundtrip delay to test readiness probe traffic rerouting.',
      payload: 'network_loss'
    }
  ];

  const handleInject = async (payload: string, name: string) => {
    setRunningScenario(payload);
    showToast('info', `Running: ${name}...`);

    try {
      const res = await fetchApi('/api/chaos/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: payload, initiator: 'Reviewer (Quick Chaos Modal)' })
      });

      if (res.ok) {
        showToast('success', `✓ ${name} executed! Check /incidents page for details.`);
      }
    } catch (err: any) {
      showToast('error', `Execution failed: ${err.message || 'Network error'}`);
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
                Chaos & Guided Showcase Suite
                <span className="bg-purple-600 text-white text-[9px] font-bold uppercase px-1.5 py-0.2 rounded">
                  Demo Ready
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                1-Click reviewer demonstrations & Kubernetes fault injection
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

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('guided')}
            className={`flex-1 py-1 px-3 rounded font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'guided' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> Guided Showcase
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-1 px-3 rounded font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'manual' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-rose-400" /> Manual Fault Injection
          </button>
        </div>

        {/* Safety Note */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-md p-2.5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 text-[11px]">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Safety Guardrails: Amazon Bedrock AI actively enforces policy guardrails.</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-semibold">GUARDRAILS ON</span>
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {(activeTab === 'guided' ? guidedScenarios : manualScenarios).map((sc) => {
            const Icon = sc.icon;
            const isRunning = runningScenario === sc.payload;
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
                    {sc.payload}
                  </span>

                  <button
                    onClick={() => handleInject(sc.payload, sc.name)}
                    disabled={isRunning}
                    className={activeTab === 'guided' ? 'btn-primary text-[10px] py-1 px-2 shrink-0 bg-purple-600 hover:bg-purple-500' : 'btn-danger text-[10px] py-1 px-2 shrink-0'}
                  >
                    {isRunning ? 'Running...' : 'Run Scenario'}
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
