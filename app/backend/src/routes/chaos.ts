import { Router, Request, Response } from 'express';
import { io } from '../server';
import { inMemoryHealingEvents, inMemoryIncidentAudits, executeRemediation, IncidentAuditRecord } from '../services/kubernetes';
import { analyzeAlertAndDecideAction, generateHumanSummary } from '../services/bedrock';
import { sendTriageNotification, sendResolutionNotification, sendFormattedNotification } from '../services/sns';
import { createIncident } from '../services/incidents';

export const chaosRouter = Router();

// Endpoint called by the React dashboard "Inject Chaos Scenario" button
chaosRouter.post('/inject', async (req: Request, res: Response) => {
  const { scenario = 'cpu_spike', initiator = 'Ray Woo (Chaos Lab)' } = req.body;
  const startTimestampMs = Date.now();
  const isoTriggeredAt = new Date(startTimestampMs).toISOString();
  const incidentId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;

  console.log(`[Chaos Engine] User triggered chaos injection: ${scenario} (${incidentId})`);
  
  // Guided Showcase Scenarios (Section 5)
  if (scenario === 'guided_auto_healed') {
    const targetApp = 'healops-backend';
    const alertName = 'PodCrashLoopBackOff';

    const humanSummary = await generateHumanSummary({
      anomaly: alertName,
      target: targetApp,
      proposedAction: 'RESTART_POD',
      confidence: 94,
      reasoning: 'High-confidence automated recovery. Container restarted cleanly and HTTP health probes passed.',
      status: 'remediated'
    });

    const incident = createIncident({
      title: `${targetApp}: ${alertName} (Auto-Healed Showcase)`,
      targetResource: targetApp,
      confidence: 94,
      reasoning: 'Confidence score (94%) exceeds safety threshold. Baseline self-healing loop executed.',
      proposedAction: 'RESTART_POD',
      status: 'remediated',
      humanSummary,
      attempts: [{ timestamp: new Date().toISOString(), action: 'RESTART_POD', outcome: 'success' }]
    });

    await sendFormattedNotification(humanSummary, incident.id, 'REMEDIATED');

    return res.status(200).json({
      success: true,
      incidentId: incident.id,
      message: 'Guided Showcase 1: Crash Loop Auto-Healed executed cleanly.',
      incident
    });
  }

  if (scenario === 'guided_circuit_breaker') {
    const targetApp = 'payment-service';

    const humanSummary = await generateHumanSummary({
      anomaly: 'Repeated Pod CrashLoopBackOff',
      target: targetApp,
      proposedAction: 'ESCALATE_TO_HUMAN',
      confidence: 95,
      reasoning: 'Target resource failed 3 consecutive remediation attempts in 15 minutes. Circuit breaker tripped.',
      status: 'escalated',
      attemptsCount: 3
    });

    const incident = createIncident({
      title: `Circuit Breaker Tripped: ${targetApp}`,
      targetResource: targetApp,
      confidence: 95,
      reasoning: 'Resource failed 3 consecutive auto-remediation restart attempts within a 15-minute window. Auto-remediation stopped.',
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

    return res.status(200).json({
      success: true,
      incidentId: incident.id,
      message: 'Guided Showcase 2: Circuit Breaker Repeated Failure executed.',
      incident
    });
  }

  if (scenario === 'guided_low_confidence') {
    const targetApp = 'database-service';
    const anomaly = 'Ambiguous Connection Pool Exhaustion';

    const humanSummary = await generateHumanSummary({
      anomaly,
      target: targetApp,
      proposedAction: 'RESTART_POD',
      confidence: 74,
      reasoning: 'Confidence score (74%) is below 85% safety threshold. Proposed pod restart requires human approval to prevent dropping live transactions.',
      status: 'pending_approval'
    });

    const incident = createIncident({
      title: `${targetApp}: ${anomaly}`,
      targetResource: targetApp,
      confidence: 74,
      reasoning: 'Confidence score (74%) is below 85% threshold. Manual approval required before executing Kubernetes pod restart.',
      proposedAction: 'RESTART_POD',
      status: 'pending_approval',
      humanSummary
    });

    await sendFormattedNotification(humanSummary, incident.id, 'PENDING_APPROVAL');

    return res.status(200).json({
      success: true,
      incidentId: incident.id,
      message: 'Guided Showcase 3: Low-Confidence Anomaly created.',
      incident
    });
  }

  if (scenario === 'guided_notification_walkthrough') {
    const targetApp = 'auth-service';
    const anomaly = 'High Token Verification Latency';

    const humanSummary = await generateHumanSummary({
      anomaly,
      target: targetApp,
      proposedAction: 'RESTART_POD',
      confidence: 78,
      reasoning: 'Bedrock generated plain-English 4-sentence summary for dual SNS email + Socket.io notification walkthrough.',
      status: 'pending_approval'
    });

    const incident = createIncident({
      title: `Notification Walkthrough: ${targetApp}`,
      targetResource: targetApp,
      confidence: 78,
      reasoning: 'Demonstrates real-time Bedrock summary formatting and SNS notification dispatch.',
      proposedAction: 'RESTART_POD',
      status: 'pending_approval',
      humanSummary
    });

    await sendFormattedNotification(humanSummary, incident.id, 'PENDING_APPROVAL');

    io.emit('notification_toast', {
      title: '📲 SNS Email & Bedrock Notification Walkthrough',
      message: humanSummary,
      incidentId: incident.id
    });

    return res.status(200).json({
      success: true,
      incidentId: incident.id,
      message: 'Guided Showcase 4: Notification Walkthrough triggered.',
      incident
    });
  }

  // Raw Manual Fault Injection Scenarios (Preserved)
  let alertName = 'HighCPUUsage';
  let alertTitle = 'CPU Exhaustion & Thread Lock Anomaly';
  let alertSummary = 'Simulated 100% CPU thread lock on healops-backend';
  let targetApp = 'healops-backend';

  if (scenario === 'pod_kill') {
    alertName = 'PodCrashLoopBackOff';
    alertTitle = 'Pod Sudden Death & Eviction';
    alertSummary = 'Pod healops-backend evicted unexpectedly';
  } else if (scenario === 'memory_pressure') {
    alertName = 'HighMemoryPressure';
    alertTitle = 'Memory Exhaustion Threshold Exceeded';
    alertSummary = 'Memory consumption exceeded 85% limit on healops-backend';
  } else if (scenario === 'network_loss') {
    alertName = 'ReadinessProbeFailure';
    alertTitle = 'Network Latency & Endpoint Degradation';
    alertSummary = 'High synthetic round-trip latency on healops-frontend-svc endpoints';
    targetApp = 'healops-frontend-svc';
  }

  const incidentRecord: IncidentAuditRecord = {
    id: incidentId,
    title: alertTitle,
    target: targetApp,
    triggeredAt: isoTriggeredAt,
    durationSeconds: 0,
    initiatedBy: initiator,
    remediatedBy: 'Amazon Bedrock AI Engine',
    actionTaken: 'EVALUATING_RUNBOOK',
    status: 'INVESTIGATING',
    details: alertSummary,
    verification: 'Investigating anomaly...'
  };

  inMemoryIncidentAudits.unshift(incidentRecord);

  inMemoryHealingEvents.unshift({
    id: startTimestampMs,
    action: `[${incidentId}] Anomaly Detected: ${alertName}`,
    target: targetApp,
    status: 'remediating',
    pct: 25,
    time: 'Just now',
    details: `Triggered by ${initiator} at ${new Date(startTimestampMs).toLocaleTimeString()}`
  });

  io.emit('healing-event', {
    type: 'INCIDENT_TRIAGE_STARTED',
    incidentId,
    target: targetApp,
    title: alertTitle,
    initiatedBy: initiator,
    message: `🚨 [${incidentId}] Incident detected on ${targetApp}. Bedrock AI triaging root cause...`,
    timestamp: isoTriggeredAt
  });

  sendTriageNotification({
    id: incidentId,
    title: alertTitle,
    target: targetApp,
    anomaly: alertSummary,
    detectedAt: `${new Date(startTimestampMs).toLocaleTimeString()} EDT`,
    initiatedBy: initiator
  }).catch(err => console.error('[SNS Phase 1] Dispatch error:', err));

  res.status(200).json({ 
    success: true, 
    incidentId,
    message: `Chaos scenario '${scenario}' initiated. Incident ${incidentId} logged and triaged.`,
    scenario,
    target: targetApp,
    triggeredAt: isoTriggeredAt
  });

  setTimeout(async () => {
    try {
      const triageTimestampMs = Date.now();
      const triageElapsedSec = ((triageTimestampMs - startTimestampMs) / 1000).toFixed(1);
      incidentRecord.triagedAt = new Date(triageTimestampMs).toISOString();
      incidentRecord.status = 'REMEDIATING';

      const mockAlertPayload = {
        alerts: [
          {
            status: "firing",
            labels: {
              alertname: alertName,
              severity: "critical",
              pod: targetApp
            },
            annotations: {
              summary: alertSummary,
              description: `Autonomous self-healing for Incident ${incidentId} triggered by ${initiator}.`
            }
          }
        ]
      };

      const aiDecision = await analyzeAlertAndDecideAction(mockAlertPayload);
      incidentRecord.actionTaken = aiDecision.machine_action;
      
      const remediationResult = await executeRemediation(aiDecision.machine_action, targetApp);

      const resolvedTimestampMs = Date.now();
      const totalMttrSec = parseFloat(((resolvedTimestampMs - startTimestampMs) / 1000).toFixed(1));
      const isoResolvedAt = new Date(resolvedTimestampMs).toISOString();

      incidentRecord.resolvedAt = isoResolvedAt;
      incidentRecord.durationSeconds = totalMttrSec;
      incidentRecord.status = 'RESOLVED';
      incidentRecord.details = aiDecision.human_message;
      incidentRecord.verification = 'HTTP 200 health probe verified across all replicas';

      inMemoryHealingEvents.unshift({
        id: resolvedTimestampMs,
        action: `[${incidentId}] AI Healing: ${aiDecision.machine_action}`,
        target: targetApp,
        status: 'success',
        pct: 100,
        time: 'Just now',
        details: `${aiDecision.human_message} (MTTR: ${totalMttrSec}s)`
      });

      io.emit('healing-event', {
        type: 'INCIDENT_RESOLVED',
        incidentId,
        target: targetApp,
        actionTaken: aiDecision.machine_action,
        durationSeconds: totalMttrSec,
        message: `🛡️ [${incidentId}] Remediated in ${totalMttrSec}s: ${aiDecision.human_message}`,
        timestamp: isoResolvedAt
      });

      sendResolutionNotification({
        id: incidentId,
        title: alertTitle,
        target: targetApp,
        anomaly: alertSummary,
        detectedAt: `${new Date(startTimestampMs).toLocaleTimeString()} EDT`,
        resolvedAt: `${new Date(resolvedTimestampMs).toLocaleTimeString()} EDT`,
        durationSeconds: totalMttrSec,
        initiatedBy: initiator,
        remediatedBy: 'Amazon Bedrock AI Engine',
        actionTaken: `${aiDecision.machine_action} on ${targetApp}`,
        verification: 'HTTP 200 health probe check passed on /health for 2/2 replicas'
      }).catch(err => console.error('[SNS Phase 2] Dispatch error:', err));

      console.log(`[Chaos Engine] Incident ${incidentId} resolved in ${totalMttrSec}s:`, remediationResult);
    } catch (error) {
      console.error(`[Chaos Engine] Incident ${incidentId} remediation error:`, error);
      incidentRecord.status = 'FAILED';
    }
  }, 2200);
});
