import { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  RefreshCw, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface MetricPoint {
  time: string;
  cpu: number;
  mem: number;
  network?: number;
}

interface MetricsData {
  cpuHistory: MetricPoint[];
  currentCpu: number;
  currentMem: number;
  networkInMbps: number;
  networkOutMbps: number;
  podRestartRate: number;
  hpaReplicas: number;
  hpaTargetCpu: number;
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [timeRange, setTimeRange] = useState<'15m' | '1h' | '6h' | '24h'>('1h');
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('http://localhost:4000/api/cluster/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const historyData = metrics?.cpuHistory || [
    { time: '00h', cpu: 22, mem: 48, network: 12 },
    { time: '03h', cpu: 26, mem: 52, network: 15 },
    { time: '06h', cpu: 24, mem: 50, network: 14 },
    { time: '09h', cpu: 38, mem: 58, network: 22 },
    { time: '12h', cpu: 42, mem: 62, network: 28 },
    { time: '15h', cpu: 31, mem: 55, network: 19 },
    { time: '18h', cpu: 35, mem: 59, network: 23 },
    { time: '21h', cpu: 29, mem: 53, network: 17 },
    { time: 'Now', cpu: 24, mem: 52, network: 18 }
  ];

  const networkData = historyData.map((d, i) => ({
    time: d.time,
    ingress: (d.network || 15) + (i % 2 === 0 ? 3 : -2),
    egress: (d.network || 15) * 1.3 + (i % 3 === 0 ? 4 : 1)
  }));

  const hpaData = [
    { time: '10:00', replicas: 2, cpuLoad: 24 },
    { time: '10:15', replicas: 2, cpuLoad: 28 },
    { time: '10:30', replicas: 3, cpuLoad: 78 },
    { time: '10:45', replicas: 4, cpuLoad: 85 },
    { time: '11:00', replicas: 3, cpuLoad: 45 },
    { time: '11:15', replicas: 2, cpuLoad: 32 },
    { time: 'Now', replicas: metrics?.hpaReplicas || 2, cpuLoad: metrics?.currentCpu || 24 }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="h-7 w-7 text-emerald-400" />
            Prometheus Observability Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time telemetry, node resource saturation, and auto-scaling response curves
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            {(['15m', '1h', '6h', '24h'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  timeRange === range ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={fetchMetrics}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metric KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><Cpu className="h-4 w-4 text-cyan-400" /> Live CPU Load</span>
            <span className="text-emerald-400 flex items-center gap-0.5 text-xs font-semibold"><ArrowDownRight className="h-3 w-3" /> -2.4%</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{metrics?.currentCpu || 24}%</div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">PromQL: node_cpu_seconds_total</div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><HardDrive className="h-4 w-4 text-violet-400" /> Memory Working Set</span>
            <span className="text-amber-400 flex items-center gap-0.5 text-xs font-semibold"><ArrowUpRight className="h-3 w-3" /> +1.1%</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{metrics?.currentMem || 52}%</div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">PromQL: container_memory_bytes</div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><Wifi className="h-4 w-4 text-emerald-400" /> Net Throughput</span>
            <span className="text-emerald-400 text-xs font-semibold">Healthy</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{metrics?.networkOutMbps || 24.1} <span className="text-xs font-normal text-slate-400">Mbps</span></div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">In: {metrics?.networkInMbps || 18.4} Mbps</div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><Layers className="h-4 w-4 text-indigo-400" /> HPA Auto-Scaling</span>
            <span className="text-cyan-400 text-xs font-semibold">Target: 70%</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{metrics?.hpaReplicas || 2} <span className="text-xs font-normal text-slate-400">Replicas</span></div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Autoscaler Min: 2 / Max: 10</div>
        </div>
      </div>

      {/* Primary Timeseries Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Cluster CPU Utilization */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-400" />
                Cluster CPU Utilization vs Capacity
              </h3>
              <p className="text-xs text-slate-400">Average % across all EC2 worker instances</p>
            </div>
            <span className="text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded">
              Current: {metrics?.currentCpu || 24}%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} 
                  itemStyle={{ color: '#06B6D4' }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#06B6D4" strokeWidth={2.5} fillOpacity={1} fill="url(#cpuGrad)" name="CPU %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cluster Memory Working Set */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-violet-400" />
                Cluster Memory Saturation
              </h3>
              <p className="text-xs text-slate-400">Total resident set memory vs cluster limits</p>
            </div>
            <span className="text-xs font-mono bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded">
              Current: {metrics?.currentMem || 52}%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} 
                  itemStyle={{ color: '#8B5CF6' }}
                />
                <Area type="monotone" dataKey="mem" stroke="#8B5CF6" strokeWidth={2.5} fillOpacity={1} fill="url(#memGrad)" name="Memory %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Network I/O Bandwidth */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Wifi className="h-4 w-4 text-emerald-400" />
                Network Traffic Bandwidth (Ingress / Egress)
              </h3>
              <p className="text-xs text-slate-400">Megabits per second transmitted across VPC</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={networkData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} unit=" Mbps" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="ingress" stroke="#10B981" strokeWidth={2} dot={false} name="Ingress (Mbps)" />
                <Line type="monotone" dataKey="egress" stroke="#F59E0B" strokeWidth={2} dot={false} name="Egress (Mbps)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: HPA Auto-Scaling Curve */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                Horizontal Pod Autoscaling (HPA) Response
              </h3>
              <p className="text-xs text-slate-400">Replica elasticity vs CPU stress spike</p>
            </div>
            <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
              Active: {metrics?.hpaReplicas || 2} Replicas
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hpaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="#64748B" domain={[0, 10]} tick={{ fontSize: 11 }} label={{ value: 'Replicas', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line yAxisId="left" type="stepAfter" dataKey="replicas" stroke="#6366F1" strokeWidth={3} name="Pod Replicas" />
                <Line yAxisId="right" type="monotone" dataKey="cpuLoad" stroke="#EC4899" strokeWidth={1.5} strokeDasharray="4 4" name="CPU Load %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
