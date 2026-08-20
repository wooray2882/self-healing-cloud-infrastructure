import { Router, Request, Response } from 'express';
import { analyzeAlertAndDecideAction, generateHumanSummary } from '../services/bedrock';
import { executeRemediation, getAttemptsCount, recordRemediationAttempt } from '../services/kubernetes';
import { sendFormattedNotification } from '../services/sns';
import { createIncident } from '../services/incidents';
import { io } from '../server';

export const webhookRouter = Router();

// Endpoint called by Prometheus Alertmanager
webhookRouter.post('/alert', async (req: Request, res: Response) => {
  console.log('Received Webhook from Alertmanager:', JSON.stringify(req.body, null, 2));

  const alerts = req.body.alerts;
  if (!alerts || alerts.length === 0) {
    return res.status(200).send('No alerts found in payload');
  }

  res.status(202).send('Alert received and processing initiated.');

  try {
    const alertName = alerts[0]?.labels?.alertname || 'HighCPUUsage';
    const target = alerts[0]?.labels?.pod || alerts[0]?.labels?.app || 'healops-backend';

    // 1. Analyze alert with Bedrock AI
    const aiDecision = await analyzeAlertAndDecideAction(req.body);
    console.log('AI Decision:', aiDecision);

    const confidence = aiDecision.confidence || 90;
    const reasoning = aiDecision.reasoning || aiDecision.human_message;
    const proposedAction = aiDecision.machine_action || 'RESTART_POD';

    // Check Circuit Breaker (3 attempts in 15 mins)
    const recentAttempts = getAttemptsCount(target);
    if (recentAttempts >= 3) {
      console.warn(`[CIRCUIT BREAKER] Target '${target}' has failed ${recentAttempts} attempts in 15 mins. Stopping auto-remediation.`);

      const humanSummary = await generateHumanSummary({
        anomaly: alertName,
        target,
        proposedAction,
        confidence,
        reasoning: `Circuit breaker tripped: Target resource ${target} failed ${recentAttempts} remediation attempts in the last 15 minutes.`,
        status: 'escalated',
        attemptsCount: recentAttempts
      });

      const incident = createIncident({
        title: `Circuit Breaker Tripped: ${target}`,
        targetResource: target,
        confidence,
        reasoning: `Resource ${target} failed ${recentAttempts} consecutive remediation attempts in a 15-minute window. Auto-remediation stopped.`,
        proposedAction: 'ESCALATE_TO_HUMAN',
        status: 'escalated',
        humanSummary
      });

      await sendFormattedNotification(humanSummary, incident.id, 'CIRCUIT_BREAKER_ESCALATED');
      return;
    }

    // Check Low Confidence (<85%) Threshold
    if (confidence < 85) {
      console.warn(`[LOW CONFIDENCE] Confidence (${confidence}%) is below 85% safety threshold. Creating pending_approval incident.`);

      const humanSummary = await generateHumanSummary({
        anomaly: alertName,
        target,
        proposedAction,
        confidence,
        reasoning,
        status: 'pending_approval'
      });

      const incident = createIncident({
        title: `${target}: ${alertName}`,
        targetResource: target,
        confidence,
        reasoning,
        proposedAction,
        status: 'pending_approval',
        humanSummary
      });

      await sendFormattedNotification(humanSummary, incident.id, 'PENDING_APPROVAL');
      return;
    }

    // High Confidence (>=85%): Execute Auto-Remediation
    console.log(`[AUTO REMEDIATE] Confidence (${confidence}%) >= 85%. Executing ${proposedAction}...`);
    recordRemediationAttempt(target);

    const remediationResult = await executeRemediation(proposedAction, target);
    console.log('Remediation Result:', remediationResult);

    const humanSummary = await generateHumanSummary({
      anomaly: alertName,
      target,
      proposedAction,
      confidence,
      reasoning,
      status: 'remediated'
    });

    const incident = createIncident({
      title: `${target}: ${alertName} Recovered`,
      targetResource: target,
      confidence,
      reasoning,
      proposedAction,
      status: 'remediated',
      humanSummary,
      attempts: [{ timestamp: new Date().toISOString(), action: proposedAction, outcome: 'success' }]
    });

    await sendFormattedNotification(humanSummary, incident.id, 'REMEDIATED');

    io.emit('remediation_event', {
      timestamp: new Date().toISOString(),
      message: humanSummary,
      type: 'remediation'
    });

  } catch (error) {
    console.error('Error during self-healing workflow:', error);
    await sendFormattedNotification(
      `CRITICAL: Self-healing workflow failed! Manual intervention required. Error: ${error}`,
      'INC-ERROR',
      'CIRCUIT_BREAKER_ESCALATED'
    );
  }
});
