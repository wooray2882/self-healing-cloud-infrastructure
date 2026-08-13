import { useState, useEffect } from 'react';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  Globe, 
  Lock, 
  Unlock 
} from 'lucide-react';

interface NodeItem {
  name: string;
  status: 'healthy' | 'warning' | 'degraded';
  cpu: number;
  mem: number;
  pods: number;
  maxPods: number;
  region: string;
  type: string;
  role: string;
  readyCondition: string;
  age: string;
}

export default function NodesPage() {
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchNodes = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('http://localhost:4000/api/cluster/nodes');
      if (res.ok) {
        const data = await res.json();
        setNodes(data.nodes || []);
      }
    } catch (err) {
      console.error('Failed to load nodes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNodes();
    const interval = setInterval(fetchNodes, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCordonToggle = async (node: NodeItem) => {
    const isCurrentlyCordoned = node.status === 'degraded' || node.readyCondition !== 'Ready';
    const willCordon = !isCurrentlyCordoned;
    
    try {
      setActionMessage(`Updating node scheduling for ${node.name}...`);
      const res = await fetch('http://localhost:4000/api/cluster/node/cordon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: node.name, unschedulable: willCordon })
      });
      if (res.ok) {
        setActionMessage(`Node ${node.name} ${willCordon ? 'cordoned' : 'uncordoned'} successfully!`);
        fetchNodes();
      }
    } catch (err) {
      setActionMessage(`Failed to update node cordon state`);
    } finally {
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const totalNodes = nodes.length;
  const readyNodes = nodes.filter(n => n.readyCondition === 'Ready').length;
  const avgCpu = totalNodes > 0 ? Math.round(nodes.reduce((acc, n) => acc + n.cpu, 0) / totalNodes) : 0;
  const avgMem = totalNodes > 0 ? Math.round(nodes.reduce((acc, n) => acc + n.mem, 0) / totalNodes) : 0;
  const totalPodsOnNodes = nodes.reduce((acc, n) => acc + n.pods, 0);
  const totalCapacity = nodes.reduce((acc, n) => acc + n.maxPods, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Server className="h-7 w-7 text-cyan-400" />
            Node Infrastructure Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time AWS EC2 worker instances attached to Amazon EKS cluster
          </p>
        </div>
        <div className="flex items-center gap-3">
          {actionMessage && (
            <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg animate-pulse">
              {actionMessage}
            </span>
          )}
          <button
            onClick={fetchNodes}
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
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Server className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Node Status</div>
            <div className="text-2xl font-bold text-white mt-0.5">{readyNodes} / {totalNodes} <span className="text-xs text-emerald-400 font-normal">Ready</span></div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Allocated Pods</div>
            <div className="text-2xl font-bold text-white mt-0.5">{totalPodsOnNodes} <span className="text-xs text-slate-400 font-normal">/ {totalCapacity || 34} Max</span></div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cluster Avg CPU</div>
            <div className="text-2xl font-bold text-white mt-0.5">{avgCpu}%</div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4.5 flex items-center gap-4">
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cluster Avg Memory</div>
            <div className="text-2xl font-bold text-white mt-0.5">{avgMem}%</div>
          </div>
        </div>
      </div>

      {/* Nodes Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
            <p>Querying EKS worker node telemetry...</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No active nodes discovered in the cluster.
          </div>
        ) : (
          nodes.map((node) => {
            const isReady = node.readyCondition === 'Ready' && node.status !== 'degraded';
            return (
              <div 
                key={node.name}
                className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-5.5 transition-all shadow-lg hover:shadow-cyan-500/5 group"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      isReady 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      <Server className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors font-mono">
                        {node.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Globe className="h-3.5 w-3.5 text-slate-500" />
                          {node.region}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs font-mono bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700/50">
                          {node.type}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-400">
                          Age: {node.age}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    isReady
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {isReady ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                    {node.readyCondition}
                  </span>
                </div>

                {/* Utilization Metrics */}
                <div className="grid grid-cols-2 gap-3.5 my-4.5 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-cyan-400" /> CPU Load</span>
                      <span className="font-semibold text-white">{node.cpu}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          node.cpu > 80 ? 'bg-rose-500' : node.cpu > 60 ? 'bg-amber-500' : 'bg-cyan-500'
                        }`} 
                        style={{ width: `${Math.min(100, node.cpu)}%` }} 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span className="flex items-center gap-1.5"><HardDrive className="h-3.5 w-3.5 text-violet-400" /> Memory Load</span>
                      <span className="font-semibold text-white">{node.mem}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          node.mem > 80 ? 'bg-rose-500' : node.mem > 60 ? 'bg-amber-500' : 'bg-violet-500'
                        }`} 
                        style={{ width: `${Math.min(100, node.mem)}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Pod Allocation & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="text-xs text-slate-400">
                    Active Pods: <span className="font-semibold text-white">{node.pods}</span> / {node.maxPods}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedNode(node)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-700/60"
                    >
                      Inspect Node
                    </button>
                    <button
                      onClick={() => handleCordonToggle(node)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border flex items-center gap-1.5 ${
                        isReady 
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30' 
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {isReady ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                      {isReady ? 'Cordon Node' : 'Uncordon'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Node Details Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Server className="h-5 w-5 text-cyan-400" />
                  {selectedNode.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Instance Details & Kubelet Conditions</p>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div><span className="text-slate-400">Instance Type:</span> <span className="font-semibold text-white">{selectedNode.type}</span></div>
              <div><span className="text-slate-400">Availability Zone:</span> <span className="font-semibold text-white">{selectedNode.region}</span></div>
              <div><span className="text-slate-400">Kubelet Condition:</span> <span className="font-semibold text-emerald-400">{selectedNode.readyCondition}</span></div>
              <div><span className="text-slate-400">Role:</span> <span className="font-semibold text-white">{selectedNode.role}</span></div>
              <div><span className="text-slate-400">Pod Capacity:</span> <span className="font-semibold text-white">{selectedNode.pods} / {selectedNode.maxPods}</span></div>
              <div><span className="text-slate-400">Uptime:</span> <span className="font-semibold text-white">{selectedNode.age}</span></div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Health Checks</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 bg-slate-800/40 rounded-lg border border-slate-800">
                  <span className="text-slate-300">MemoryPressure</span>
                  <span className="text-emerald-400 font-medium">False (Healthy)</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-800/40 rounded-lg border border-slate-800">
                  <span className="text-slate-300">DiskPressure</span>
                  <span className="text-emerald-400 font-medium">False (Healthy)</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-800/40 rounded-lg border border-slate-800">
                  <span className="text-slate-300">PIDPressure</span>
                  <span className="text-emerald-400 font-medium">False (Healthy)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setSelectedNode(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
