// ===========================================================
// Mock data for the HealOps dashboard
// In production these are replaced by real API/Prometheus calls
// ===========================================================

export const clusterKPIs = {
  health:      { value: 94, max: 100, trend: '+2', trendUp: true  },
  activeNodes: { value: 8,  max: 8,   trend: '0',  trendUp: true  },
  runningPods: { value: 42, max: 45,  trend: '-1', trendUp: false },
  cpuUsage:    { value: 34, unit: '%', trend: '-4', trendUp: true  },
  memUsage:    { value: 61, unit: '%', trend: '+3', trendUp: false },
  activeAlerts:{ value: 2,  trend: '-1', trendUp: true },
}

export const cpuMemoryHistory = [
  { time: '00h', cpu: 28, mem: 55 },
  { time: '03h', cpu: 32, mem: 57 },
  { time: '06h', cpu: 29, mem: 58 },
  { time: '09h', cpu: 45, mem: 62 },
  { time: '12h', cpu: 52, mem: 67 },
  { time: '15h', cpu: 38, mem: 64 },
  { time: '18h', cpu: 41, mem: 63 },
  { time: '21h', cpu: 36, mem: 61 },
  { time: '24h', cpu: 34, mem: 61 },
]

export const nodeHealth = [
  { name: 'Healthy',  value: 6, color: '#10B981' },
  { name: 'Warning',  value: 1, color: '#F59E0B' },
  { name: 'Degraded', value: 1, color: '#EF4444' },
]

export const clusterScore = [
  { metric: 'Availability', score: 96.5 },
  { metric: 'Performance',  score: 89.5 },
  { metric: 'Security',     score: 82.5 },
  { metric: 'Cost',         score: 95.0 },
  { metric: 'Reliability',  score: 93.0 },
]

export const healingEvents = [
  { id: 1, action: 'Pod restart: api-gateway-7d4b',      time: '2m ago',  status: 'success', pct: 100 },
  { id: 2, action: 'Node cordon: worker-node-3',          time: '14m ago', status: 'success', pct: 100 },
  { id: 3, action: 'Deployment rollback: frontend v1.4',  time: '1h ago',  status: 'success', pct: 100 },
  { id: 4, action: 'HPA scale-out: backend (3 → 6)',      time: '2h ago',  status: 'success', pct: 100 },
  { id: 5, action: 'Node replacement: worker-node-1',     time: '4h ago',  status: 'success', pct: 100 },
]

export const recentAlerts = [
  { id: 1, severity: 'warning',  title: 'High memory: worker-node-3', time: '14m ago' },
  { id: 2, severity: 'info',     title: 'HPA triggered: backend pods scaled', time: '2h ago' },
  { id: 3, severity: 'resolved', title: 'CPU spike resolved: api-gateway', time: '4h ago' },
  { id: 4, severity: 'resolved', title: 'Pod OOMKilled: cache-service', time: '6h ago' },
]

export const podsAtRisk = [
  { name: 'cache-redis-primary-0',    namespace: 'production', cpu: '87%', mem: '920 MB', status: 'warning',  risk: 'High Memory' },
  { name: 'worker-processor-5f7d4',   namespace: 'production', cpu: '12%', mem: '340 MB', status: 'healthy',  risk: 'None'         },
  { name: 'api-gateway-7d4b9',        namespace: 'production', cpu: '61%', mem: '512 MB', status: 'warning',  risk: 'CPU Throttle' },
  { name: 'frontend-deploy-9c2f1',    namespace: 'production', cpu: '8%',  mem: '128 MB', status: 'healthy',  risk: 'None'         },
  { name: 'prometheus-server-0',      namespace: 'monitoring', cpu: '23%', mem: '1.1 GB', status: 'critical', risk: 'OOM Risk'      },
]

export const nodes = [
  { name: 'worker-node-1', status: 'healthy',  cpu: 28, mem: 55, pods: 8,  region: 'us-east-1a', type: 't3.xlarge' },
  { name: 'worker-node-2', status: 'healthy',  cpu: 41, mem: 63, pods: 10, region: 'us-east-1a', type: 't3.xlarge' },
  { name: 'worker-node-3', status: 'warning',  cpu: 72, mem: 88, pods: 11, region: 'us-east-1b', type: 't3.xlarge' },
  { name: 'worker-node-4', status: 'healthy',  cpu: 19, mem: 44, pods: 6,  region: 'us-east-1b', type: 't3.xlarge' },
  { name: 'worker-node-5', status: 'healthy',  cpu: 33, mem: 51, pods: 7,  region: 'us-east-1c', type: 't3.xlarge' },
  { name: 'worker-node-6', status: 'healthy',  cpu: 45, mem: 67, pods: 9,  region: 'us-east-1c', type: 't3.xlarge' },
  { name: 'control-plane-1', status: 'healthy', cpu: 22, mem: 38, pods: 0, region: 'us-east-1a', type: 'm5.large' },
  { name: 'control-plane-2', status: 'healthy', cpu: 18, mem: 35, pods: 0, region: 'us-east-1b', type: 'm5.large' },
]

export const chaosScenarios = [
  { id: 'pod-kill',        label: 'Pod Eviction',        icon: 'ri-delete-bin-5-line',   color: '#F59E0B', description: 'Evict a random pod in the production namespace and observe ReplicaSet recovery.' },
  { id: 'cpu-spike',       label: 'CPU Exhaustion',      icon: 'ri-cpu-line',             color: '#EF4444', description: 'Drive CPU to 100% on worker-node-3 and trigger HPA scale-out.' },
  { id: 'network-loss',    label: 'Network Disruption',  icon: 'ri-wifi-off-line',        color: '#8B5CF6', description: 'Inject 500ms latency + 10% packet loss to simulate network degradation.' },
  { id: 'memory-pressure', label: 'Memory Pressure',     icon: 'ri-stack-line',           color: '#06D6F0', description: 'Artificially increase memory consumption to trigger OOM and pod replacement.' },
]
