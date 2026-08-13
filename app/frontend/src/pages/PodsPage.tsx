import { useState, useEffect } from 'react';
import { 
  Layers, 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Server, 
  RefreshCw, 
  Filter 
} from 'lucide-react';

interface PodItem {
  name: string;
  namespace: string;
  status: 'healthy' | 'warning' | 'critical';
  phase: string;
  cpu: string;
  mem: string;
  restarts: number;
  node: string;
  age: string;
  risk: string;
  ready: string;
}

export default function PodsPage() {
  const [pods, setPods] = useState<PodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNamespace, setSelectedNamespace] = useState('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchPods = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('http://localhost:4000/api/cluster/pods');
      if (res.ok) {
        const data = await res.json();
        setPods(data.pods || []);
      }
    } catch (err) {
      console.error('Failed to load pods:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPods();
    const interval = setInterval(fetchPods, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRestartPod = async (pod: PodItem) => {
    try {
      setActionMessage(`Initiating restart for pod ${pod.name}...`);
      const res = await fetch('http://localhost:4000/api/cluster/pod/restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: pod.name, namespace: pod.namespace })
      });
      if (res.ok) {
        setActionMessage(`Pod ${pod.name} restarted successfully!`);
        fetchPods();
      }
    } catch (err) {
      setActionMessage(`Failed to restart pod ${pod.name}`);
    } finally {
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Filter pods
  const namespaces = ['all', ...Array.from(new Set(pods.map(p => p.namespace)))];
  const filteredPods = pods.filter(pod => {
    const matchesNamespace = selectedNamespace === 'all' || pod.namespace === selectedNamespace;
    const matchesSearch = 
      pod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pod.namespace.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pod.node.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesNamespace && matchesSearch;
  });

  const totalPods = pods.length;
  const runningPods = pods.filter(p => p.phase === 'Running').length;
  const totalRestarts = pods.reduce((acc, p) => acc + p.restarts, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Layers className="h-7 w-7 text-indigo-400" />
            Pod Workload Telemetry
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time container lifecycle, health probes, and restart tracking across all namespaces
          </p>
        </div>
        <div className="flex items-center gap-3">
          {actionMessage && (
            <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg animate-pulse">
              {actionMessage}
            </span>
          )}
          <button
            onClick={fetchPods}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Discovered Pods</div>
            <div className="text-2xl font-bold text-white mt-0.5">{totalPods}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Running Workloads</div>
            <div className="text-2xl font-bold text-white mt-0.5">{runningPods} <span className="text-xs text-emerald-400 font-normal">/ {totalPods}</span></div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <RotateCcw className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Restarts (5m)</div>
            <div className="text-2xl font-bold text-white mt-0.5">{totalRestarts}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5 flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Server className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Namespaces</div>
            <div className="text-2xl font-bold text-white mt-0.5">{namespaces.length - 1}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-3.5">
        {/* Namespace Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="h-3.5 w-3.5" /> Namespace:
          </span>
          {namespaces.map(ns => (
            <button
              key={ns}
              onClick={() => setSelectedNamespace(ns)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                selectedNamespace === ns
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/40'
              }`}
            >
              {ns === 'all' ? 'All Namespaces' : ns}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search pod or node..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Pods Table */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Pod Name</th>
                <th className="py-3.5 px-4">Namespace</th>
                <th className="py-3.5 px-4">Status & Ready</th>
                <th className="py-3.5 px-4">Restarts</th>
                <th className="py-3.5 px-4">Node Placement</th>
                <th className="py-3.5 px-4">Est. CPU / Mem</th>
                <th className="py-3.5 px-4">Age</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin text-cyan-400 mx-auto mb-2" />
                    Querying live Kubernetes pod specifications...
                  </td>
                </tr>
              ) : filteredPods.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No pods found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredPods.map(pod => {
                  const isRunning = pod.phase === 'Running';
                  const isCritical = pod.status === 'critical' || pod.phase === 'Failed';
                  return (
                    <tr key={`${pod.namespace}-${pod.name}`} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-3 px-4 font-mono font-medium text-white group-hover:text-cyan-400 transition-colors max-w-[220px] truncate">
                        {pod.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                          pod.namespace === 'default'
                            ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                            : pod.namespace === 'monitoring'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {pod.namespace}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                          isRunning && !isCritical
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : isCritical
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {isRunning ? <CheckCircle2 className="h-3 w-3" /> : isCritical ? <XCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                          {pod.phase} ({pod.ready})
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className={`${pod.restarts > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                          {pod.restarts}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {pod.node}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <span className="text-cyan-400 font-mono">{pod.cpu}</span> / <span className="text-violet-400 font-mono">{pod.mem}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {pod.age}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleRestartPod(pod)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 rounded-lg text-xs font-medium transition-colors border border-slate-700/60 hover:border-rose-500/30 inline-flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Restart
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
