import { Router } from 'express';
import { 
  getClusterOverviewData, 
  getLiveNodes, 
  getLivePods, 
  restartPodByName, 
  cordonNode,
  inMemoryHealingEvents 
} from '../services/kubernetes';
import { getLiveMetrics, getLiveAlerts } from '../services/prometheus';
import { io } from '../server';

export const clusterRouter = Router();

// GET /api/cluster/overview
clusterRouter.get('/overview', async (req, res) => {
  try {
    const data = await getClusterOverviewData();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch cluster overview' });
  }
});

// GET /api/cluster/nodes
clusterRouter.get('/nodes', async (req, res) => {
  try {
    const nodes = await getLiveNodes();
    res.json({ nodes, count: nodes.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch cluster nodes' });
  }
});

// GET /api/cluster/pods
clusterRouter.get('/pods', async (req, res) => {
  try {
    const pods = await getLivePods();
    res.json({ pods, count: pods.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch cluster pods' });
  }
});

// GET /api/cluster/metrics
clusterRouter.get('/metrics', async (req, res) => {
  try {
    const metrics = await getLiveMetrics();
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch metrics' });
  }
});

// GET /api/cluster/alerts
clusterRouter.get('/alerts', async (req, res) => {
  try {
    const alerts = await getLiveAlerts();
    res.json({ alerts, count: alerts.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch alerts' });
  }
});

// GET /api/cluster/remediations
clusterRouter.get('/remediations', async (req, res) => {
  try {
    res.json({
      events: inMemoryHealingEvents,
      activePlaybooks: [
        { id: 'pb-1', name: 'Pod CrashLoop Remediation', status: 'ACTIVE', trigger: 'Pod restarts > 3 in 5m', action: 'Auto-restart & health probe validation', confidence: '98%' },
        { id: 'pb-2', name: 'Memory Exhaustion Protection', status: 'ACTIVE', trigger: 'Container Memory > 85%', action: 'Graceful drain & replacement pod spin-up', confidence: '95%' },
        { id: 'pb-3', name: 'CPU Spike HPA Auto-Boost', status: 'ACTIVE', trigger: 'Node CPU > 80% for 1m', action: 'HPA target scale-out + ASG node provisioning', confidence: '99%' },
        { id: 'pb-4', name: 'Network Partition Failover', status: 'ACTIVE', trigger: 'Health check probe timeout x3', action: 'Endpoint isolation & route re-convergence', confidence: '94%' }
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/cluster/pod/restart
clusterRouter.post('/pod/restart', async (req, res) => {
  const { name, namespace } = req.body;
  if (!name) return res.status(400).json({ error: 'Pod name is required' });
  
  try {
    const result = await restartPodByName(name, namespace || 'default');
    io.emit('healing-event', {
      type: 'MANUAL_POD_RESTART',
      message: `Manual pod restart initiated for ${name} (${namespace || 'default'})`,
      timestamp: new Date().toISOString()
    });
    res.json({ success: true, message: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/cluster/node/cordon
clusterRouter.post('/node/cordon', async (req, res) => {
  const { name, unschedulable } = req.body;
  if (!name) return res.status(400).json({ error: 'Node name is required' });

  try {
    const result = await cordonNode(name, unschedulable !== false);
    io.emit('healing-event', {
      type: 'NODE_CORDON_MUTATION',
      message: `Node ${name} ${unschedulable !== false ? 'cordoned' : 'uncordoned'}`,
      timestamp: new Date().toISOString()
    });
    res.json({ success: true, message: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
