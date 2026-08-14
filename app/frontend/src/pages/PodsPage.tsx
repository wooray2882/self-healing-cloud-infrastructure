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
import { fetchApi } from '../api/client';

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
      const res = await fetchApi('/api/cluster/pods');
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
      const res = await fetchApi('/api/cluster/pod/restart', {
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
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800/60">
        <div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-sky-400" />
            Pod Workload Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time container lifecycle, health probes, and restart tracking across all namespaces
          </p>
        </div>
        <div className="flex items-center gap-2">
          {actionMessage && (
            <span className="text-xs bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2.5 py-1 rounded-md animate-pulse">
              {actionMessage}
            </span>
          )}
          <button
            onClick={fetchPods}
            disabled={refreshing}
            className="btn-secondary text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary KPI Cards (monday.com Minimalist Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-panel p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Total Pods</span>
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">{totalPods}</div>
        </div>

        <div className="card-panel p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Running</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">{runningPods} <span className="text-xs text-emerald-400 font-normal">/ {totalPods}</span></div>
        </div>

        <div className="card-panel p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Restarts (5m)</span>
            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">{totalRestarts}</div>
        </div>

        <div className="card-panel p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Namespaces</span>
            <Server className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">{namespaces.length - 1}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-panel p-2.5 flex flex-col md:flex-row gap-2.5 justify-between items-center">
        {/* Namespace Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" /> Namespace:
          </span>
          {namespaces.map(ns => (
            <button
              key={ns}
              onClick={() => setSelectedNamespace(ns)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                selectedNamespace === ns
                  ? 'bg-sky-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              {ns === 'all' ? 'All' : ns}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search pod or node..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Pods Table */}
      <div className="card-panel overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-2.5 px-3">Pod Name</th>
                <th className="py-2.5 px-3">Namespace</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Restarts</th>
                <th className="py-2.5 px-3">Node Placement</th>
                <th className="py-2.5 px-3">Est. CPU / Mem</th>
                <th className="py-2.5 px-3">Age</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <RefreshCw className="h-5 w-5 animate-spin text-sky-400 mx-auto mb-1.5" />
                    Querying live Kubernetes pod specifications...
                  </td>
                </tr>
              ) : filteredPods.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No pods found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredPods.map(pod => {
                  const isRunning = pod.phase === 'Running';
                  const isCritical = pod.status === 'critical' || pod.phase === 'Failed';
                  return (
                    <tr key={`${pod.namespace}-${pod.name}`} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-2 px-3 font-mono font-medium text-slate-200 group-hover:text-sky-400 transition-colors max-w-[200px] truncate">
                        {pod.name}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                          pod.namespace === 'default'
                            ? 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                            : pod.namespace === 'monitoring'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {pod.namespace}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                          isRunning && !isCritical
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : isCritical
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {isRunning ? <CheckCircle2 className="h-2.5 w-2.5" /> : isCritical ? <XCircle className="h-2.5 w-2.5" /> : <AlertTriangle className="h-2.5 w-2.5" />}
                          {pod.phase} ({pod.ready})
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono">
                        <span className={`${pod.restarts > 0 ? 'text-amber-400 font-semibold' : 'text-slate-400'}`}>
                          {pod.restarts}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-400 text-[10px]">
                        {pod.node}
                      </td>
                      <td className="py-2 px-3 text-slate-300">
                        <span className="text-sky-400 font-mono">{pod.cpu}</span> / <span className="text-purple-400 font-mono">{pod.mem}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-400">
                        {pod.age}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => handleRestartPod(pod)}
                          className="btn-secondary text-[10px] py-0.5 px-2"
                        >
                          <RotateCcw className="h-2.5 w-2.5" />
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
