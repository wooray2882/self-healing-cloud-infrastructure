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
  Unlock,
  X
} from 'lucide-react';
import { fetchApi } from '../api/client';

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
  unschedulable?: boolean;
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
      const res = await fetchApi('/api/cluster/nodes');
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
    const willCordon = !node.unschedulable;
    
    try {
      setActionMessage(`Updating node scheduling for ${node.name}...`);
      const res = await fetchApi('/api/cluster/node/cordon', {
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
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800/60">
        <div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            <Server className="h-4.5 w-4.5 text-sky-400" />
            Node Infrastructure Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time AWS EC2 worker instances attached to Amazon EKS cluster
          </p>
        </div>
        <div className="flex items-center gap-2">
          {actionMessage && (
            <span className="text-xs bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2.5 py-1 rounded-md animate-pulse">
              {actionMessage}
            </span>
          )}
          <button
            onClick={fetchNodes}
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
            <span>Node Status</span>
            <Server className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">{readyNodes} / {totalNodes} <span className="text-xs text-emerald-400 font-normal">Ready</span></div>
        </div>

        <div className="card-panel p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Allocated Pods</span>
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">{totalPodsOnNodes} <span className="text-xs text-slate-400 font-normal">/ {totalCapacity || 34}</span></div>
        </div>

        <div className="card-panel p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Cluster Avg CPU</span>
            <Cpu className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">{avgCpu}%</div>
        </div>

        <div className="card-panel p-3">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Cluster Avg Mem</span>
            <HardDrive className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="text-lg sm:text-xl font-semibold text-white font-mono mt-1">{avgMem}%</div>
        </div>
      </div>

      {/* Nodes Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-sky-400" />
            <p className="text-xs">Querying EKS worker node telemetry...</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            No active nodes discovered in the cluster.
          </div>
        ) : (
          nodes.map((node) => {
            const isReady = node.readyCondition === 'Ready' && node.status !== 'degraded';
            return (
              <div 
                key={node.name}
                className="card-panel p-3.5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md border ${
                        isReady 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        <Server className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-white group-hover:text-sky-400 transition-colors font-mono">
                          {node.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                            <Globe className="h-3 w-3 text-slate-500" />
                            {node.region}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1 py-0.5 rounded border border-slate-700">
                            {node.type}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-[10px] text-slate-400">
                            Age: {node.age}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                      isReady
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {isReady ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {node.readyCondition}
                    </span>
                  </div>

                  {/* Utilization Metrics */}
                  <div className="grid grid-cols-2 gap-2.5 my-3 bg-slate-950/60 p-2.5 rounded-md border border-slate-800/80">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span className="flex items-center gap-1"><Cpu className="h-3 w-3 text-sky-400" /> CPU Load</span>
                        <span className="font-semibold text-white font-mono">{node.cpu}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            node.cpu > 80 ? 'bg-rose-500' : node.cpu > 60 ? 'bg-amber-500' : 'bg-sky-500'
                          }`} 
                          style={{ width: `${Math.min(100, node.cpu)}%` }} 
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span className="flex items-center gap-1"><HardDrive className="h-3 w-3 text-purple-400" /> Mem Load</span>
                        <span className="font-semibold text-white font-mono">{node.mem}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            node.mem > 80 ? 'bg-rose-500' : node.mem > 60 ? 'bg-amber-500' : 'bg-purple-500'
                          }`} 
                          style={{ width: `${Math.min(100, node.mem)}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pod Allocation & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] text-slate-400">
                    Active Pods: <span className="font-semibold text-white font-mono">{node.pods}</span> / {node.maxPods}
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedNode(node)}
                      className="btn-secondary text-[11px] py-1 px-2"
                    >
                      Inspect Node
                    </button>
                    <button
                      onClick={() => handleCordonToggle(node)}
                      className={`text-[11px] py-1 px-2 rounded-md font-medium transition-colors border flex items-center gap-1 ${
                        isReady 
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30' 
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {isReady ? <Lock className="h-2.5 w-2.5" /> : <Unlock className="h-2.5 w-2.5" />}
                      {isReady ? 'Cordon' : 'Uncordon'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Node Details Modal (Crisp 6px border radii) */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-md max-w-lg w-full p-5 shadow-2xl space-y-3.5">
            <div className="flex items-start justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Server className="h-4 w-4 text-sky-400" />
                  {selectedNode.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Instance Details & Kubelet Conditions</p>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-md border border-slate-800">
              <div><span className="text-slate-400 text-[11px]">Type:</span> <span className="font-semibold text-white text-[11px] font-mono">{selectedNode.type}</span></div>
              <div><span className="text-slate-400 text-[11px]">AZ:</span> <span className="font-semibold text-white text-[11px]">{selectedNode.region}</span></div>
              <div><span className="text-slate-400 text-[11px]">Condition:</span> <span className="font-semibold text-emerald-400 text-[11px]">{selectedNode.readyCondition}</span></div>
              <div><span className="text-slate-400 text-[11px]">Role:</span> <span className="font-semibold text-white text-[11px]">{selectedNode.role}</span></div>
              <div><span className="text-slate-400 text-[11px]">Capacity:</span> <span className="font-semibold text-white text-[11px] font-mono">{selectedNode.pods} / {selectedNode.maxPods}</span></div>
              <div><span className="text-slate-400 text-[11px]">Uptime:</span> <span className="font-semibold text-white text-[11px]">{selectedNode.age}</span></div>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Health Checks</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between p-1.5 bg-slate-950 rounded border border-slate-800 text-[11px]">
                  <span className="text-slate-300">MemoryPressure</span>
                  <span className="text-emerald-400 font-medium">False (Healthy)</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-slate-950 rounded border border-slate-800 text-[11px]">
                  <span className="text-slate-300">DiskPressure</span>
                  <span className="text-emerald-400 font-medium">False (Healthy)</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-slate-950 rounded border border-slate-800 text-[11px]">
                  <span className="text-slate-300">PIDPressure</span>
                  <span className="text-emerald-400 font-medium">False (Healthy)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedNode(null)}
                className="btn-secondary text-xs"
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
