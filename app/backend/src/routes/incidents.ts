import { Router, Request, Response } from 'express';
import { 
  getIncidents, 
  getIncidentById, 
  approveIncident, 
  rejectIncident, 
  createIncident 
} from '../services/incidents';
import { generateHumanSummary } from '../services/bedrock';
import { sendFormattedNotification } from '../services/sns';

export const incidentsRouter = Router();

// GET /api/incidents
incidentsRouter.get('/', (req: Request, res: Response) => {
  res.json(getIncidents());
});

// GET /api/incidents/:id
incidentsRouter.get('/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const incident = getIncidentById(id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  res.json(incident);
});

// POST /api/incidents/:id/approve
incidentsRouter.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await approveIncident(id);
    res.json({ message: 'Incident approved and remediation executed', incident: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to approve incident' });
  }
});

// POST /api/incidents/:id/reject
incidentsRouter.post('/:id/reject', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = rejectIncident(id);
    res.json({ message: 'Incident rejected', incident: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to reject incident' });
  }
});

// Demo endpoint: POST /api/incidents/simulate-low-confidence
incidentsRouter.post('/simulate-low-confidence', async (req: Request, res: Response) => {
  try {
    const anomaly = req.body.anomaly || 'High Database Connection Latency';
    const target = req.body.target || 'payment-service';
    const confidence = req.body.confidence || 74;

    const humanSummary = await generateHumanSummary({
      anomaly,
      target,
      proposedAction: 'RESTART_POD',
      confidence,
      reasoning: 'Confidence score is below the 85% safety threshold. Proposed pod restart requires human approval to avoid dropping active database transactions.',
      status: 'pending_approval'
    });

    const incident = createIncident({
      title: `${target}: ${anomaly}`,
      targetResource: target,
      confidence,
      reasoning: 'Confidence score is below the 85% threshold. Manual approval required before executing Kubernetes pod restart.',
      proposedAction: 'RESTART_POD',
      status: 'pending_approval',
      humanSummary
    });

    await sendFormattedNotification(humanSummary, incident.id, 'PENDING_APPROVAL');

    res.json({ message: 'Simulated low-confidence incident created', incident });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to simulate incident' });
  }
});

// Demo endpoint: POST /api/incidents/simulate-circuit-breaker
incidentsRouter.post('/simulate-circuit-breaker', async (req: Request, res: Response) => {
  try {
    const target = req.body.target || 'payment-service';

    const humanSummary = await generateHumanSummary({
      anomaly: 'Repeated Pod CrashLoopBackOff',
      target,
      proposedAction: 'ESCALATE_TO_HUMAN',
      confidence: 95,
      reasoning: 'The target resource failed 3 consecutive auto-remediation attempts in 15 minutes. Circuit breaker tripped to prevent infinite restart loops.',
      status: 'escalated'
    });

    const incident = createIncident({
      title: `Circuit Breaker Tripped: ${target}`,
      targetResource: target,
      confidence: 95,
      reasoning: 'Resource failed 3 consecutive auto-remediation restart attempts within a 15-minute window. Circuit breaker triggered.',
      proposedAction: 'ESCALATE_TO_HUMAN',
      status: 'escalated',
      humanSummary,
      attempts: [
        { timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), action: 'RESTART_POD', outcome: 'failed' },
        { timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), action: 'RESTART_POD', outcome: 'failed' },
        { timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), action: 'RESTART_POD', outcome: 'failed' }
      ]
    });

    await sendFormattedNotification(humanSummary, incident.id, 'CIRCUIT_BREAKER_ESCALATED');

    res.json({ message: 'Simulated circuit breaker escalation created', incident });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to simulate circuit breaker' });
  }
});
