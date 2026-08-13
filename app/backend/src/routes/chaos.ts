import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import path from 'path';

export const chaosRouter = Router();

// Endpoint called by the React dashboard "Inject Chaos" button
chaosRouter.post('/inject', (req: Request, res: Response) => {
  console.log('User triggered chaos injection!');
  
  // Return 200 OK immediately so the frontend knows the request was received.
  res.status(200).json({ message: 'Chaos injection initiated. Prometheus is watching...' });
  
  // Simulate the delay it takes for Prometheus to detect the crash and fire the webhook
  setTimeout(async () => {
    console.log('Simulating Prometheus Alertmanager firing webhook...');
    try {
      const mockAlertPayload = {
        alerts: [
          {
            status: "firing",
            labels: {
              alertname: "HighCPUUsage",
              severity: "critical",
              pod: "healops-backend-xyz123"
            },
            annotations: {
              summary: "Pod healops-backend-xyz123 is using 95% CPU",
              description: "The backend pod has exceeded CPU limits and is crashing."
            }
          }
        ]
      };

      // Send the mock alert to our own webhook endpoint to trigger the AI
      await fetch('http://localhost:4000/api/webhook/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockAlertPayload)
      });
      
    } catch (error) {
      console.error('Failed to trigger mock webhook:', error);
    }
  }, 3000); // 3 second delay
});
