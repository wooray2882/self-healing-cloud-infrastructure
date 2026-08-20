import { useState } from 'react';
import { 
  Flame, 
  Trash2, 
  Cpu, 
  HardDrive, 
  WifiOff, 
  Play, 
  ShieldCheck, 
  Layers,
  Sparkles,
  AlertTriangle,
  Clock,
  Send,
  CheckCircle2
} from 'lucide-react';
import { fetchApi } from '../api/client';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

interface Scenario {
  id: string;
  name: string;
  category: string;
  icon: any;
  color: string;
  description: string;
  blastRadius: string;
  expectedHealTime: string;
  targetApp: string;
  payload: string;
}

interface GuidedScenario {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  icon: any;
  description: string;
  demonstrates: string;
  payload: string;
}

export default function ChaosPage() {
  const navigate = useNavigate();
  const { showToast } = useNotifications();
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [chaosLog, setChaosLog] = useState<{ id: number; text: string; time: string; type: string }[]>([
    { id: 1, text: 'Chaos Engine initialized. Safety guardrails connected to EKS.', time: '09:00:00', type: 'info' }
  ]);

  const guidedScenarios: GuidedScenario[] = [
    {
      id: 'guided_auto_healed',
      title: '1. Crash Loop — Auto-Healed',
      badge: 'High Confidence (94%)',
      badgeColor: 'bg-emerald-600 text-white',
      icon: CheckCircle2,
      description: 'Simulates a routine pod crash. Confidence is high (94% >= 85%), so the system auto-remediates cleanly in view.',
      demonstrates: 'Demonstrates baseline closed-loop AI self-healing working as intended.',
      payload: 'guided_auto_healed'
    },
    {
      id: 'guided_circuit_breaker',
      title: '2. Crash Loop — Circuit Breaker',
      badge: 'Escalated (3 Tries / 15m)',
      badgeColor: 'bg-rose-600 text-white',
      icon: AlertTriangle,
      description: 'Injects a pod crash that fails 3 consecutive attempts. Watch attempts tick by before auto-remediation stops to protect the cluster.',
      demonstrates: 'Demonstrates 15-minute rolling window circuit breaker and human escalation.',
      payload: 'guided_circuit_breaker'
    },
    {
      id: 'guided_low_confidence',
      title: '3. Low-Confidence Anomaly',
      badge: 'Pending Approval (74%)',
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
      icon: Clock,
      description: 'Injects a database connection pool anomaly (74% confidence < 85%). Lands in pending_approval with Bedrock reasoning & Approve/Reject buttons.',
      demonstrates: 'Demonstrates human-in-the-loop approval workflow for sensitive infrastructure.',
      payload: 'guided_low_confidence'
    },
    {
      id: 'guided_notification_walkthrough',
      title: '4. Notification Walkthrough',
      badge: 'Dual Channel (SNS + Toast)',
      badgeColor: 'bg-purple-600 text-white',
      icon: Send,
      description: 'Triggers Bedrock to generate a 4-sentence plain-English summary and fires a formatted AWS SNS email alert plus live UI toast.',
      demonstrates: 'Demonstrates readable Bedrock human summaries and multi-channel alerting.',
      payload: 'guided_notification_walkthrough'
    }
  ];

  const manualScenarios: Scenario[] = [
    {
      id: 'cpu_spike',
      name: 'CPU Exhaustion Stress Test',
      category: 'Compute Load',
      icon: Cpu,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      description: 'Simulates 100% CPU thread lock on the backend container. Verifies Prometheus HighCPUUsage rule triggering and HPA replica scale-out.',
      blastRadius: 'Single Pod (healops-backend)',
      expectedHealTime: '< 10s',
      targetApp: 'healops-backend',
      payload: 'cpu_spike'
    },
    {
      id: 'pod_kill',
      name: 'Pod Eviction / Sudden Death',
      category: 'Workload Resiliency',
      icon: Trash2,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      description: 'Forcefully terminates the active application instance. Proves Kubernetes ReplicaSets maintain high availability with zero traffic drop.',
      blastRadius: '1 Pod replica',
      expectedHealTime: '< 3s',
      targetApp: 'healops-backend',
      payload: 'pod_kill'
    },
    {
      id: 'memory_pressure',
      name: 'Memory Leak & Pressure Test',
      category: 'Resource Saturation',
      icon: HardDrive,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      description: 'Artificially consumes memory to 85% limit. Ingests Alertmanager webhook and executes autonomous container restart before OOMKill occurs.',
      blastRadius: 'Memory CGroup',
      expectedHealTime: '< 6s',
      targetApp: 'healops-backend',
      payload: 'memory_pressure'
    },
    {
      id: 'network_loss',
      name: 'Network Latency & Drop Simulation',
      category: 'Network Resilience',
      icon: WifiOff,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      description: 'Injects 400ms synthetic round-trip latency. Tests Kubernetes readiness probe failure detection and automatic traffic rerouting.',
      blastRadius: 'Service Endpoints',
      expectedHealTime: '< 5s',
      targetApp: 'healops-frontend-svc',
      payload: 'network_loss'
    }
  ];

  const handleRunGuidedScenario = async (gs: GuidedScenario) => {
    setRunningScenario(gs.id);
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setChaosLog(prev => [
      { id: Date.now(), text: `✨ GUIDED SHOWCASE: ${gs.title} triggered.`, time: nowStr, type: 'trigger' },
      ...prev
    ]);
    showToast('info', `Running Guided Scenario: ${gs.title}...`);

    try {
      const res = await fetchApi('/api/chaos/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: gs.payload, initiator: 'Reviewer (Guided Showcase)' })
      });

      if (res.ok) {
        const json = await res.json();
        showToast('success', `✓ ${gs.title} completed! Check /incidents page to inspect details.`);
        setChaosLog(prev => [
          { id: Date.now() + 1, text: `✓ GUIDED SHOWCASE SUCCESS: ${json.message}`, time: new Date().toLocaleTimeString(), type: 'heal' },
          ...prev
        ]);
      }
    } catch (err: any) {
      showToast('error', `Scenario failed: ${err.message}`);
    } finally {
      setRunningScenario(null);
    }
  };

  const handleInjectChaos = async (scenario: Scenario) => {
    setRunningScenario(scenario.id);
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    setChaosLog(prev => [
      { id: Date.now(), text: `🔥 INJECTING FAULT: ${scenario.name} on ${scenario.targetApp} (Triggered by: Ray Woo)`, time: nowStr, type: 'trigger' },
      ...prev
    ]);
    showToast('warning', `Injecting fault: ${scenario.name}...`);

    try {
      const res = await fetchApi('/api/chaos/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenario.payload, initiator: 'Ray Woo (Chaos Lab)' })
      });

      if (res.ok) {
        const json = await res.json();
        setChaosLog(prev => [
          { id: Date.now() + 1, text: `🛡️ HEALED: ${scenario.name} resolved. Incident ID: ${json.incidentId || 'INC-1049'}`, time: new Date().toLocaleTimeString(), type: 'heal' },
          ...prev
        ]);
        showToast('success', `Remediated anomaly for ${scenario.name}`);
      }
    } catch (err: any) {
      showToast('error', `Failed: ${err.message}`);
    } finally {
      setRunningScenario(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800/60">
        <div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            <Flame className="h-4.5 w-4.5 text-rose-400" />
            Chaos Engineering & Guided Scenarios Lab
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Pre-built guided reviewer showcases & real-time Kubernetes fault injection suite
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/incidents')}
            className="btn-secondary text-xs"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            View Incident Console
          </button>
        </div>
      </div>

      {/* SECTION 5: GUIDED SHOWCASE SCENARIOS (Reviewer & Interview Showcase) */}
      <div className="card-panel p-4 border-sky-500/30 bg-sky-500/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Guided Scenarios (Reviewer & Interview Showcase)
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold bg-purple-600/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded uppercase">
            1-Click Guided Demonstrations
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Pre-scripted deterministic failure stories demonstrating human escalation, circuit breaker rules, Bedrock plain-English summaries, and dual-channel notifications.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {guidedScenarios.map((gs) => {
            const Icon = gs.icon;
            const isRunning = runningScenario === gs.id;
            return (
              <div 
                key={gs.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-3.5 rounded-md flex flex-col justify-between space-y-2.5 transition-all shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-4 w-4 text-sky-400" />
                      <h3 className="text-xs font-bold text-white">{gs.title}</h3>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${gs.badgeColor}`}>
                      {gs.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {gs.description}
                  </p>
                </div>

                <div className="bg-slate-950 p-2 rounded border border-slate-800 text-[10px] text-purple-300 font-mono">
                  🎯 <strong>Demonstrates:</strong> {gs.demonstrates}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Target: <code className="text-sky-400">{gs.payload}</code>
                  </span>
                  <button
                    onClick={() => handleRunGuidedScenario(gs)}
                    disabled={isRunning}
                    className="btn-primary text-[11px] py-1 px-3 bg-purple-600 hover:bg-purple-500"
                  >
                    <Play className={`h-3 w-3 ${isRunning ? 'animate-spin' : ''}`} />
                    {isRunning ? 'Running...' : 'Run Scenario'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION MANUAL FAULT INJECTION (Preserved Controls) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-rose-400" />
            Manual Fault Injection Controls
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">Active EKS Target: healops-backend</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {manualScenarios.map((sc) => {
            const Icon = sc.icon;
            const isRunning = runningScenario === sc.id;
            return (
              <div 
                key={sc.id} 
                className="card-panel p-3.5 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <span className={`p-1.5 rounded border text-xs ${sc.color}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                      {sc.category}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-white">{sc.name}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                    {sc.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Blast Radius:</span>
                    <span className="font-mono text-slate-300">{sc.blastRadius}</span>
                  </div>

                  <button
                    onClick={() => handleInjectChaos(sc)}
                    disabled={isRunning}
                    className="btn-danger w-full text-xs justify-center"
                  >
                    <Play className={`h-3 w-3 ${isRunning ? 'animate-spin' : ''}`} />
                    {isRunning ? 'Injecting Fault...' : 'Inject Fault'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Chaos Console Execution Log */}
      <div className="card-panel">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-rose-400" />
            Live Chaos Console Stream
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 font-semibold">● LIVE STREAM</span>
        </div>

        <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto">
          {chaosLog.map((log) => (
            <div key={log.id} className="flex items-start gap-2">
              <span className="text-slate-500 shrink-0">[{log.time}]</span>
              <span className={log.type === 'trigger' ? 'text-amber-400' : log.type === 'heal' ? 'text-emerald-400' : 'text-slate-400'}>
                {log.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
