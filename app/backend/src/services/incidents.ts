import { executeRemediation } from './kubernetes';
import { io } from '../server';

export interface IncidentAttempt {
  timestamp: string;
  action: string;
  outcome: 'success' | 'failed';
}

export interface Incident {
  id: string;
  title: string;
  targetResource: string;
  confidence: number;
  reasoning: string;
  proposedAction: string;
  status: 'pending_approval' | 'remediated' | 'escalated' | 'rejected' | 'resolved';
  humanSummary: string;
  attempts: IncidentAttempt[];
  createdAt: string;
  updatedAt: string;
}

// In-memory incidents repository
const incidentsStore: Incident[] = [
  {
    id: 'INC-1050',
    title: 'Payment Gateway Pool Expiration',
    targetResource: 'healops-backend',
    confidence: 72,
    reasoning: 'Confidence score (72%) is below the 85% auto-remediation safety threshold. Proposed action requires human authorization to avoid thread locks.',
    proposedAction: 'RESTART_POD',
    status: 'pending_approval',
    humanSummary: 'The payment-service pod experienced a database connection pool timeout. Bedrock suggested a pod restart, but confidence (72%) was below the 85% safety threshold. Human approval is required to verify database health before executing recovery.',
    attempts: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  },
  {
    id: 'INC-1049',
    title: 'High CPU Thread Lock Anomaly',
    targetResource: 'healops-backend',
    confidence: 94,
    reasoning: 'High CPU thread lock detected. Automated pod restart executed cleanly.',
    proposedAction: 'RESTART_POD',
    status: 'resolved',
    humanSummary: 'Pod CPU utilization spiked to 98% due to a thread lock. AI Engine automatically executed a rolling pod restart. All 2/2 pod replicas recovered with healthy readiness probes.',
    attempts: [
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        action: 'RESTART_POD',
        outcome: 'success'
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 44).toISOString()
  }
];

let incidentCounter = 1051;

export function createIncident(data: {
  title: string;
  targetResource: string;
  confidence: number;
  reasoning: string;
  proposedAction: string;
  status: 'pending_approval' | 'remediated' | 'escalated' | 'rejected' | 'resolved';
  humanSummary: string;
  attempts?: IncidentAttempt[];
}): Incident {
  const incident: Incident = {
    id: `INC-${incidentCounter++}`,
    title: data.title,
    targetResource: data.targetResource,
    confidence: data.confidence,
    reasoning: data.reasoning,
    proposedAction: data.proposedAction,
    status: data.status,
    humanSummary: data.humanSummary,
    attempts: data.attempts || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  incidentsStore.unshift(incident);

  try {
    io.emit('incident_created', incident);
  } catch (err) {
    console.warn('[Socket.io] Failed to emit incident_created event:', err);
  }

  return incident;
}

export function getIncidents(): Incident[] {
  return incidentsStore;
}

export function getIncidentById(id: string): Incident | undefined {
  return incidentsStore.find(inc => inc.id === id);
}

export async function approveIncident(id: string): Promise<Incident> {
  const incident = getIncidentById(id);
  if (!incident) throw new Error(`Incident ${id} not found`);

  if (incident.status === 'resolved' || incident.status === 'remediated') {
    return incident;
  }

  console.log(`[Incidents] Executing approved action '${incident.proposedAction}' for incident ${id} on target ${incident.targetResource}`);
  
  await executeRemediation(incident.proposedAction, incident.targetResource);
  
  incident.attempts.push({
    timestamp: new Date().toISOString(),
    action: incident.proposedAction,
    outcome: 'success'
  });
  
  incident.status = 'remediated';
  incident.updatedAt = new Date().toISOString();

  try {
    io.emit('incident_updated', incident);
  } catch (err) {
    console.warn('[Socket.io] Failed to emit incident_updated event:', err);
  }

  return incident;
}

export function rejectIncident(id: string): Incident {
  const incident = getIncidentById(id);
  if (!incident) throw new Error(`Incident ${id} not found`);

  incident.status = 'rejected';
  incident.updatedAt = new Date().toISOString();

  try {
    io.emit('incident_updated', incident);
  } catch (err) {
    console.warn('[Socket.io] Failed to emit incident_updated event:', err);
  }

  return incident;
}

export function recordAttempt(id: string, action: string, outcome: 'success' | 'failed'): Incident | undefined {
  const incident = getIncidentById(id);
  if (!incident) return undefined;

  incident.attempts.push({
    timestamp: new Date().toISOString(),
    action,
    outcome
  });
  incident.updatedAt = new Date().toISOString();

  try {
    io.emit('incident_updated', incident);
  } catch (err) {
    console.warn('[Socket.io] Failed to emit incident_updated event:', err);
  }

  return incident;
}
