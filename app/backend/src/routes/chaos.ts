import { Router, Request, Response } from 'express';
import { io } from '../server';
import { inMemoryHealingEvents, executeRemediation } from '../services/kubernetes';
import { analyzeAlertAndDecideAction } from '../services/bedrock';

export const chaosRouter = Router();

// Endpoint called by the React dashboard "Inject Chaos Scenario" button
chaosRouter.post('/inject', async (req: Request, res: Response) => {
  const { scenario = 'cpu_spike' } = req.body;
  console.log(`[Chaos Engine] User triggered chaos injection: ${scenario}`);
  
  const timestamp = new Date().toISOString();
  let alertName = 'HighCPUUsage';
  let alertSummary = 'Simulated CPU Thread Lock on healops-backend';
  let targetApp = 'healops-backend';

  if (scenario === 'pod_kill') {
    alertName = 'PodCrashLoopBackOff';
    alertSummary = 'Pod healops-backend evicted unexpectedly';
  } else if (scenario === 'memory_pressure') {
    alertName = 'HighMemoryPressure';
    alertSummary = 'Memory consumption exceeded 85% threshold on healops-backend';
  } else if (scenario === 'network_loss') {
    alertName = 'ReadinessProbeFailure';
    alertSummary = 'High network latency on healops-frontend-svc endpoints';
    targetApp = 'healops-frontend-svc';
  }

  // Record chaos injection in live event stream
  inMemoryHealingEvents.unshift({
    id: Date.now(),
    action: `Fault Injected: ${alertName}`,
    target: targetApp,
    status: 'remediating',
    pct: 45,
    time: 'Just now',
    details: alertSummary
  });

  // Emit event via WebSocket to all connected dashboard clients
  io.emit('healing-event', {
    type: 'CHAOS_FAULT_INJECTED',
    message: `[Chaos Lab] Injected fault: ${alertName} on ${targetApp}`,
    timestamp
  });

  // Return 200 OK immediately so frontend receives instant confirmation
  res.status(200).json({ 
    success: true, 
    message: `Chaos scenario '${scenario}' initiated. Automated remediation in progress.`,
    scenario,
    target: targetApp
  });

  // Trigger self-healing loop asynchronously
  setTimeout(async () => {
    try {
      console.log(`[Chaos Engine] Triggering AI Self-Healing workflow for ${alertName}...`);
      
      const mockAlertPayload = {
        alerts: [
          {
            status: "firing",
            labels: {
              alertname: alertName,
              severity: "critical",
              pod: "healops-backend"
            },
            annotations: {
              summary: alertSummary,
              description: `Autonomous self-healing triggered by Chaos Lab scenario ${scenario}.`
            }
          }
        ]
      };

      // 1. Analyze with Bedrock AI
      const aiDecision = await analyzeAlertAndDecideAction(mockAlertPayload);
      
      // 2. Execute machine action safely
      const remediationResult = await executeRemediation(aiDecision.machine_action, 'healops-backend');

      // 3. Record remediation in event stream
      inMemoryHealingEvents.unshift({
        id: Date.now() + 1,
        action: `AI Autonomous Healing: ${aiDecision.machine_action}`,
        target: targetApp,
        status: 'success',
        pct: 100,
        time: 'Just now',
        details: aiDecision.human_message
      });

      // 4. Emit recovery event via WebSockets
      io.emit('healing-event', {
        type: 'AUTONOMOUS_HEALING_SUCCESS',
        message: `[Bedrock AI] ${aiDecision.human_message}`,
        timestamp: new Date().toISOString()
      });

      console.log(`[Chaos Engine] Remediation finished:`, remediationResult);
    } catch (error) {
      console.error('[Chaos Engine] Remediation error:', error);
    }
  }, 2000);
});
