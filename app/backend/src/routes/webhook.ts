import { Router, Request, Response } from 'express';
import { analyzeAlertAndDecideAction } from '../services/bedrock';
import { executeRemediation } from '../services/kubernetes';
import { sendNotification } from '../services/sns';
import { io } from '../server';

export const webhookRouter = Router();

// This endpoint is called by Prometheus Alertmanager
webhookRouter.post('/alert', async (req: Request, res: Response) => {
  console.log('Received Webhook from Alertmanager:', JSON.stringify(req.body, null, 2));

  const alerts = req.body.alerts;
  if (!alerts || alerts.length === 0) {
    return res.status(200).send('No alerts found in payload');
  }

  // Acknowledge receipt to Alertmanager quickly so it doesn't timeout
  res.status(202).send('Alert received and processing initiated.');

  try {
    // 1. Analyze the alert with Amazon Bedrock
    const aiDecision = await analyzeAlertAndDecideAction(req.body);
    
    console.log('AI Decision:', aiDecision);

    // Emit event to Frontend via WebSocket so the UI updates instantly!
    io.emit('remediation_event', {
      timestamp: new Date().toISOString(),
      message: aiDecision.human_message,
      type: 'remediation'
    });

    // 2. Safely execute the machine action via Kubernetes SDK
    const remediationResult = await executeRemediation(aiDecision.machine_action, 'healops-backend');
    console.log('Remediation Result:', remediationResult);

    // 3. Send the human message via AWS SNS to alert the engineering team
    await sendNotification(aiDecision.human_message);

    
    // We would also save this to a database (like DynamoDB or Firestore) so the React UI can fetch it,
    // or emit it via WebSockets for real-time UI updates!

  } catch (error) {
    console.error('Error during self-healing workflow:', error);
    // Even if it fails, alert the humans!
    await sendNotification(`CRITICAL: Self-healing workflow failed! Manual intervention required. Error: ${error}`);
  }
});
