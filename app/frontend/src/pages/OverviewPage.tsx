import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Server, 
  Layers, 
  Cpu, 
  HardDrive, 
  Activity, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { fetchApi } from '../api/client';

interface OverviewData {
  kpis: {
    health: { value: number; max: number; trend: string; trendUp: boolean };
    activeNodes: { value: number; max: number; trend: string; trendUp: boolean };
    runningPods: { value: number; max: number; trend: string; trendUp: boolean };
    cpuUsage: { value: number; unit: string; trend: string; trendUp: boolean };
    memUsage: { value: number; unit: string; trend: string; trendUp: boolean };
    activeAlerts: { value: number; trend: string; trendUp: boolean };
  };
  nodeHealth: { name: string; value: number; color: string }[];
  clusterScore: { metric: string; score: number }[];
  cpuMemoryHistory: { time: string; cpu: number; mem: number }[];
  healingEvents: { id: number; action: string; target: string; time: string; status: string; pct: number }[];
  podsAtRisk: { name: string; namespace: string; cpu: string; mem: string; status: string; risk: string }[];
}

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isInjecting, setIsInjecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = async () => {
    try {
      setRefreshing(true);
      const res = await fetchApi('/api/cluster/overview');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch cluster overview:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleInjectChaos = async () => {
    setIsInjecting(true);
    try {
      await fetchApi('/api/chaos/inject', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'cpu_spike' })
      });
      setTimeout(fetchOverview, 1500);
    } catch (err) {
      console.error('Chaos injection error:', err);
    } finally {
      setTimeout(() => setIsInjecting(false), 2000);
    }
  };

  const kpis = data?.kpis || {
    health: { value: 96, max: 100, trend: '+2', trendUp: true },
    activeNodes: { value: 2, max: 2, trend: '0', trendUp: true },
    runningPods: { value: 16, max: 16, trend: '+1', trendUp: true },
    cpuUsage: { value: 24, unit: '%', trend: '-2', trendUp: true },
    memUsage: { value: 52, unit: '%', trend: '+1', trendUp: false },
    activeAlerts: { value: 0, trend: '0', trendUp: true }
  };

  const history = data?.cpuMemoryHistory || [
    { time: '00h', cpu: 22, mem: 48 },
    { time: '03h', cpu: 26, mem: 52 },
    { time: '06h', cpu: 24, mem: 50 },
    { time: '09h', cpu: 38, mem: 58 },
    { time: '12h', cpu: 42, mem: 62 },
    { time: '15h', cpu: 31, mem: 55 },
    { time: '18h', cpu: 35, mem: 59 },
    { time: '21h', cpu: 29, mem: 53 },
    { time: 'Now', cpu: 24, mem: 52 }
  ];

  const radarData = data?.clusterScore || [
    { metric: 'Availability', score: 99.2 },
    { metric: 'Performance', score: 92.4 },
    { metric: 'Security', score: 96.0 },
    { metric: 'Reliability', score: 95.8 },
    { metric: 'Efficiency', score: 94.0 }
  ];

  const podsAtRisk = data?.podsAtRisk || [];
  const healingEvents = data?.healingEvents || [];

  return (
    <div className="space-y-4">
      {/* Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800/60">
        <div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-sky-400" />
            EKS Cluster Resilience Overview
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time AWS EKS infrastructure health, telemetry, and automated AI remediations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleInjectChaos}
            disabled={isInjecting}
            className="btn-danger text-xs"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${isInjecting ? 'animate-spin' : ''}`} /> 
            {isInjecting ? 'Injecting Chaos...' : 'Inject Chaos (Test AI)'}
          </button>

          <button
            onClick={fetchOverview}
            disabled={refreshing}
            className="btn-secondary text-xs"
            title="Refresh telemetry"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (monday.com Minimalist Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard title="Cluster Health" value={`${kpis.health.value}`} max={kpis.health.max} trend={kpis.health.trend} trendUp={kpis.health.trendUp} icon={ShieldCheck} iconColor="text-emerald-400" />
        <KPICard title="Active Nodes" value={`${kpis.activeNodes.value}`} max={kpis.activeNodes.max} trend={kpis.activeNodes.trend} trendUp={kpis.activeNodes.trendUp} icon={Server} iconColor="text-sky-400" />
        <KPICard title="Running Pods" value={`${kpis.runningPods.value}`} max={kpis.runningPods.max} trend={kpis.runningPods.trend} trendUp={kpis.runningPods.trendUp} icon={Layers} iconColor="text-indigo-400" />
        <KPICard title="CPU Saturation" value={`${kpis.cpuUsage.value}`} unit="%" trend={kpis.cpuUsage.trend} trendUp={kpis.cpuUsage.trendUp} icon={Cpu} iconColor="text-sky-400" />
        <KPICard title="Memory Usage" value={`${kpis.memUsage.value}`} unit="%" trend={kpis.memUsage.trend} trendUp={kpis.memUsage.trendUp} icon={HardDrive} iconColor="text-purple-400" />
        <KPICard title="Active Alerts" value={`${kpis.activeAlerts.value}`} trend={kpis.activeAlerts.trend} trendUp={kpis.activeAlerts.trendUp} icon={AlertTriangle} iconColor="text-amber-400" />
      </div>

      {/* Middle Row: Timeseries Charts & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Timeseries Area Chart */}
        <div className="card-panel lg:col-span-2">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Cluster Resource Trends (CPU & Memory)</h2>
              <p className="text-[11px] text-slate-400">Live aggregated Prometheus timeseries</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-sky-400 font-medium"><span className="w-2 h-2 rounded-sm bg-sky-400"></span> CPU %</span>
              <span className="flex items-center gap-1.5 text-purple-400 font-medium"><span className="w-2 h-2 rounded-sm bg-purple-400"></span> Memory %</span>
            </div>
          </div>
          
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '6px', fontSize: '11px', padding: '6px 10px' }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} name="CPU %" />
                <Area type="monotone" dataKey="mem" stroke="#818cf8" fillOpacity={1} fill="url(#colorMem)" strokeWidth={2} name="Memory %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart: Cluster Resilience Score */}
        <div className="card-panel">
          <div className="mb-2 pb-2 border-b border-slate-800/80">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Resilience Vector Score</h2>
            <p className="text-[11px] text-slate-400">Automated SLA & Security evaluation</p>
          </div>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 9 }} />
                <PolarRadiusAxis stroke="#475569" domain={[0, 100]} tick={{ fontSize: 8 }} />
                <Radar name="Cluster Score" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '6px', fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Pods Status & Autonomous Healing Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card-panel lg:col-span-2">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Critical & Warning Workload Probes</h2>
            <span className="text-[11px] text-slate-400">Targeting default & monitoring</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                  <th className="py-2 px-2.5">Pod Name</th>
                  <th className="py-2 px-2.5">Namespace</th>
                  <th className="py-2 px-2.5">CPU</th>
                  <th className="py-2 px-2.5">Memory</th>
                  <th className="py-2 px-2.5">Health</th>
                  <th className="py-2 px-2.5">Risk Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {podsAtRisk.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 font-sans text-xs">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                      All running pods are healthy with zero CrashLoops.
                    </td>
                  </tr>
                ) : (
                  podsAtRisk.map(pod => (
                    <tr key={pod.name} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2 px-2.5 text-slate-200 font-medium">{pod.name}</td>
                      <td className="py-2 px-2.5 text-slate-400">{pod.namespace}</td>
                      <td className="py-2 px-2.5 text-sky-400">{pod.cpu}</td>
                      <td className="py-2 px-2.5 text-purple-400">{pod.mem}</td>
                      <td className="py-2 px-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                          pod.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          pod.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {pod.status}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 text-slate-300 font-sans text-[11px]">{pod.risk}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Self-Healing Events Feed */}
        <div className="card-panel flex flex-col justify-between">
          <div>
            <div className="mb-3 pb-2 border-b border-slate-800/80">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-sky-400" />
                Recent AI Healing Events
              </h2>
              <p className="text-[11px] text-slate-400">Autonomous closed-loop audit trail</p>
            </div>

            <div className="space-y-2">
              {healingEvents.slice(0, 4).map(event => (
                <div key={event.id} className="flex justify-between items-start text-xs border-b border-slate-800/60 pb-2 last:border-0">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-200 font-medium text-xs block">{event.action}</span>
                      <span className="text-[10px] text-slate-400">Target: {event.target}</span>
                    </div>
                  </div>
                  <span className="text-slate-500 shrink-0 text-[10px] font-mono">{event.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">AI Self-Healing Engine Active (Amazon Bedrock)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, max, unit, trend, trendUp, icon: Icon, iconColor }: {
  title: string;
  value: string;
  max?: number;
  unit?: string;
  trend: string;
  trendUp: boolean;
  icon: any;
  iconColor: string;
}) {
  return (
    <div className="card-panel p-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
      </div>
      <div className="flex items-baseline justify-between mt-1.5">
        <div className="text-lg sm:text-xl font-semibold tracking-tight text-white font-mono">
          {value}
          {max !== undefined && <span className="text-xs font-normal text-slate-500">/{max}</span>}
          {unit && <span className="text-xs font-normal text-slate-400 ml-0.5">{unit}</span>}
        </div>
        <div className={`text-[10px] font-semibold font-mono ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend}
        </div>
      </div>
    </div>
  );
}
